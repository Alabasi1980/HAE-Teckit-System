
import React, { useMemo, useState } from 'react';
import { User, WorkItem, Status, Priority } from '../../../shared/types';
import { 
  Scale, Users, Activity, AlertTriangle, 
  CheckCircle2, ChevronLeft, MoreVertical, Search,
  ArrowRightLeft, UserMinus, UserPlus, Sparkles, Loader2
} from 'lucide-react';
import { useData } from '../../../context/DataContext';

interface WorkloadBalancerViewProps {
  users: User[];
  items: WorkItem[];
  onItemClick: (item: WorkItem) => void;
}

const WorkloadBalancerView: React.FC<WorkloadBalancerViewProps> = ({ users, items, onItemClick }) => {
  const data = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAdvise, setAiAdvise] = useState<string | null>(null);

  const workloadData = useMemo(() => {
    return users.map(user => {
      const userTasks = items.filter(i => i.assigneeId === user.id && i.status !== Status.DONE && i.status !== Status.APPROVED);
      
      // حساب معامل الحمل (Load Score)
      // مهام حرجة = 3 نقاط، عالية = 2 نقطة، عادية = 1 نقطة
      const score = userTasks.reduce((acc, task) => {
        if (task.priority === Priority.CRITICAL) return acc + 3;
        if (task.priority === Priority.HIGH) return acc + 2;
        return acc + 1;
      }, 0);

      return {
        ...user,
        tasks: userTasks,
        score,
        status: score > 10 ? 'Overloaded' : score > 5 ? 'Balanced' : 'Available'
      };
    }).sort((a, b) => b.score - a.score);
  }, [users, items]);

  const handleAiBalance = async () => {
    setIsAiLoading(true);
    try {
      const context = workloadData.map(u => `${u.name} (Role: ${u.role}, Load Score: ${u.score})`).join('\n');
      const response = await data.ai.askWiki(context, "بصفتك مدير تشغيل، حلل ضغط العمل الحالي واقترح إعادة توزيع للمهام لتحسين الكفاءة وتقليل الحمل الزائد.");
      setAiAdvise(response);
    } catch (e) {
      setAiAdvise("تعذر الحصول على نصيحة ذكية حالياً.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredData = workloadData.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 -ml-32 -mt-32 rounded-full blur-3xl"></div>
         <div className="relative z-10 flex items-center gap-5">
            <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-xl">
               <Scale size={32} />
            </div>
            <div>
               <h3 className="text-2xl font-black text-slate-900">موازن ضغط العمل (Workload)</h3>
               <p className="text-sm font-bold text-slate-500 mt-1">توزيع عادل وذكي للمهام بناءً على التخصص والسعة المتاحة.</p>
            </div>
         </div>
         <div className="relative z-10">
            <button 
              onClick={handleAiBalance}
              disabled={isAiLoading}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 hover:scale-105 transition-all flex items-center gap-2"
            >
               {isAiLoading ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20} className="text-blue-200"/>}
               موازنة عبر AI
            </button>
         </div>
      </div>

      {aiAdvise && (
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden animate-slide-in-up">
           <div className="absolute top-0 left-0 p-10 opacity-5"><Activity size={100}/></div>
           <h4 className="text-lg font-black mb-4 flex items-center gap-2 text-indigo-400"><Sparkles size={18}/> توصيات المساعد الذكي لموازنة الحمل</h4>
           <div className="text-sm font-bold text-indigo-100/80 leading-relaxed whitespace-pre-wrap max-w-4xl">
              {aiAdvise}
           </div>
           <button onClick={() => setAiAdvise(null)} className="mt-6 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest">إغلاق التوصيات</button>
        </div>
      )}

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-1 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي المهام المفتوحة</p>
            <p className="text-4xl font-black text-slate-900">{items.filter(i => i.status !== Status.DONE).length}</p>
         </div>
         <div className="lg:col-span-3 bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center px-6">
            <Search className="text-slate-400 mr-2" size={20}/>
            <input 
               type="text" 
               placeholder="ابحث عن مهندس أو قسم لتحليل حمولة العمل..." 
               className="flex-1 p-3 bg-transparent font-bold text-sm outline-none"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      {/* Grid of Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
         {filteredData.map(user => (
            <div key={user.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
               <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-2xl border-4 border-slate-50 shadow-md overflow-hidden">
                        <img src={user.avatar} className="w-full h-full object-cover" />
                     </div>
                     <div>
                        <h4 className="text-lg font-black text-slate-900 leading-tight">{user.name}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                     </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                     user.status === 'Overloaded' ? 'bg-rose-50 text-rose-600' : 
                     user.status === 'Balanced' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                     {user.status === 'Overloaded' ? 'حمل زائد' : user.status === 'Balanced' ? 'متوازن' : 'متاح'}
                  </div>
               </div>

               <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-end px-1">
                     <span className="text-[10px] font-black text-slate-400 uppercase">مؤشر الحمولة</span>
                     <span className="text-xs font-black text-slate-900">{user.score} / 15</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                     <div 
                        className={`h-full transition-all duration-1000 ${
                           user.status === 'Overloaded' ? 'bg-rose-500' : 
                           user.status === 'Balanced' ? 'bg-orange-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (user.score / 15) * 100)}%` }}
                     ></div>
                  </div>
               </div>

               <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 border-b border-slate-50 pb-2">المهام الحالية ({user.tasks.length})</p>
                  {user.tasks.slice(0, 3).map(task => (
                     <div key={task.id} onClick={() => onItemClick(task)} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group/item hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all">
                        <span className="text-xs font-bold text-slate-700 group-hover/item:text-blue-700 truncate max-w-[180px]">{task.title}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${task.priority === Priority.CRITICAL ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
                     </div>
                  ))}
                  {user.tasks.length > 3 && (
                     <p className="text-[10px] font-bold text-blue-600 text-center">+ {user.tasks.length - 3} مهام أخرى</p>
                  )}
               </div>

               <div className="mt-8 pt-6 border-t border-slate-50 flex gap-2">
                  <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-blue-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                     <ArrowRightLeft size={14}/> إعادة توجيه
                  </button>
                  <button className="px-4 py-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-200 transition-all"><MoreVertical size={16}/></button>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default WorkloadBalancerView;
