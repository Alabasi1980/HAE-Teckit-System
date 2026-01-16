
import React, { useState, useEffect } from 'react';
import { Ticket, TicketComment, CommentVisibility, TicketStatus, TicketPriority, TicketActivity } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../shared/ui/ToastProvider';
import { X, Send, Lock, Eye, History, Sparkles, User, Clock, CheckCircle2, ChevronDown, MoreVertical, MessageSquare, Loader2, AlertCircle, RefreshCw, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DigitalSignatureModal from './DigitalSignatureModal';

interface TicketDetailViewProps {
  ticket: Ticket;
  onClose: () => void;
  onRefresh: () => void;
}

const TicketDetailView: React.FC<TicketDetailViewProps> = ({ ticket, onClose, onRefresh }) => {
  const data = useData();
  const { showToast } = useToast();
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [activities, setActivities] = useState<TicketActivity[]>([]);
  const [newComment, setNewComment] = useState('');
  const [visibility, setVisibility] = useState<CommentVisibility>(CommentVisibility.PUBLIC);
  const [isPosting, setIsPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('enjaz_session_user') || '{}');
  const isPrivileged = ['Project Manager', 'Supervisor', 'Admin'].includes(currentUser.role);

  useEffect(() => { loadData(); }, [ticket.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, a] = await Promise.all([
        data.tickets.getComments(ticket.id),
        data.tickets.getActivities(ticket.id)
      ]);
      setComments(c);
      setActivities(a);
    } finally { setLoading(false); }
  };

  const handlePost = async () => {
    if (!newComment.trim()) return;
    setIsPosting(true);
    try {
      await data.tickets.addComment(ticket.id, {
        body: newComment,
        visibility: visibility,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar
      });
      setNewComment('');
      loadData();
      showToast("تم تسجيل التعليق بنجاح.", "success");
    } finally { setIsPosting(false); }
  };

  const handleTransition = async (status: TicketStatus) => {
    // إذا كانت الحالة المطلوبة هي RESOLVED، نفتح المودال بدلاً من التحديث المباشر
    if (status === TicketStatus.RESOLVED && !ticket.signatureUrl) {
      setIsSignModalOpen(true);
      return;
    }

    try {
      await data.tickets.transitionStatus(ticket.id, status, "تحديث من لوحة الإدارة.");
      onRefresh();
      loadData();
      showToast(`تم تغيير الحالة إلى ${status}`, "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSignatureSave = async (signatureUrl: string) => {
    try {
      // حفظ التوقيع أولاً
      await data.tickets.update(ticket.id, { signatureUrl });
      // ثم تغيير الحالة
      await data.tickets.transitionStatus(ticket.id, TicketStatus.RESOLVED, "تم الحل مع إرفاق توقيع رقمي.");
      
      setIsSignModalOpen(false);
      onRefresh();
      loadData();
      showToast("تم اعتماد الحل وحفظ التوقيع بنجاح.", "success");
    } catch (err: any) {
      showToast("فشل في حفظ التوقيع والاعتماد.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex justify-end bg-slate-900/60 backdrop-blur-md transition-all" onClick={onClose}>
      <div 
        className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right relative"
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 shrink-0">
           <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                 <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 font-mono">{ticket.key}</span>
                 <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${ticket.priority === TicketPriority.P1_CRITICAL ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'}`}>{ticket.priority}</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{ticket.title}</h2>
              <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <span className="flex items-center gap-1.5"><User size={14}/> الطالب: {ticket.requesterName}</span>
                 <span className="flex items-center gap-1.5"><CheckCircle2 size={14}/> الحالة الحالية: {ticket.status}</span>
              </div>
           </div>
           <button onClick={onClose} className="p-3 bg-white hover:bg-rose-50 hover:text-rose-600 rounded-2xl text-slate-300 shadow-sm transition-all border border-slate-100"><X size={24}/></button>
        </div>

        <div className="flex-1 flex overflow-hidden">
           {/* Main Area */}
           <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
              <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200/60 font-bold text-slate-600 leading-relaxed shadow-inner whitespace-pre-wrap">
                 {ticket.description}
              </div>

              {ticket.signatureUrl && (
                <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100 flex items-center justify-between shadow-sm">
                   <div>
                      <h4 className="font-black text-emerald-900 text-sm mb-1 flex items-center gap-2"><CheckCircle2 size={16}/> المصادقة الرقمية</h4>
                      <p className="text-xs text-emerald-700 font-bold">تم إغلاق التذكرة بتوقيع معتمد من الموقع.</p>
                   </div>
                   <div className="w-32 h-16 bg-white rounded-xl border border-emerald-200 overflow-hidden">
                      <img src={ticket.signatureUrl} alt="Signature" className="w-full h-full object-contain" />
                   </div>
                </div>
              )}

              <div className="flex border-b border-slate-100 gap-8">
                 <button onClick={() => setActiveTab('chat')} className={`pb-4 px-2 flex items-center gap-2 text-xs font-black transition-all relative ${activeTab === 'chat' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <MessageSquare size={16}/> المناقشة الفنية
                    {activeTab === 'chat' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
                 </button>
                 <button onClick={() => setActiveTab('history')} className={`pb-4 px-2 flex items-center gap-2 text-xs font-black transition-all relative ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <History size={16}/> سجل الأحداث والتدقيق
                    {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
                 </button>
              </div>

              {activeTab === 'chat' ? (
                <div className="space-y-8 animate-fade-in">
                   {comments.map(c => (
                      <div key={c.id} className={`flex gap-4 ${c.visibility === CommentVisibility.INTERNAL ? 'bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100' : ''}`}>
                         <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 shadow-sm bg-slate-200 flex items-center justify-center font-black">
                            {c.authorName.charAt(0)}
                         </div>
                         <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                               <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-slate-900">{c.authorName}</span>
                                  {c.visibility === CommentVisibility.INTERNAL && <span className="text-[9px] font-black text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 uppercase"><Lock size={10}/> ملاحظة داخلية</span>}
                               </div>
                               <span className="text-[10px] font-black text-slate-400">{new Date(c.createdAt).toLocaleTimeString('ar-SA')}</span>
                            </div>
                            <div className="prose prose-sm prose-slate max-w-none text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                               {c.body}
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in pr-4 border-r-2 border-slate-100 mr-2">
                   {activities.map(act => (
                      <div key={act.id} className="relative pb-6">
                         <div className="absolute -right-[1.15rem] top-1 w-3 h-3 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                         <p className="text-sm font-black text-slate-800">{act.action}</p>
                         <p className="text-xs font-bold text-slate-500 mt-1">{act.details}</p>
                         <div className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {act.actorName} • {new Date(act.createdAt).toLocaleString('ar-SA')}
                         </div>
                      </div>
                   ))}
                </div>
              )}
           </div>

           {/* Sidebar */}
           <div className="w-80 border-r border-slate-100 p-8 space-y-8 bg-slate-50/30 overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إدارة الدورة التشغيلية</p>
                 <div className="grid grid-cols-1 gap-2">
                    <StatusBtn active={ticket.status === TicketStatus.OPEN} label="فتح التذكرة" onClick={() => handleTransition(TicketStatus.OPEN)} />
                    <StatusBtn active={ticket.status === TicketStatus.IN_PROGRESS} label="قيد المعالجة" onClick={() => handleTransition(TicketStatus.IN_PROGRESS)} />
                    <StatusBtn active={ticket.status === TicketStatus.RESOLVED} label="اعتماد الحل (مع توقيع)" color="bg-emerald-600" onClick={() => handleTransition(TicketStatus.RESOLVED)} />
                 </div>
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">التوافق مع SLA</p>
                 <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <SlaIndicator label="وقت الحل المستهدف" due={ticket.resolutionDueAt} />
                 </div>
              </div>
           </div>
        </div>

        {/* Reply Drawer */}
        <div className="p-8 border-t border-slate-100 bg-white shrink-0">
           <div className="flex gap-2 mb-4">
              <button onClick={() => setVisibility(CommentVisibility.PUBLIC)} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${visibility === CommentVisibility.PUBLIC ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>رد عام للعميل</button>
              {isPrivileged && <button onClick={() => setVisibility(CommentVisibility.INTERNAL)} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${visibility === CommentVisibility.INTERNAL ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>ملاحظة داخلية للفريق</button>}
           </div>
           <div className="relative">
              <textarea 
                className={`w-full p-6 ${visibility === CommentVisibility.INTERNAL ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'} border rounded-[2rem] text-sm font-bold h-28 resize-none outline-none focus:ring-4 focus:ring-blue-100 transition-all`}
                placeholder={visibility === CommentVisibility.PUBLIC ? "اكتب ردك للعميل هنا..." : "سجل ملاحظاتك التقنية الخاصة بالفريق..."}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <button 
                onClick={handlePost}
                disabled={isPosting || !newComment.trim()}
                className="absolute left-4 bottom-4 p-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-all disabled:opacity-50"
              >
                {isPosting ? <Loader2 className="animate-spin" size={20}/> : <Send size={20} className="rotate-180" />}
              </button>
           </div>
        </div>
      </div>

      <DigitalSignatureModal 
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSave={handleSignatureSave}
        title="توقيع اعتماد الحل النهائي"
      />
    </div>
  );
};

const StatusBtn = ({ active, label, onClick, color = "bg-blue-600" }: any) => (
  <button onClick={onClick} className={`w-full py-3 rounded-xl text-[10px] font-black transition-all ${active ? `${color} text-white shadow-lg` : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 shadow-sm'}`}>
     {label}
  </button>
);

const SlaIndicator = ({ label, due }: any) => {
  const isBreached = new Date(due) < new Date();
  return (
    <div>
       <div className="flex justify-between items-center mb-1.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
          <span className={`text-[10px] font-black ${isBreached ? 'text-rose-600' : 'text-emerald-600'}`}>{isBreached ? 'متجاوز' : 'ضمن الوقت'}</span>
       </div>
       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${isBreached ? 'bg-rose-500' : 'bg-emerald-500'} w-[80%]`}></div>
       </div>
    </div>
  );
};

export default TicketDetailView;
