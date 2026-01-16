import React, { useState, useEffect } from 'react';
import { WorkItem, Priority, Status, Project, User, ApprovalDecision, Comment, Subtask } from '../../shared/types';
import { useData } from '../../context/DataContext';
import { useToast } from '../../shared/ui/ToastProvider';
// Fix: Added missing CalendarClock and Plus icons to the imports
import { X, Clock, User as UserIcon, MapPin, EyeOff, Lock, RefreshCcw, Briefcase, Sparkles, LayoutList, History, MessageSquare, CheckCircle, CalendarClock, Plus } from 'lucide-react';

// Sub-components
import ApprovalChain from './components/ApprovalChain';
import SubtaskList from './components/SubtaskList';
import CommentSection from './components/CommentSection';
import AiAnalysisCard from './components/AiAnalysisCard';

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
  const [submitting, setSubmitting] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>(item.subtasks || []);
  const [activeTab, setActiveTab] = useState<'content' | 'timeline' | 'comments'>('content');
  
  const isAnonymous = item.creatorId === 'ANONYMOUS' || item.tags?.includes('Anonymous');

  useEffect(() => {
    setSubtasks(item.subtasks || []);
  }, [item.id, item.subtasks]);

  const handleApprovalDecision = async (stepId: string, decision: ApprovalDecision, comment: string) => {
    if(!comment && decision === ApprovalDecision.REJECTED) {
      showToast("يرجى ذكر سبب الرفض في التعليقات لضمان توثيق الحالة.", "info");
      return;
    }
    setSubmitting(true);
    try {
      await data.workItems.submitApprovalDecision(item.id, stepId, decision, comment);
      showToast("تم تسجيل قرارك بنجاح.", "success");
      onRefresh(); 
      onClose(); 
    } catch (e: any) {
      showToast("عذراً، فشل معالجة طلب الاعتماد.", "error");
      onRefresh();
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (p: Priority) => {
    switch(p) {
      case Priority.CRITICAL: return 'bg-rose-600 shadow-rose-200';
      case Priority.HIGH: return 'bg-orange-600 shadow-orange-200';
      default: return 'bg-blue-600 shadow-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/60 backdrop-blur-sm transition-all" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right relative"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Modern Header Panel */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 shrink-0">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getPriorityBadge(item.priority)} animate-pulse`}></div>
              <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest">{item.id}</span>
              <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-slate-900 text-white shadow-sm">
                {item.type}
              </span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">{item.title}</h2>
            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase">
               <span className="flex items-center gap-1.5"><CalendarClock size={14} className="text-blue-500" /> أنشئت: {item.createdAt}</span>
               <span className="flex items-center gap-1.5"><MapPin size={14} className="text-blue-500" /> {project?.name || 'موقع عام'}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white hover:bg-rose-50 hover:text-rose-600 rounded-2xl text-slate-400 shadow-sm transition-all border border-slate-100">
            <X size={24} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-8 pt-4 flex gap-6 border-b border-slate-50 bg-white">
           <TabItem active={activeTab === 'content'} onClick={() => setActiveTab('content')} icon={<LayoutList size={16}/>} label="التفاصيل" />
           <TabItem active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<History size={16}/>} label="سجل الأحداث" />
           <TabItem active={activeTab === 'comments'} onClick={() => setActiveTab('comments')} icon={<MessageSquare size={16}/>} label="المناقشة" />
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
          
          {activeTab === 'content' && (
            <div className="space-y-10 animate-fade-in">
              {/* Status Header */}
              <div className="flex items-center justify-between p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><CheckCircle size={100}/></div>
                <div className="relative z-10">
                  <p className="text-[10px] text-blue-400 uppercase tracking-widest font-black mb-1">الحالة التشغيلية</p>
                  <p className="text-2xl font-black">{item.status}</p>
                </div>
                {item.status !== Status.DONE && item.status !== Status.APPROVED && (
                  <button 
                    onClick={() => onUpdateStatus(item.id, Status.DONE)}
                    className="relative z-10 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-2xl shadow-xl transition-all flex items-center gap-2"
                  >
                    إغلاق المهمة
                  </button>
                )}
              </div>

              {/* Description Box */}
              <div className="space-y-4">
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-r-4 border-blue-600 pr-3">وصف العملية والحالة</h3>
                 <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200/60 leading-relaxed font-bold text-slate-600 whitespace-pre-wrap shadow-inner">
                    {item.description}
                 </div>
              </div>

              <SubtaskList 
                subtasks={subtasks}
                onAdd={(title) => { const st = [...subtasks, { id: `st-${Date.now()}`, title, isCompleted: false }]; setSubtasks(st); data.workItems.update(item.id, { subtasks: st }); return Promise.resolve(); }}
                onToggle={(id) => { const st = subtasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t); setSubtasks(st); data.workItems.update(item.id, { subtasks: st }); return Promise.resolve(); }}
                onDelete={(id) => { const st = subtasks.filter(t => t.id !== id); setSubtasks(st); data.workItems.update(item.id, { subtasks: st }); return Promise.resolve(); }}
              />

              <AiAnalysisCard item={item} />
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-8 animate-fade-in">
               <ApprovalChain 
                 item={item} 
                 currentUserID={currentUser?.id} 
                 onDecision={handleApprovalDecision} 
                 isSubmitting={submitting} 
               />
               
               <div className="space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">التسلسل الزمني للإجراءات</h3>
                  <div className="relative border-r-2 border-slate-100 pr-8 space-y-8 mr-4">
                     <TimelineStep title="إنشاء السجل" user={item.creatorId === 'ANONYMOUS' ? 'نظام البلاغات الآمن' : 'مكتب الموقع'} time={item.createdAt} icon={<Plus size={12}/>} />
                     {item.status !== Status.OPEN && <TimelineStep title="تحديث الحالة" user="مشرف النظام" time={item.updatedAt} icon={<RefreshCcw size={12}/>} isLast />}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="h-full flex flex-col animate-fade-in">
              <CommentSection 
                comments={item.comments} 
                currentUser={currentUser || null} 
                onPostComment={async (text) => {
                   const comment: Comment = { id: `c-${Date.now()}`, text, userId: currentUser?.id || '', userName: currentUser?.name || '', userAvatar: currentUser?.avatar, timestamp: new Date().toISOString() };
                   await data.workItems.addComment(item.id, comment);
                   onRefresh();
                }} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabItem = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 pb-4 px-2 text-[11px] font-black uppercase tracking-widest transition-all relative ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {icon} {label}
    {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
  </button>
);

const TimelineStep = ({ title, user, time, icon, isLast }: any) => (
  <div className="relative">
     <div className="absolute -right-[41px] top-0 w-5 h-5 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center text-blue-500 shadow-sm z-10">
        {icon}
     </div>
     <div>
        <p className="text-sm font-black text-slate-800 leading-none">{title}</p>
        <p className="text-[10px] font-bold text-slate-400 mt-1">{user} • {time}</p>
     </div>
  </div>
);

export default WorkItemDetail;