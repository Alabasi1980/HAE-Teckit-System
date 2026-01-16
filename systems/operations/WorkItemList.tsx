
import React, { useState, useMemo } from 'react';
import { WorkItem, Status, Priority, WorkItemType, RecurrenceInterval } from '../../shared/types';
import { 
  Search, Filter, LayoutGrid, List, AlertTriangle, 
  CalendarClock, ChevronDown, SlidersHorizontal, Info, 
  CheckCircle2, Clock, ShieldAlert, Zap, ArrowDownWideNarrow,
  Calendar as CalendarIcon, UserCheck, MessageSquareMore, AlertCircle, Plus,
  Repeat, GanttChart, CheckSquare, Square, Trash2, UserPlus, X
} from 'lucide-react';
import KanbanView from './components/KanbanView';
import CalendarView from './components/CalendarView';
import GanttMiniView from './components/GanttMiniView';
import { useData } from '../../context/DataContext';

interface WorkItemListProps {
  items: WorkItem[];
  onItemClick: (item: WorkItem) => void;
  onOpenCreate?: () => void;
}

const WorkItemList: React.FC<WorkItemListProps> = ({ items, onItemClick, onOpenCreate }) => {
  const data = useData();
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar' | 'gantt'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [personalFilter, setPersonalFilter] = useState<'all' | 'mine'>('mine');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const currentUser = JSON.parse(localStorage.getItem('enjaz_session_user') || '{}');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || item.type === filterType;
      const isMine = personalFilter === 'mine' ? item.assigneeId === currentUser.id : true;
      return matchesSearch && matchesType && isMine;
    });
  }, [items, searchTerm, filterType, personalFilter, currentUser.id]);

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkStatus = async (status: Status) => {
    if (!window.confirm(`هل أنت متأكد من تغيير حالة ${selectedIds.size} مهمة؟`)) return;
    for (const id of Array.from(selectedIds)) {
      await data.workItems.updateStatus(id, status);
    }
    setSelectedIds(new Set());
    window.location.reload(); // Refresh to show changes
  };

  const stats = useMemo(() => ({
    active: items.filter(i => i.status === Status.IN_PROGRESS).length,
    approvals: items.filter(i => i.type === WorkItemType.APPROVAL && i.status === Status.PENDING_APPROVAL).length,
    issues: items.filter(i => i.type === WorkItemType.ISSUE).length,
    overdue: items.filter(i => i.dueDate < new Date().toISOString().split('T')[0] && i.status !== Status.DONE).length
  }), [items]);

  const getTaskIcon = (type: WorkItemType) => {
    switch(type) {
      case WorkItemType.APPROVAL: return <ShieldAlert size={20}/>;
      case WorkItemType.ISSUE: return <AlertCircle size={20}/>;
      case WorkItemType.FOLLOW_UP: return <MessageSquareMore size={20}/>;
      default: return <Zap size={20}/>;
    }
  };

  const getTaskColor = (type: WorkItemType) => {
    switch(type) {
      case WorkItemType.APPROVAL: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case WorkItemType.ISSUE: return 'bg-rose-50 text-rose-600 border-rose-100';
      case WorkItemType.FOLLOW_UP: return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-20" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
          <MiniStat label="مهام نشطة" value={stats.active} icon={<Zap size={16}/>} color="text-blue-600" bg="bg-blue-50" />
          <MiniStat label="طلبات اعتماد" value={stats.approvals} icon={<UserCheck size={16}/>} color="text-indigo-600" bg="bg-indigo-50" />
          <MiniStat label="عوارض/مشاكل" value={stats.issues} icon={<AlertCircle size={16}/>} color="text-rose-600" bg="bg-rose-50" />
          <MiniStat label="متجاوز للوقت" value={stats.overdue} icon={<Clock size={16}/>} color="text-amber-600" bg="bg-amber-50" />
        </div>
        {onOpenCreate && (
          <button 
            onClick={onOpenCreate}
            className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm shadow-xl flex items-center gap-3 hover:scale-105 transition-all shrink-0"
          >
            <Plus size={20}/> إضافة تكليف عمل
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-[1.5rem] border border-slate-200 shrink-0">
           <button onClick={() => setPersonalFilter('mine')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${personalFilter === 'mine' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>مهامي الشخصية</button>
           <button onClick={() => setPersonalFilter('all')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${personalFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>مهام الفريق</button>
        </div>

        <div className="relative w-full group flex-1 max-w-lg">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="البحث في سجل المهام..." 
            className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-transparent rounded-[1.2rem] text-sm font-bold focus:bg-white focus:border-blue-200 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center border border-slate-200">
            <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`} title="قائمة"><List size={18} /></button>
            <button onClick={() => setViewMode('kanban')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'kanban' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`} title="كانبان"><LayoutGrid size={18} /></button>
            <button onClick={() => setViewMode('calendar')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'calendar' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`} title="تقويم"><CalendarIcon size={18} /></button>
            <button onClick={() => setViewMode('gantt')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'gantt' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`} title="جانت"><GanttChart size={18} /></button>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`p-3.5 rounded-2xl transition-all border ${showFilters ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400'}`}><SlidersHorizontal size={20}/></button>
        </div>
      </div>

      <div className="min-h-[500px] relative">
        {selectedIds.size > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-8 animate-slide-in-up border border-white/10">
             <div className="flex items-center gap-3">
                <span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs">{selectedIds.size}</span>
                <p className="text-sm font-black">مهام مختارة</p>
             </div>
             <div className="h-6 w-px bg-white/10"></div>
             <div className="flex gap-4">
                <button onClick={() => handleBulkStatus(Status.DONE)} className="flex items-center gap-2 text-xs font-black hover:text-emerald-400 transition-all"><CheckCircle2 size={16}/> إغلاق كـ "منجز"</button>
                <button className="flex items-center gap-2 text-xs font-black hover:text-blue-400 transition-all"><UserPlus size={16}/> إعادة إسناد</button>
                <button className="flex items-center gap-2 text-xs font-black hover:text-rose-400 transition-all"><Trash2 size={16}/> حذف</button>
             </div>
             {/* Fix: X icon is now imported */}
             <button onClick={() => setSelectedIds(new Set())} className="p-2 hover:bg-white/10 rounded-full"><X size={18}/></button>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
               <EmptyState />
            ) : (
              filteredItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => onItemClick(item)}
                  className={`bg-white p-6 rounded-[2.5rem] border shadow-sm hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer flex flex-col md:flex-row items-center gap-8 group ${selectedIds.has(item.id) ? 'border-blue-600 bg-blue-50/30' : 'border-slate-200'}`}
                >
                   <button onClick={(e) => toggleSelect(item.id, e)} className={`p-2 rounded-xl transition-all ${selectedIds.has(item.id) ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
                      {selectedIds.has(item.id) ? <CheckSquare size={24}/> : <Square size={24}/>}
                   </button>

                   <div className={`p-4 rounded-[1.5rem] shadow-sm transition-transform group-hover:scale-110 border ${getTaskColor(item.type)}`}>
                      {getTaskIcon(item.type)}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                         <span className="text-[10px] font-black text-slate-400 font-mono uppercase tracking-tighter">{item.id}</span>
                         <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                            item.status === Status.DONE ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                         }`}>{item.status}</span>
                         {item.recurrence && item.recurrence !== RecurrenceInterval.NONE && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase border border-indigo-100">
                               <Repeat size={10}/> دورية
                            </span>
                         )}
                         <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                         <span className="text-[10px] font-black text-slate-400 uppercase">{item.type}</span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">{item.title}</h4>
                   </div>

                   <div className="flex items-center gap-8 shrink-0">
                      <div className="text-right">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">الموعد النهائي</p>
                         <p className={`text-xs font-black ${item.dueDate < new Date().toISOString().split('T')[0] ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>{item.dueDate}</p>
                      </div>
                      <div className="flex -space-x-2">
                         <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400">U</div>
                      </div>
                   </div>
                </div>
              ))
            )}
          </div>
        )}
        {viewMode === 'kanban' && <KanbanView items={filteredItems} onItemClick={onItemClick} />}
        {viewMode === 'calendar' && <CalendarView items={filteredItems} onItemClick={onItemClick} />}
        {viewMode === 'gantt' && <GanttMiniView items={filteredItems} onItemClick={onItemClick} />}
      </div>
    </div>
  );
};

const MiniStat = ({ label, value, icon, color, bg }: any) => (
  <div className={`bg-white p-5 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-4 transition-all hover:shadow-md`}>
     <div className={`p-3 rounded-2xl ${bg} ${color}`}>{icon}</div>
     <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
     </div>
  </div>
);

const EmptyState = () => (
  <div className="py-40 text-center flex flex-col items-center justify-center gap-4 text-slate-400">
    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
       <Info size={40} className="opacity-20" />
    </div>
    <p className="font-black text-lg">لم يتم العثور على مهام!</p>
    <p className="text-sm font-bold opacity-60">كل شيء مكتمل أو لا توجد نتائج تطابق الفلاتر.</p>
  </div>
);

export default WorkItemList;
