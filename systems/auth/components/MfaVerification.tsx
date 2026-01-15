
import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User } from '../../../shared/types';
import { ShieldCheck, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

interface MfaVerificationProps {
  user: User;
  onVerified: () => void;
  onCancel: () => void;
}

const MfaVerification: React.FC<MfaVerificationProps> = ({ user, onVerified, onCancel }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [actualCode, setActualCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    sendCode();
  }, []);

  const sendCode = async () => {
    setIsSending(true);
    const sentCode = await authService.sendMfaCode(user.email || 'user');
    setActualCode(sentCode);
    setIsSending(false);
    // For demo purposes, auto-fill suggestion in alert or console is handled by service
    // In a real app, user checks email.
    // We will show a hint here for testing convenience
    setTimeout(() => alert(`Demo OTP for ${user.email}: ${sentCode}`), 500); 
  };

  const handleInput = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`mfa-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`mfa-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    setError(false);
    const fullCode = code.join('');
    const isValid = await authService.verifyMfa(fullCode, actualCode);
    
    if (isValid) {
      onVerified();
    } else {
      setError(true);
      setCode(['', '', '', '', '', '']);
      document.getElementById('mfa-0')?.focus();
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-scale-in text-center">
         <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-blue-100">
            <ShieldCheck size={40} />
         </div>
         
         <h2 className="text-2xl font-black text-slate-900 mb-2">التحقق الثنائي (MFA)</h2>
         <p className="text-slate-500 font-bold text-sm mb-8 leading-relaxed">
           لزيادة الأمان، قمنا بإرسال رمز تحقق إلى بريدك الإلكتروني <br/>
           <span className="text-slate-800">{user.email}</span>
         </p>

         <div className="flex gap-2 justify-center mb-8" dir="ltr">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`mfa-${idx}`}
                type="text"
                className={`w-12 h-14 rounded-xl border-2 text-center text-xl font-bold outline-none transition-all ${
                  error 
                    ? 'border-red-200 bg-red-50 text-red-600' 
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white text-slate-800'
                }`}
                value={digit}
                onChange={(e) => handleInput(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                maxLength={1}
              />
            ))}
         </div>

         {error && <p className="text-red-500 text-xs font-bold mb-6 animate-pulse">الرمز غير صحيح، حاول مرة أخرى.</p>}

         <button 
           onClick={handleVerify}
           disabled={isLoading || code.some(c => !c)}
           className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
         >
            {isLoading ? <Loader2 className="animate-spin" /> : 'تحقق ودخول'}
         </button>

         <div className="mt-6 flex justify-center gap-6 text-xs font-bold">
            <button onClick={sendCode} disabled={isSending} className="text-slate-500 hover:text-blue-600 flex items-center gap-1">
               {isSending ? <Loader2 size={12} className="animate-spin"/> : <RefreshCw size={12} />} إعادة إرسال الرمز
            </button>
            <button onClick={onCancel} className="text-red-500 hover:text-red-700">
               تسجيل خروج
            </button>
         </div>
      </div>
    </div>
  );
};

export default MfaVerification;
