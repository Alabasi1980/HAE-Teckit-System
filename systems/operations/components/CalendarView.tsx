
import React, { useMemo } from 'react';
import { WorkItem, Priority } from '../../../shared/types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface CalendarViewProps {
  items: WorkItem[];
  onItemClick: (item: WorkItem) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ items, onItemClick }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // توليد مصفوفة الأيام للشهر الحالي
  const daysInMonth = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days = [];
    // تعبئة الأيام الفارغة في البداية
    for (let i = 0; i < firstDay; i++) days.push(null);
    // إضافة أيام الشهر
    for (let i = 1; i <= totalDays; i++) days.push(i);
    
    return days;
  }, [currentMonth, currentYear]);

  const getItemsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return items.filter(item => item.dueDate === dateStr);
  };

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case Priority.CRITICAL: return 'bg-rose-500';
      case Priority.HIGH: return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><CalendarIcon size={20}/></div>
           <h3 className="text-xl font-black text-slate-900">أكتوبر 2023</h3>
        </div>
        <div className="flex gap-2">
           <button className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-all"><ChevronRight size={20}/></button>
           <button className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-all"><ChevronLeft size={20}/></button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30">
        {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
          <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[120px]">
        {daysInMonth.map((day, idx) => {
          const dayItems = day ? getItemsForDay(day) : [];
          const isToday = day === today.getDate();

          return (
            <div key={idx} className={`border-l border-b border-slate-50 p-2 relative group hover:bg-blue-50/30 transition-all ${!day ? 'bg-slate-50/20' : ''}`}>
              {day && (
                <>
                  <span className={`text-xs font-black p-1.5 rounded-lg inline-block mb-1 ${isToday ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
                    {day}
                  </span>
                  <div className="space-y-1 overflow-y-auto max-h-[80px] no-scrollbar">
                    {dayItems.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => onItemClick(item)}
                        className={`text-[8px] font-bold p-1.5 rounded-md text-white truncate cursor-pointer hover:scale-[1.02] transition-transform ${getPriorityColor(item.priority)}`}
                      >
                        {item.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
