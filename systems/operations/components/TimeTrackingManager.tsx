
import React, { useState } from 'react';
import { WorkItem, TimeLog } from '../../../shared/types';
import { Timer, Plus, History, User, Clock, TrendingUp } from 'lucide-react';

interface TimeTrackingManagerProps {
  item: WorkItem;
  onLogTime: (hours: number, note: string) => Promise<void>;
}

const TimeTrackingManager: React.FC<TimeTrackingManagerProps> = ({ item, onLogTime }) => {
  const [hours, setHours] = useState(1);
  const [note, setNote] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const totalLogged = item.timeLogs?.reduce((acc, log) => acc + log.hours, 0) || 0;
  const progress = item.estimatedHours ? Math.round((totalLogged / item.estimatedHours) * 100) : 0;

  return (
    <div className="space-y-6">
       <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-8">
             <div className="flex items-center gap-4">
                <div className="p-4 bg-amber-50 text-amber-600 rounded-3xl shadow-sm"><Timer size={28}/></div>
                <div>
                   <h3 className="text-xl font-black text-slate-900">ميزانية الوقت المنفذة</h3>
                   <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">تتبع الإنتاجية الساعية</p>
                </div>
             </div>
             <div className="text-left">
                <p className="text-3xl font-black text-slate-900">{totalLogged}<span className="text-sm text-slate-400 ml-1">/{item.estimatedHours || '--'}h</span></p>
                <p className="text-[10px] font-black text-slate-400 uppercase">ساعة عمل مسجلة</p>
             </div>
          </div>

          <div className="space-y-2 mb-8">
             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>التقدم الزمني</span>
                <span className={progress > 100 ? 'text-rose-600' : 'text-emerald-600'}>{progress}%</span>
             </div>
             <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                   className={`h-full transition-all duration-1000 ${progress > 100 ? 'bg-rose-500' : 'bg-amber-500'}`} 
                   style={{ width: `${Math.min(100, progress)}%` }}
                />
             </div>
          </div>

          {!isExpanded ? (
             <button 
               onClick={() => setIsExpanded(true)}
               className="w-full py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
             >
                <Plus size={16}/> تسجيل ساعات عمل جديدة
             </button>
          ) : (
             <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 animate-slide-in-up space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">عدد الساعات</label>
                      <input 
                         type="number" 
                         className="w-full p-4 bg-white border border-slate-200 rounded-xl text-lg font-black text-center outline-none focus:ring-4 focus:ring-amber-100"
                         value={hours}
                         onChange={e => setHours(Number(e.target.value))}
                         min="0.5"
                         step="0.5"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">بيان العمل</label>
                      <input 
                         type="text" 
                         className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-amber-100"
                         placeholder="ماذا أنجزت؟"
                         value={note}
                         onChange={e => setNote(e.target.value)}
                      />
                   </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => { onLogTime(hours, note); setIsExpanded(false); setNote(''); }} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl">تأكيد التسجيل</button>
                   <button onClick={() => setIsExpanded(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-sm">إلغاء</button>
                </div>
             </div>
          )}
       </div>

       {item.timeLogs && item.timeLogs.length > 0 && (
          <div className="space-y-4">
             <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 px-2">
                <History size={14} className="text-slate-400"/> السجل الزمني للتكليف
             </h4>
             <div className="space-y-2">
                {item.timeLogs.map(log => (
                   <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-amber-200 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-[10px] text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                            {log.userName.charAt(0)}
                         </div>
                         <div>
                            <p className="text-xs font-black text-slate-800">{log.note || 'عمل ميداني'}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{log.userName} • {new Date(log.date).toLocaleDateString('ar-SA')}</p>
                         </div>
                      </div>
                      <div className="text-left bg-slate-50 px-3 py-1.5 rounded-xl font-black text-sm text-slate-900">
                         {log.hours}h
                      </div>
                   </div>
                ))}
             </div>
          </div>
       )}
    </div>
  );
};

export default TimeTrackingManager;
