
import React, { useState, useEffect } from 'react';
import { WorkItem, Priority, Status, Project, User, ApprovalDecision, Comment, Subtask, TimeLog, WorkItemAttachment, RecurrenceInterval } from '../../shared/types';
import { useData } from '../../context/DataContext';
import { useToast } from '../../shared/ui/ToastProvider';
import { X, Clock, User as UserIcon, MapPin, EyeOff, Lock, RefreshCcw, Briefcase, Sparkles, LayoutList, History, MessageSquare, CheckCircle, CalendarClock, Plus, Link2, Users, FileText, Paperclip, Timer, ChevronDown, Repeat, Download, ShieldAlert, Camera } from 'lucide-react';

// Sub-components
import ApprovalChain from './components/ApprovalChain';
import SubtaskList from './components/SubtaskList';
import CommentSection from './components/CommentSection';
import AiAnalysisCard from './components/AiAnalysisCard';
import DependencyManager from './components/DependencyManager';
import TimeTrackingManager from './components/TimeTrackingManager';
import AttachmentManager from './components/AttachmentManager';

interface WorkItemDetailProps {
  item: WorkItem;
  project?: Project;
  assignee?: User;
  currentUser?: User | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: Status) => void;
  onRefresh: () => void;
}

const WorkItemDetail: React.FC<WorkItemDetailProps> = ({ item, project, assignee, currentUser, onClose, onUpdateStatus, onRefresh }) => {
  const data = useData();
  const { showToast } = useToast();
  const [subtasks, setSubtasks] = useState<Subtask[]>(item.subtasks || []);
  const [activeTab, setActiveTab] = useState<'content' | 'timeline' | 'resources' | 'comments'>('content');
  
  useEffect(() => {
    setSubtasks(item.subtasks || []);
  }, [item.id, item.subtasks]);

  const handleStatusTransition = async (newStatus: Status) => {
    // 1. Geofencing Logic
    if (newStatus === Status.DONE && project?.latLng) {
      showToast("جاري التحقق من التواجد الجغرافي في الموقع...", "loading");
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true })
        );
        
        const dist = Math.sqrt(
          Math.pow(pos.coords.latitude - project.latLng.lat, 2) + 
          Math.pow(pos.coords.longitude - project.latLng.lng, 2)
        );

        if (dist > 0.005) { 
          showToast("فشل التحقق: أنت خارج حدود المشروع المعتمدة لإتمام هذه المهمة.", "error");
          return;
        }
      } catch (e) {
        showToast("لا يمكن الوصول للموقع الجغرافي. تأكد من تفعيل الـ GPS.", "error");
        return;
      }
    }

    onUpdateStatus(item.id, newStatus);
    showToast(`تم تغيير الحالة إلى ${newStatus}`, "success");
  };

  const getPriorityBadge = (p: Priority) => {
    switch(p) {
      case Priority.CRITICAL: return 'bg-rose-600 shadow-rose-200';
      case Priority.HIGH: return 'bg-orange-600 shadow-orange-200';
      default: return 'bg-blue-600 shadow-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/60 backdrop-blur-sm transition-all print:p-0 print:bg-white" onClick={onClose}>
      <div 
        className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right relative print:w-full print:max-w-none print:shadow-none"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header Panel */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 shrink-0 print:bg-white">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getPriorityBadge(item.priority)} animate-pulse print:hidden`}></div>
              <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest">{item.id}</span>
              <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-slate-900 text-white shadow-sm">
                {item.type}
              </span>
              {item.status === Status.DONE && <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-emerald-600 text-white shadow-sm">منجز</span>}
            </div>
            <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">{item.title}</h2>
          </div>
          <div className="flex gap-2 print:hidden">
             <button onClick={() => window.print()} className="p-3 bg-white hover:bg-slate-100 rounded-2xl text-slate-500 shadow-sm transition-all border border-slate-100" title="تصدير تقرير">
                <Download size={24} />
             </button>
             <button onClick={onClose} className="p-3 bg-white hover:bg-rose-50 hover:text-rose-600 rounded-2xl text-slate-400 shadow-sm transition-all border border-slate-100">
               <X size={24} />
             </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-8 pt-4 flex gap-6 border-b border-slate-50 bg-white shrink-0 overflow-x-auto no-scrollbar print:hidden">
           <TabItem active={activeTab === 'content'} onClick={() => setActiveTab('content')} icon={<LayoutList size={16}/>} label="التفاصيل" />
           <TabItem active={activeTab === 'resources'} onClick={() => setActiveTab('resources')} icon={<Timer size={16}/>} label="الموارد والوقت" />
           <TabItem active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<History size={16}/>} label="سلسلة الاعتمادات" />
           <TabItem active={activeTab === 'comments'} onClick={() => setActiveTab('comments')} icon={<MessageSquare size={16}/>} label="المناقشة" />
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar print:overflow-visible">
          
          <div className={`${activeTab === 'content' ? 'block' : 'hidden print:block'} space-y-10 animate-fade-in`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
                 <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group print:bg-slate-100 print:text-black">
                    <p className="text-[10px] text-blue-400 uppercase tracking-widest font-black mb-1">حالة التنفيذ</p>
                    <div className="flex items-center justify-between">
                       <p className="text-xl font-black">{item.status}</p>
                       <ChevronDown size={16} className="text-blue-50/20" />
                    </div>
                 </div>
                 <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 flex flex-col justify-center">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">الموعد النهائي</p>
                    <p className="text-lg font-black text-slate-800">{item.dueDate}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r-4 border-blue-600 pr-3">بيان العمل الرسمي</h3>
                 <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200/60 leading-relaxed font-bold text-slate-600 whitespace-pre-wrap shadow-inner">
                    {item.description}
                 </div>
              </div>

              {item.attachments && item.attachments.length > 0 && (
                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r-4 border-blue-600 pr-3 flex items-center gap-2">
                       <Camera size={14}/> المرفقات الميدانية
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {item.attachments.map((img, idx) => (
                          <div key={idx} className="aspect-square rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                             <img src={img} className="w-full h-full object-cover" />
                          </div>
                       ))}
                    </div>
                 </div>
              )}

              <div className="print:block">
                <SubtaskList 
                  subtasks={subtasks}
                  onAdd={(title) => { const st = [...subtasks, { id: `st-${Date.now()}`, title, isCompleted: false }]; setSubtasks(st); data.workItems.update(item.id, { subtasks: st }); return Promise.resolve(); }}
                  onToggle={(id) => { const st = subtasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t); setSubtasks(st); data.workItems.update(item.id, { subtasks: st }); return Promise.resolve(); }}
                  onDelete={(id) => { const st = subtasks.filter(t => t.id !== id); setSubtasks(st); data.workItems.update(item.id, { subtasks: st }); return Promise.resolve(); }}
                />
              </div>

              <div className="print:hidden">
                <AiAnalysisCard item={item} />
              </div>
          </div>

          <div className={`${activeTab === 'resources' ? 'block' : 'hidden'} animate-fade-in`}>
             <TimeTrackingManager item={item} onLogTime={async (h, n) => {}} />
          </div>

          <div className={`${activeTab === 'timeline' ? 'block' : 'hidden print:block'} space-y-8 animate-fade-in`}>
             <ApprovalChain item={item} currentUserID={currentUser?.id} onDecision={async () => {}} isSubmitting={false} />
          </div>

          <div className={`${activeTab === 'comments' ? 'block' : 'hidden'} animate-fade-in`}>
             <CommentSection comments={item.comments || []} currentUser={currentUser} onPostComment={async (text) => {
                const newComment = { id: `c-${Date.now()}`, text, userId: currentUser?.id || 'U', userName: currentUser?.name || 'User', userAvatar: currentUser?.avatar, timestamp: new Date().toISOString() };
                await data.workItems.addComment(item.id, newComment);
                onRefresh();
             }} />
          </div>
        </div>

        {/* Floating Action Footer */}
        {item.status !== Status.DONE && activeTab === 'content' && (
           <div className="p-8 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md shrink-0 print:hidden">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200"><ShieldAlert size={24}/></div>
                    <div>
                       <p className="font-black text-slate-900">جاهز لإغلاق المهمة؟</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">سيتطلب ذلك التحقق من الموقع الجغرافي</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => handleStatusTransition(Status.DONE)}
                    className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm hover:scale-105 transition-all shadow-2xl"
                 >
                    إغلاق المهمة كـ "منجز"
                 </button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

const TabItem = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {icon} {label}
    {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
  </button>
);

export default WorkItemDetail;
