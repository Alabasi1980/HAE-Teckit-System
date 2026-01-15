import { User } from '../../../shared/types';
import { MOCK_USERS } from '../../../shared/constants';

/**
 * @file authService.ts
 * @description محرك المصادقة. تم تحديثه ليعمل بشكل متوافق مع نظام الـ Providers الجديد.
 */

const getStoredUsers = (): User[] => {
  const d = localStorage.getItem('enjaz_v2_users');
  return d ? JSON.parse(d) : MOCK_USERS;
};

export const authService = {
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getStoredUsers();
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (user) {
      // فحص كلمة المرور - تجريبي فقط
      if (password === '123456') { 
        return { success: true, user };
      }
      return { success: false, error: 'كلمة المرور غير صحيحة' };
    }
    
    return { success: false, error: 'لم يتم العثور على حساب بهذا البريد' };
  },

  sendMfaCode: async (email: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[MFA] Code for ${email}: ${code}`);
    return code;
  },

  verifyMfa: async (inputCode: string, actualCode: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return inputCode === actualCode;
  },

  createSession: (user: User) => {
    localStorage.setItem('enjaz_session_user', JSON.stringify(user));
    localStorage.setItem('enjaz_session_token', `token-${Date.now()}`);
  },

  getSession: (): User | null => {
    const stored = localStorage.getItem('enjaz_session_user');
    return stored ? JSON.parse(stored) : null;
  },

  logout: () => {
    localStorage.removeItem('enjaz_session_user');
    localStorage.removeItem('enjaz_session_token');
    window.location.reload();
  }
};