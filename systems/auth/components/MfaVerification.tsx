import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User } from '../../../shared/types';
import { ShieldCheck, ArrowRight, Loader2, RefreshCw, Info, KeyRound } from 'lucide-react';

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
    setError(false);
    const sentCode = await authService.sendMfaCode(user.email || 'user');
    setActualCode(sentCode);
    setIsSending(false);
  };

  const handleInput = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d+$/.test(value)) return;

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
      // We don't wipe the code immediately so user can see what they typed
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-scale-in text-center relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 -mr-16 -mt-16 rounded-full opacity-50"></div>
         
         <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-blue-100 relative z-10">
            <ShieldCheck size={40} />
         </div>
         
         <h2 className="text-2xl font-black text-slate-900 mb-2">التحقق الثنائي (MFA)</h2>
         <p className="text-slate-500 font-bold text-sm mb-8 leading-relaxed">
           لزيادة الأمان، قمنا بإرسال رمز تحقق إلى بريدك الإلكتروني <br/>
           <span className="text-slate-800 font-black">{user.email}</span>
         </p>

         <div className="flex gap-2 justify-center mb-8" dir="ltr">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`mfa-${idx}`}
                type="text"
                className={`w-12 h-14 rounded-xl border-2 text-center text-xl font-black outline-none transition-all ${
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

         {error && <p className="text-red-500 text-xs font-bold mb-6 animate-pulse">الرمز الذي أدخلته غير صحيح. يرجى التأكد من الرمز الحالي.</p>}

         <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase">
               <Info size={14} /> رمز الاختبار الحالي
            </div>
            {isSending ? (
               <Loader2 className="animate-spin text-indigo-400" size={20} />
            ) : (
               <div className="flex items-center gap-3">
                  <span className="text-2xl font-black tracking-[0.3em] text-indigo-900">{actualCode}</span>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(actualCode); }}
                    className="p-1.5 bg-white rounded-lg text-indigo-500 hover:text-indigo-700 shadow-sm border border-indigo-100"
                    title="نسخ الرمز"
                  >
                    <KeyRound size={14} />
                  </button>
               </div>
            )}
         </div>

         <button 
           onClick={handleVerify}
           disabled={isLoading || code.some(c => !c)}
           className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
         >
            {isLoading ? <Loader2 className="animate-spin" /> : 'تحقق ودخول'}
         </button>

         <div className="mt-8 flex justify-center gap-8 text-xs font-black">
            <button onClick={sendCode} disabled={isSending} className="text-slate-500 hover:text-blue-600 flex items-center gap-2 transition-colors">
               {isSending ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14} />} إعادة الإرسال
            </button>
            <button onClick={onCancel} className="text-rose-500 hover:text-rose-700 transition-colors">
               تسجيل الخروج
            </button>
         </div>
      </div>
    </div>
  );
};

export default MfaVerification;