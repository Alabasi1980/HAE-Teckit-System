
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../../../shared/types';
import { Lock, Mail, ArrowRight, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('ahmed.e@enjaz-one.com');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await authService.login(email, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'فشل تسجيل الدخول');
      }
    } catch (e) {
      setError('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900 overflow-hidden" dir="rtl">
      {/* Visual Side */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900 opacity-90 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover"
          alt="Construction Site"
        />
        <div className="relative z-20 text-white p-12 max-w-2xl">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/30">
              <ShieldCheck size={40} />
           </div>
           <h1 className="text-5xl font-black mb-6 leading-tight">المنصة الموحدة للعمليات الإنشائية</h1>
           <p className="text-lg text-blue-100 font-bold leading-relaxed opacity-90">
             قم بإدارة المشاريع، الأصول، والفرق الميدانية من مكان واحد آمن ومحمي بأحدث تقنيات التشفير.
           </p>
           <div className="mt-12 flex gap-4">
              <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-xs font-bold border border-white/20">ISO 27001 Certified</div>
              <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-xs font-bold border border-white/20">End-to-End Encryption</div>
           </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
           <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-slate-900">تسجيل الدخول</h2>
              <p className="text-slate-500 font-bold text-sm mt-2">مرحباً بك مجدداً في Enjaz One</p>
           </div>

           {error && (
             <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-scale-in">
                <AlertCircle size={20} />
                <span className="text-sm font-bold">{error}</span>
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                 <label className="block text-xs font-black text-slate-700 uppercase mb-2 mr-1">البريد الإلكتروني</label>
                 <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="email" 
                      className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-black text-slate-700 uppercase mb-2 mr-1">كلمة المرور</label>
                 <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="password" 
                      className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                 </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-600 w-4 h-4" />
                    <span>تذكر هذا الجهاز</span>
                 </label>
                 <a href="#" className="text-blue-600 hover:underline">نسيت كلمة المرور؟</a>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:scale-[1.02] transition-transform shadow-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
              >
                 {isLoading ? <Loader2 className="animate-spin" /> : <>دخول آمن <ArrowRight size={18} className="rotate-180" /></>}
              </button>
           </form>

           <div className="mt-8 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enjaz One v2.0 Enterprise</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
