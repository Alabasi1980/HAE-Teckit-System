
import React, { useState, useEffect, useMemo } from 'react';
import { Ticket, TicketStatus, TicketPriority, TicketType } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { Search, Filter, Inbox, Plus, Clock, AlertCircle, ChevronRight, User, Hash, Tag, Loader2, RefreshCw, BarChart3, List } from 'lucide-react';
import TicketsKpiView from './TicketsKpiView';

interface TicketsInboxViewProps {
  onTicketClick: (ticket: Ticket) => void;
  onOpenCreate: () => void;
}

const TicketsInboxView: React.FC<TicketsInboxViewProps> = ({ onTicketClick, onOpenCreate }) => {
  const data = useData();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TicketStatus | 'All'>('All');
  const [viewMode, setViewMode] = useState<'list' | 'kpi'>('list');

  useEffect(() => { loadTickets(); }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      // Data Layer is responsible for filtering/RBAC
      const all = await data.tickets.getAll();
      setTickets(all);
    } finally { setLoading(false); }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => 
      (activeTab === 'All' || t.status === activeTab) &&
      (t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.key.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [tickets, activeTab, searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in pb-10" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
             <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><Inbox size={24}/></div>
             مركز التذاكر والخدمات
           </h2>
           <p className="text-slate-500 font-bold mt-2 pr-1">إدارة البلاغات التقنية، شكاوى الميدان، وطلبات الخدمة الموحدة.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex shrink-0">
              <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`} title="عرض القائمة"><List size={18}/></button>
              <button onClick={() => setViewMode('kpi')} className={`p-3 rounded-xl transition-all ${viewMode === 'kpi' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`} title="لوحة القيادة KPIs"><BarChart3 size={18}/></button>
           </div>
           <button onClick={onOpenCreate} className="flex-1 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-3 hover:scale-105 transition-all">
              <Plus size={20}/> فتح تذكرة
           </button>
        </div>
      </div>

      {viewMode === 'kpi' ? (
         <TicketsKpiView tickets={tickets} />
      ) : (
         <>
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between gap-4">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                 {['All', ...Object.values(TicketStatus)].map(s => (
                   <button 
                     key={s} 
                     onClick={() => setActiveTab(s as any)}
                     className={`px-6 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${activeTab === s ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                   >
                     {s === 'All' ? 'كافة التذاكر' : s}
                   </button>
                 ))}
              </div>
              <div className="relative lg:w-80">
                 <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                 <input 
                   type="text" 
                   placeholder="بحث برقم التذكرة أو العنوان..." 
                   className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32}/></div>
              ) : filteredTickets.length === 0 ? (
                <div className="py-40 bg-white rounded-[3rem] border border-slate-200 border-dashed text-center text-slate-400">
                   <Inbox size={64} className="mx-auto mb-4 opacity-10" />
                   <p className="font-black text-lg">صندوق التذاكر فارغ حالياً</p>
                </div>
              ) : filteredTickets.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => onTicketClick(t)}
                  className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 cursor-pointer transition-all flex flex-col md:flex-row items-center gap-6 group"
                >
                   <div className={`p-4 rounded-3xl shrink-0 ${t.priority === TicketPriority.P1_CRITICAL ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                      {t.type === TicketType.INCIDENT ? <AlertCircle size={28}/> : <Hash size={28}/>}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                         <span className="text-[10px] font-black text-blue-600 font-mono tracking-tighter bg-blue-50 px-2 py-0.5 rounded">{t.key}</span>
                         <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                           t.status === TicketStatus.RESOLVED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                           t.status === TicketStatus.NEW ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                         }`}>{t.status}</span>
                         <span className="text-[10px] font-bold text-slate-400">• {t.type}</span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">{t.title}</h4>
                      <p className="text-xs font-bold text-slate-500 mt-1 line-clamp-1">{t.description}</p>
                   </div>

                   <div className="flex items-center gap-8 shrink-0">
                      <div className="text-right">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">الموعد المستهدف (SLA)</p>
                         <div className="flex items-center gap-2">
                            <Clock size={14} className={new Date(t.resolutionDueAt) < new Date() ? 'text-rose-500' : 'text-slate-300'} />
                            <span className={`text-xs font-black ${new Date(t.resolutionDueAt) < new Date() ? 'text-rose-600' : 'text-slate-700'}`}>
                              {new Date(t.resolutionDueAt).toLocaleDateString('ar-SA')}
                            </span>
                         </div>
                      </div>
                      <div className="flex -space-x-2">
                         <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400" title={t.requesterName}>{t.requesterName.charAt(0)}</div>
                      </div>
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-all"/>
                   </div>
                </div>
              ))}
            </div>
         </>
      )}
    </div>
  );
};

export default TicketsInboxView;
