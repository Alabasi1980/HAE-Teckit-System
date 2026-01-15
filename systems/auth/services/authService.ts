
import { User } from '../../../shared/types';
import { usersRepo } from '../../../shared/services/usersRepo';

export const authService = {
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = await usersRepo.getAll();
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (user) {
      // Mock password check - in real app, hash checking happens server-side
      if (password === '123456') { 
        return { success: true, user };
      }
      return { success: false, error: 'كلمة المرور غير صحيحة' };
    }
    
    return { success: false, error: 'لم يتم العثور على حساب بهذا البريد' };
  },

  sendMfaCode: async (email: string): Promise<string> => {
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`[MFA System] Code sent to ${email}: 592834`);
    return '592834'; // Mock code for demo
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
