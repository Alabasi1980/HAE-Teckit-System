import React, { useState, useEffect } from 'react';
import { useData } from '../../../context/DataContext';
import { AutomationRule, NotificationPreferences } from '../../../shared/types';
import { 
  Zap, Shield, ToggleLeft, ToggleRight, Settings as SettingsIcon, 
  Sparkles, Globe, ShieldAlert, Cpu, Database, Save, RefreshCcw, CheckCircle2,
  Lock, Calendar, DollarSign, BellRing, Smartphone, Mail, Moon, Clock
} from 'lucide-react';

type Tab = 'automation' | 'ai' | 'notifications' | 'regional' | 'security';

const SettingsView: React.FC = () => {
  const data = useData();
  const [activeTab, setActiveTab] = useState<Tab>('automation');
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences | null>(null);
  
  const [aiConfig, setAiConfig] = useState({
    model: 'gemini-3-pro-preview',
    tone: 'Technical/Engineer',
    autoSafetyCheck: true
  });

  useEffect(() => {
    setRules(data.automation.getRules());
    setNotifPrefs(data.notifications.getPreferences());
  }, [data]);

  const handleToggleRule = (id: string) => {
    const updated = data.automation.toggleRule(id);
    setRules(updated);
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    if (notifPrefs) {
      data.notifications.savePreferences(notifPrefs);
    }
    
    setTimeout(() => {
      setIsSaving(false);
      alert("تم حفظ إعدادات المنصة بنجاح.");
    }, 1000);
  };

  const toggleChannel = (type: 'critical' | 'mentions' | 'updates', channel: 'email' | 'inApp' | 'push') => {
    if (!notifPrefs) return;
    setNotifPrefs(prev => {
      if (!prev) return null;
      return {
        ...prev,
        channels: {
          ...prev.channels,
          [type]: {
            ...prev.channels[type],
            [channel]: !prev.channels[type][channel]
          }
        }
      };
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl">
              <SettingsIcon size={24} />
            </div>
            إعدادات المنصة المركزية
          </h2>
          <p className="text-slate-500 font-bold mt-2 pr-2">تحكم في محركات الأتمتة، الذكاء الاصطناعي، ومعايير التشغيل.</p>
        </div>
        <button 
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-lg shadow-blue-200 hover:scale-105 transition-all"
        >
          {isSaving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
          حفظ كافة التغييرات
        </button>
      </div>

      <div className="bg-white p-2 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-wrap gap-2 w-full md:w-fit overflow-x-auto no-scrollbar">
        <TabButton active={activeTab === 'automation'} onClick={() => setActiveTab('automation')} icon={<Zap size={18}/>} label="محرك الأتمتة" />
        <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Cpu size={18}/>} label="تكوين AI" />
        <TabButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={<BellRing size={18}/>} label="الإشعارات الذكية" />
        <TabButton active={activeTab === 'regional'} onClick={() => setActiveTab('regional')} icon={<Globe size={18}/>} label="التفضيلات" />
        <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Shield size={18}/>} label="الأمن" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'automation' && (
            <div className="space-y-4 animate-slide-in-up">
              {rules.map(rule => (
                <div key={rule.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-start justify-between">
                  <div className="flex gap-5">
                    <div className={`p-4 rounded-3xl transition-colors ${rule.isEnabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                      <Zap size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-800">{rule.name}</h4>
                      <p className="text-sm text-slate-500 font-bold mt-1 max-w-lg leading-relaxed">{rule.description}</p>
                    </div>
                  </div>
                  <button onClick={() => handleToggleRule(rule.id)} className={`transition-all ${rule.isEnabled ? 'text-blue-600' : 'text-slate-300'}`}>
                    {rule.isEnabled ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-slide-in-up">
              <div className="flex items-center gap-4 p-6 bg-indigo-50 rounded-[2.5rem] border border-indigo-100">
                <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm"><Sparkles size={24} /></div>
                <div>
                  <h4 className="font-black text-indigo-900">Enjaz AI Engine</h4>
                  <p className="text-xs font-bold text-indigo-700">جميع معالجات الـ AI تتم عبر خوادم "إنجاز" المؤمنة بـ Gemini API.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase pr-2">موديل التفكير</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" value={aiConfig.model} onChange={e => setAiConfig({...aiConfig, model: e.target.value})}>
                       <option value="gemini-3-pro-preview">Gemini 3 Pro (Staging)</option>
                       <option value="gemini-3-flash-preview">Gemini 3 Flash (Fast)</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase pr-2">نبرة التقارير</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" value={aiConfig.tone} onChange={e => setAiConfig({...aiConfig, tone: e.target.value})}>
                       <option value="Technical/Engineer">هندسي / فني</option>
                       <option value="Executive Summary">ملخص إداري</option>
                    </select>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && notifPrefs && (
            <div className="space-y-6 animate-slide-in-up">
               <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex gap-5">
                     <div className={`p-4 rounded-3xl ${notifPrefs.dndEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                        <Moon size={24} />
                     </div>
                     <div>
                        <h4 className="text-lg font-black text-slate-800">وضع "عدم الإزعاج"</h4>
                        <p className="text-sm text-slate-500 font-bold mt-1">إسكات التنبيهات غير الحرجة تلقائياً خارج ساعات العمل.</p>
                     </div>
                  </div>
                  <button onClick={() => setNotifPrefs({...notifPrefs, dndEnabled: !notifPrefs.dndEnabled})} className={`transition-all ${notifPrefs.dndEnabled ? 'text-indigo-600' : 'text-slate-300'}`}>
                    {notifPrefs.dndEnabled ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
                  </button>
               </div>

               <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                  <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2"><BellRing size={20} /> قنوات التنبيه</h4>
                  <div className="overflow-x-auto">
                     <table className="w-full text-right">
                        <thead>
                           <tr className="border-b border-slate-100">
                              <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest w-1/3">نوع الحدث</th>
                              <th className="pb-4 text-center">تطبيق</th>
                              <th className="pb-4 text-center">بريد</th>
                              <th className="pb-4 text-center">Push</th>
                           </tr>
                        </thead>
                        <tbody className="text-sm font-bold text-slate-700">
                           <NotificationRow label="تنبيهات حرجة" type="critical" prefs={notifPrefs} onToggle={toggleChannel} />
                           <NotificationRow label="إشارات مباشرة" type="mentions" prefs={notifPrefs} onToggle={toggleChannel} />
                           <NotificationRow label="تحديثات عامة" type="updates" prefs={notifPrefs} onToggle={toggleChannel} />
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3"><Database size={20} className="text-blue-400" /> ملخص النظام</h3>
            <div className="space-y-4">
               <SystemStat label="إصدار المنصة" value="v2.9.0 CORE" />
               <SystemStat label="مصدر البيانات" value={(import.meta as any).env?.VITE_DATA_SOURCE === 'api' ? 'Remote API' : 'Local Storage'} />
               <SystemStat label="حالة الربط" value="مؤمن 100%" isStatus />
            </div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm text-center space-y-4">
             <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100">
                <CheckCircle2 size={32} />
             </div>
             <h4 className="font-black text-slate-900">بروتوكولات الأمن محدثة</h4>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">لا توجد مفاتيح برمجة مكشوفة في الواجهة الأمامية.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-black transition-all whitespace-nowrap ${active ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}>{icon} {label}</button>
);

const NotificationRow = ({ label, type, prefs, onToggle }: any) => (
  <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
     <td className="py-4"><p className="font-bold text-slate-800">{label}</p></td>
     <td className="py-4 text-center"><input type="checkbox" checked={prefs.channels[type].inApp} onChange={() => onToggle(type, 'inApp')} className="w-5 h-5 rounded-lg accent-blue-600" /></td>
     <td className="py-4 text-center"><input type="checkbox" checked={prefs.channels[type].email} onChange={() => onToggle(type, 'email')} className="w-5 h-5 rounded-lg accent-blue-600" /></td>
     <td className="py-4 text-center"><input type="checkbox" checked={prefs.channels[type].push} onChange={() => onToggle(type, 'push')} className="w-5 h-5 rounded-lg accent-blue-600" /></td>
  </tr>
);

const SystemStat = ({ label, value, isStatus }: any) => (
  <div className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    <span className={`text-xs font-black ${isStatus ? 'text-emerald-400' : 'text-white'}`}>{value}</span>
  </div>
);

export default SettingsView;