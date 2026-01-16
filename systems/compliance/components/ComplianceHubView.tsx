
import React, { useState, useEffect, useMemo } from 'react';
import { Project, Permit, InspectionVisit, Status, Priority } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../shared/ui/ToastProvider';
import { 
  Landmark, ShieldCheck, Globe, Clock, AlertTriangle, 
  FileText, CheckCircle2, Loader2, Search, Plus, 
  Camera, Sparkles, Filter, MoreVertical, ChevronLeft,
  Calendar, FileWarning, History, Activity
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ComplianceHubView: React.FC = () => {
  const data = useData();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [visits, setVisits] = useState<InspectionVisit[]>([]);
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('All');
  
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pData, vData, permData] = await Promise.all([
        data.projects.getAll(),
        data.compliance.getVisits(),
        data.compliance.getPermits()
      ]);
      setProjects(pData);
      setVisits(vData);
      setPermits(permData);
    } finally { setLoading(false); }
  };

  const filteredVisits = visits.filter(v => selectedProjectId === 'All' || v.projectId === selectedProjectId);
  const filteredPermits = permits.filter(p => selectedProjectId === 'All' || p.projectId === selectedProjectId);

  const stats = useMemo(() => {
    const expiredCount = filteredPermits.filter(p => p.status === 'Expired').length;
    const failVisits = filteredVisits.filter(v => v.result === 'Fail').length;
    return {
      totalPermits: filteredPermits.length,
      expiringSoon: filteredPermits.filter(p => p.status === 'Renewal').length,
      expired: expiredCount,
      complianceScore: Math.max(0, 100 - (expiredCount * 10) - (failVisits * 15))
    };
  }, [filteredPermits, filteredVisits]);

  const handleAiComplianceAudit = async () => {
    setIsAiLoading(true);
    showToast("جاري تحليل سجلات الامتثال وتحديد فجوات الرقابة...", "loading");
    try {
      const context = `Score: ${stats.complianceScore}, Permits: ${stats.totalPermits}, Expired: ${stats.expired}, Recent Visits: ${filteredVisits.length}`;
      const response = await data.ai.askWiki(context, "بصفتك ضابط امتثال قانوني في شركة مقاولات، حلل هذه الأرقام واقترح خطة عمل لتفادي المخالفات البلدية.");
      setAiAnalysis(response);
    } catch (e) {
      showToast("فشل التحليل الذكي.", "error");
    } finally { setIsAiLoading(false); }
  };

  if (loading) return <div className="py-40 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={48}/><p className="font-black text-slate-400 mt-4">جاري فتح مركز الامتثال...</p></div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20" dir="rtl">
      {/* Header Info */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 -mr-32 -mt-32 rounded-full blur-3xl"></div>
         <div className="relative z-10 flex items-center gap-6">
            <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-xl">
               <Landmark size={36} />
            </div>
            <div>
               <h3 className="text-2xl font-black text-slate-900">مركز الامتثال والرقابة القانونية</h3>
               <p className="text-sm font-bold text-slate-500 mt-1">نظام رصد الزيارات الحكومية وإدارة دورة حياة التراخيص والمخططات.</p>
            </div>
         </div>
         <div className="relative z-10 flex gap-3 w-full lg:w-auto">
            <select 
               className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none shadow-sm"
               value={selectedProjectId}
               onChange={e => setSelectedProjectId(e.target.value)}
            >
               <option value="All">كافة مواقع المشاريع</option>
               {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button 
               onClick={handleAiComplianceAudit}
               disabled={isAiLoading}
               className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl flex items-center gap-3 hover:scale-105 transition-all disabled:opacity-50"
            >
               {isAiLoading ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>}
               تدقيق ذكي
            </button>
         </div>
      </div>

      {aiAnalysis && (
         <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden animate-slide-in-down border-b-8 border-indigo-600">
            <div className="absolute top-0 left-0 p-10 opacity-5"><ShieldCheck size={100}/></div>
            <div className="relative z-10">
               <h4 className="text-lg font-black mb-4 flex items-center gap-2 text-blue-400">
                  <Sparkles size={18}/> تقرير الرقابة والامتثال (AI Advisor)
               </h4>
               <div className="prose prose-invert prose-sm max-w-none text-blue-100 font-bold leading-relaxed">
                  <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
               </div>
               <button onClick={() => setAiAnalysis(null)} className="mt-6 text-[10px] font-black text-slate-500 hover:text-white transition-colors">إغلاق التقرير</button>
            </div>
         </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <ComplianceCard label="مؤشر الامتثال العام" value={`${stats.complianceScore}%`} icon={<Activity/>} color="text-slate-900" bg="bg-white" status={stats.complianceScore > 80 ? 'Good' : 'Risk'} />
         <ComplianceCard label="التراخيص النشطة" value={stats.totalPermits} icon={<Globe/>} color="text-blue-600" bg="bg-blue-50" />
         <ComplianceCard label="طلبات التجديد" value={stats.expiringSoon} icon={<Clock/>} color="text-amber-600" bg="bg-amber-50" />
         <ComplianceCard label="مخالفات منتهية" value={stats.expired} icon={<AlertTriangle/>} color="text-rose-600" bg="bg-rose-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Visits List */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center px-2">
               <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <History className="text-blue-600" size={24}/> سجل زيارات الجهات الرقابية
               </h4>
               <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg">
                  <Plus size={16}/> تسجيل زيارة
               </button>
            </div>

            <div className="space-y-4">
               {filteredVisits.length === 0 ? (
                  <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-400">
                     <p className="font-black">لا توجد زيارات تفتيشية مسجلة لهذا المشروع.</p>
                  </div>
               ) : filteredVisits.map(visit => (
                  <div key={visit.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-blue-300 transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                     <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className={`p-4 rounded-3xl ${
                           visit.result === 'Pass' ? 'bg-emerald-50 text-emerald-600' : 
                           visit.result === 'Fail' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                           <Landmark size={24}/>
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{visit.authorityName}</span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                                 visit.result === 'Pass' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                 visit.result === 'Fail' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>{visit.result === 'Pass' ? 'مطابق' : visit.result === 'Fail' ? 'مخالف' : 'ملاحظات'}</span>
                           </div>
                           <h5 className="font-black text-slate-800">{visit.inspectorName || 'مفتش حكومي'}</h5>
                           <p className="text-xs font-bold text-slate-500 mt-1 line-clamp-1">{visit.notes}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-8 w-full md:w-auto justify-between border-t md:border-t-0 pt-4 md:pt-0">
                        <div className="text-right">
                           <p className="text-[9px] font-black text-slate-400 uppercase">تاريخ الزيارة</p>
                           <p className="text-sm font-black text-slate-800">{visit.date}</p>
                        </div>
                        <div className="flex gap-2">
                           <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><FileText size={18}/></button>
                           {visit.infractionAmount && visit.infractionAmount > 0 && (
                              <div className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-black text-xs flex items-center gap-1 border border-rose-100">
                                 ${visit.infractionAmount.toLocaleString()}
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* License Radar */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col h-full">
               <h4 className="font-black text-slate-900 mb-8 flex items-center gap-2">
                  <FileWarning size={20} className="text-amber-500" /> رادار التراخيص
               </h4>
               <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar max-h-[600px]">
                  {filteredPermits.map(p => (
                     <div key={p.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-white hover:border-blue-300 transition-all">
                        <div className="flex justify-between items-start mb-3">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                              p.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 
                              p.status === 'Renewal' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                           }`}>{p.status}</span>
                           <span className="text-[10px] font-black text-slate-400">{p.authority}</span>
                        </div>
                        <h5 className="font-black text-slate-800 text-sm mb-1">{p.title}</h5>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                           <Clock size={10}/> تنتهي في: {p.expiryDate}
                        </p>
                        {p.status !== 'Active' && (
                           <button className="mt-4 w-full py-2 bg-white text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all">بدء إجراءات التجديد</button>
                        )}
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const ComplianceCard = ({ label, value, icon, color, bg, status }: any) => (
  <div className={`${bg} p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between h-44 hover:scale-[1.03] transition-transform relative overflow-hidden group`}>
     <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl bg-white shadow-sm ${color}`}>{icon}</div>
        {status && <div className={`w-2.5 h-2.5 rounded-full ${status === 'Good' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></div>}
     </div>
     <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-3xl font-black ${color}`}>{value}</p>
     </div>
  </div>
);

export default ComplianceHubView;
