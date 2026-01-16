
import React, { useMemo } from 'react';
import { WorkItem, Status, Priority } from '../../../shared/types';
import { Clock, AlertCircle, CheckCircle2, ChevronLeft, Link2 } from 'lucide-react';

interface GanttMiniViewProps {
  items: WorkItem[];
  onItemClick: (item: WorkItem) => void;
}

const GanttMiniView: React.FC<GanttMiniViewProps> = ({ items, onItemClick }) => {
  const chartConfig = useMemo(() => {
    if (items.length === 0) return null;

    const dates = items.flatMap(i => [new Date(i.createdAt), new Date(i.dueDate)]);
    const start = new Date(Math.min(...dates.map(d => d.getTime())));
    const end = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // تأكد من وجود فرق 7 أيام على الأقل للعرض
    const minRange = 7 * 24 * 60 * 60 * 1000;
    if (end.getTime() - start.getTime() < minRange) {
      end.setTime(start.getTime() + minRange);
    }

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return { start, end, totalDays };
  }, [items]);

  const getPosition = (dateStr: string) => {
    if (!chartConfig) return 0;
    const date = new Date(dateStr);
    const diff = date.getTime() - chartConfig.start.getTime();
    return (diff / (chartConfig.totalDays * 24 * 60 * 60 * 1000)) * 100;
  };

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case Priority.CRITICAL: return 'bg-rose-500';
      case Priority.HIGH: return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  if (!chartConfig) return null;

  return (
    <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-fade-in" dir="rtl">
      {/* Time Header */}
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
               <Clock size={20} />
            </div>
            <div>
               <h3 className="text-xl font-black text-slate-900">المخطط الزمني للعمليات</h3>
               <p className="text-xs font-bold text-slate-400">تحليل تسلسل المهام والتبعيات (Dependencies)</p>
            </div>
         </div>
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-blue-500"></div>
               <span className="text-[10px] font-black text-slate-400">مهمة عادية</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-rose-500"></div>
               <span className="text-[10px] font-black text-slate-400">حرج</span>
            </div>
         </div>
      </div>

      <div className="overflow-x-auto no-scrollbar">
         <div className="min-w-[800px] p-8">
            {/* Timeline Axis */}
            <div className="relative h-10 border-b border-slate-100 mb-8 flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">
               <span>{chartConfig.start.toLocaleDateString('ar-SA', {day: 'numeric', month: 'short'})}</span>
               <span>منتصف المدة</span>
               <span>{chartConfig.end.toLocaleDateString('ar-SA', {day: 'numeric', month: 'short'})}</span>
               <div className="absolute inset-x-0 bottom-0 flex justify-between px-2">
                  {Array.from({length: 10}).map((_, i) => (
                    <div key={i} className="h-2 w-px bg-slate-100"></div>
                  ))}
               </div>
            </div>

            {/* Task Rows */}
            <div className="space-y-6">
               {items.map(item => {
                  const startPos = getPosition(item.createdAt);
                  const endPos = getPosition(item.dueDate);
                  const width = Math.max(endPos - startPos, 2); // حد أدنى للعرض 2%

                  return (
                     <div key={item.id} className="group relative">
                        <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black text-slate-300 font-mono uppercase">{item.id}</span>
                              <h4 className="text-xs font-black text-slate-700 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                              {item.dependencies && item.dependencies.length > 0 && (
                                 <Link2 size={12} className="text-indigo-400" />
                              )}
                           </div>
                           <span className="text-[9px] font-black text-slate-400 uppercase">{item.status}</span>
                        </div>
                        
                        <div className="relative h-4 w-full bg-slate-50 rounded-full overflow-hidden">
                           <div 
                              onClick={() => onItemClick(item)}
                              className={`absolute h-full rounded-full cursor-pointer transition-all hover:brightness-110 shadow-sm ${getPriorityColor(item.priority)} ${item.status === Status.DONE ? 'opacity-40' : ''}`}
                              style={{ 
                                 right: `${startPos}%`, 
                                 width: `${width}%` 
                              }}
                           >
                              {item.status === Status.DONE && (
                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <CheckCircle2 size={10} className="text-white" />
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Connection Lines (Simplified Visual) */}
                        {item.dependencies?.map((depId, idx) => (
                           <div 
                              key={idx}
                              className="absolute -top-4 right-0 border-r-2 border-indigo-100 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ right: `${startPos}%` }}
                           ></div>
                        ))}
                     </div>
                  );
               })}
            </div>
         </div>
      </div>
      
      <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
         <p className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest">
            <AlertCircle size={14}/> المخطط يعرض المهام الحالية فقط. لجدولة كاملة استخدم نظام "خطة المشروع".
         </p>
      </div>
    </div>
  );
};

export default GanttMiniView;
