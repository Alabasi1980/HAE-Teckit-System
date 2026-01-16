import React, { useState, useMemo } from 'react';
import { WorkItem, Status, Priority, WorkItemType } from '../../shared/types';
import { 
  Search, Filter, LayoutGrid, List, AlertTriangle, 
  CalendarClock, ChevronDown, SlidersHorizontal, Info, 
  CheckCircle2, Clock, ShieldAlert, Zap, ArrowDownWideNarrow
} from 'lucide-react';
import KanbanView from './components/KanbanView';
import StatCard from '../../shared/ui/StatCard';

interface WorkItemListProps {
  items: WorkItem[];
  onItemClick: (item: WorkItem) => void;
}

const WorkItemList: React.FC<WorkItemListProps> = ({ items, onItemClick }) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || item.type === filterType;
      const matchesPriority = filterPriority === 'All' || item.priority === filterPriority;
      return matchesSearch && matchesType && matchesPriority;
    });
  }, [items, searchTerm, filterType, filterPriority]);

  const stats = useMemo(() => ({
    active: items.filter(i => i.status === Status.IN_PROGRESS).length,
    pending: items.filter(i => i.status === Status.PENDING_APPROVAL).length,
    critical: items.filter(i => i.priority === Priority.CRITICAL).length,
    overdue: items.filter(i => i.dueDate < new Date().toISOString().split('T')[0] && i.status !== Status.DONE).length
  }), [items]);

  const getPriorityStyle = (p: Priority) => {
    switch(p) {
      case Priority.CRITICAL: return 'text-rose-600 bg-rose-50 border-rose-100';
      case Priority.HIGH: return 'text-orange-600 bg-orange-50 border-orange-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-20" dir="rtl">
      {/* Quick Stats Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat label="قيد التنفيذ" value={stats.active} icon={<Zap size={16}/>} color="text-blue-600" bg="bg-blue-50" />
        <MiniStat label="بانتظار اعتماد" value={stats.pending} icon={<ShieldAlert size={16}/>} color="text-indigo-600" bg="bg-indigo-50" />
        <MiniStat label="بلاغات حرجة" value={stats.critical} icon={<AlertTriangle size={16}/>} color="text-rose-600" bg="bg-rose-50" />
        <MiniStat label="مهام متأخرة" value={stats.overdue} icon={<Clock size={16}/>} color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-1/3 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="بحث في العمليات..." 
            className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-200 outline-none transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center border border-slate-200">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'kanban' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all border ${showFilters ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <ArrowDownWideNarrow size={16} /> تصفية النتائج
          </button>
        </div>
      </div>

      {/* Advanced Filters Drawer (In-page) */}
      {showFilters && (
        <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex flex-wrap gap-6 animate-slide-in-up">
           <FilterGroup label="نوع العملية">
              {['All', ...Object.values(WorkItemType)].map(t => (
                /* Fix: Cast t to string to avoid type unknown key error */
                <button key={t as string} onClick={() => setFilterType(t as string)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${filterType === t ? 'bg-blue-600' : 'bg-white/5 hover:bg-white/10'}`}>{t === 'All' ? 'الكل' : t as string}</button>
              ))}
           </FilterGroup>
           <FilterGroup label="الأولوية">
              {['All', ...Object.values(Priority)].map(p => (
                /* Fix: Cast p to string to avoid type unknown key error */
                <button key={p as string} onClick={() => setFilterPriority(p as string)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${filterPriority === p ? 'bg-blue-600' : 'bg-white/5 hover:bg-white/10'}`}>{p === 'All' ? 'الكل' : p as string}</button>
              ))}
           </FilterGroup>
        </div>
      )}

      {/* List / Kanban Rendering */}
      <div className="min-h-[500px]">
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.length === 0 ? (
               <EmptyState />
            ) : (
              filteredItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => onItemClick(item)}
                  className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 cursor-pointer flex flex-col md:flex-row items-center gap-6 group transition-all"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${getPriorityStyle(item.priority)}`}>
                    <Zap size={22} />
                  </div>
                  
                  <div className="flex-1 min-w-0 text-center md:text-right">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                      <span className="text-[10px] font-black text-slate-400 font-mono tracking-tighter uppercase">{item.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                         item.status === Status.DONE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                         item.status === Status.PENDING_APPROVAL ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                         'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">{item.title}</h4>
                    <p className="text-xs font-bold text-slate-400 line-clamp-1 mt-1">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex -space-x-2">
                       <img src={`https://picsum.photos/seed/${item.assigneeId}/40/40`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="u"/>
                       <div className="w-8 h-8 rounded-full border-2 border-white bg-white flex items-center justify-center text-[8px] font-black text-slate-400 shadow-sm">+1</div>
                    </div>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div className="text-right">
                       <p className="text-[9px] font-black text-slate-400 uppercase">الموعد النهائي</p>
                       <p className={`text-xs font-black ${item.dueDate < new Date().toISOString().split('T')[0] ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>{item.dueDate}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <KanbanView items={filteredItems} onItemClick={onItemClick} />
        )}
      </div>
    </div>
  );
};

const MiniStat = ({ label, value, icon, color, bg }: any) => (
  <div className={`bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 transition-all hover:shadow-md`}>
     <div className={`p-2.5 rounded-xl ${bg} ${color}`}>{icon}</div>
     <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xl font-black text-slate-900">{value}</p>
     </div>
  </div>
);

const FilterGroup = ({ label, children }: any) => (
  <div className="space-y-3">
     <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
     <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

const EmptyState = () => (
  <div className="py-40 text-center flex flex-col items-center justify-center gap-4 text-slate-400">
    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
       <Info size={40} className="opacity-20" />
    </div>
    <p className="font-black text-lg">لم يتم العثور على نتائج!</p>
    <p className="text-sm font-bold opacity-60">جرب تغيير كلمات البحث أو إزالة الفلاتر النشطة.</p>
  </div>
);

export default WorkItemList;
