
import React, { useState, useMemo } from 'react';
import { 
  WorkItem, WorkItemType, Priority, Project, 
  User, Status, RecurrenceInterval 
} from '../../../shared/types';
import { 
  /* Fix: Added Send to the list of imports from lucide-react */
  X, Plus, Mic, Sparkles, Camera, MapPin, 
  UserCheck, Calendar, ShieldCheck, AlertTriangle, 
  Search, Check, Loader2, Paperclip, Box, 
  ChevronDown, Layers, Info, Send
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { fileToBase64, resizeImage } from '../../../shared/utils/fileUtils';

interface CreateWorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  users: User[];
  currentUser: User | null;
  onCreate: (item: Partial<WorkItem>) => Promise<void>;
  initialContext?: { relatedToId?: string; relatedToType?: WorkItem['relatedToType'] };
}

const CreateWorkItemModal: React.FC<CreateWorkItemModalProps> = ({ 
  isOpen, onClose, projects, users, currentUser, onCreate, initialContext 
}) => {
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  
  const [formData, setFormData] = useState<Partial<WorkItem>>({
    type: WorkItemType.TASK,
    priority: Priority.MEDIUM,
    status: Status.OPEN,
    title: '',
    description: '',
    projectId: initialContext?.relatedToId || projects[0]?.id || '',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    recurrence: RecurrenceInterval.NONE,
    assigneeId: '',
    attachments: []
  });

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.role.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

  const handleVoiceCommand = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("المتصفح لا يدعم التعرف على الصوت.");

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.start();
    setIsListening(true);

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      setLoading(true);

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
           model: 'gemini-3-flash-preview',
           contents: `حول النص التالي لمهنة إنشائية: "${transcript}". أعطني النتيجة كـ JSON باللغة الإنجليزية للقيم: { "title": "...", "description": "...", "priority": "Low|Medium|High|Critical", "type": "Task|Approval|Incident|Observation" }`,
           config: { responseMimeType: "application/json" }
        });
        
        const structured = JSON.parse(response.text || '{}');
        setFormData(prev => ({
          ...prev,
          title: structured.title || prev.title,
          description: structured.description || prev.description,
          priority: (structured.priority as Priority) || prev.priority,
          type: (structured.type as WorkItemType) || prev.type
        }));
      } catch (e) {
        console.error("AI Transcription Structuring failed", e);
      } finally {
        setLoading(false);
      }
    };

    recognition.onerror = () => setIsListening(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      const compressed = await resizeImage(base64, 800);
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), compressed]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.projectId) return;
    
    setLoading(true);
    try {
      await onCreate({
        ...formData,
        creatorId: currentUser?.id,
        createdAt: new Date().toISOString()
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in" dir="rtl">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col animate-scale-in overflow-hidden border border-slate-200">
        
        {/* Header Section */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-5">
             <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl">
               <Plus size={28} />
             </div>
             <div>
                <h2 className="text-2xl font-black text-slate-900 leading-none">إصدار تكليف تشغيلي</h2>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">محرك العمليات المركزية للمؤسسة</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
               type="button"
               onClick={handleVoiceCommand}
               className={`p-4 rounded-2xl transition-all shadow-sm flex items-center gap-2 font-black text-xs ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-blue-600 border border-blue-100 hover:bg-blue-50'}`}
             >
                {isListening ? 'جاري الاستماع...' : <><Mic size={20}/> أمر صوتي</>}
             </button>
             <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl text-slate-400 transition-all"><X size={24} /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
           
           {loading && !isListening && (
             <div className="bg-blue-600 p-4 rounded-2xl text-white flex items-center justify-center gap-3 animate-pulse shadow-lg">
                <Loader2 className="animate-spin" size={20}/>
                <span className="text-sm font-black">جاري معالجة البيانات عبر Gemini AI...</span>
             </div>
           )}

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* Column 1: Core Identification */}
              <div className="lg:col-span-2 space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-1 flex items-center gap-2">
                       <Info size={14} className="text-blue-500" /> تصنيف العملية
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                       {Object.values(WorkItemType).map(t => (
                          <button 
                             key={t}
                             type="button"
                             onClick={() => setFormData({...formData, type: t})}
                             className={`px-4 py-3 rounded-xl text-[10px] font-black transition-all border ${formData.type === t ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'}`}
                          >
                             {t}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-1">عنوان المهمة</label>
                    <input 
                      required 
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-lg font-black focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                      placeholder="ما الذي يجب إنجازه؟" 
                      value={formData.title} 
                      onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    />
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-1">بيان العمل والتعليمات</label>
                    <textarea 
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-bold h-40 resize-none focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all leading-relaxed"
                      placeholder="اشرح الخطوات المطلوبة، المعايير الفنية، أو تفاصيل البلاغ بدقة..." 
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    />
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-1">المرفقات والوثائق</label>
                    <div className="flex flex-wrap gap-4">
                       <label className="w-24 h-24 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all cursor-pointer bg-slate-50/50">
                          <Camera size={24} />
                          <span className="text-[8px] font-black mt-2">إضافة</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                       </label>
                       {formData.attachments?.map((img, idx) => (
                          <div key={idx} className="w-24 h-24 rounded-3xl overflow-hidden border border-slate-200 relative group shadow-sm">
                             <img src={img} className="w-full h-full object-cover" />
                             <button 
                                type="button"
                                onClick={() => setFormData({...formData, attachments: formData.attachments?.filter((_, i) => i !== idx)})}
                                className="absolute inset-0 bg-rose-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                <X size={20}/>
                             </button>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Column 2: Assignment & Controls */}
              <div className="space-y-8">
                 <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-xl space-y-6">
                    <div className="space-y-4">
                       <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest mr-1">المشروع المرتبط</label>
                       <select 
                          required
                          className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-sm font-bold outline-none focus:bg-white/20 transition-all"
                          value={formData.projectId}
                          onChange={e => setFormData({...formData, projectId: e.target.value})}
                       >
                          {projects.map(p => <option key={p.id} value={p.id} className="text-slate-900">{p.name}</option>)}
                       </select>
                    </div>

                    <div className="space-y-4 relative">
                       <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest mr-1">إسناد المسؤولية</label>
                       <div className="relative">
                          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                          <input 
                             type="text" 
                             className="w-full pr-12 pl-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-sm font-bold outline-none focus:bg-white/20 transition-all"
                             placeholder="بحث عن موظف أو دور..."
                             value={formData.assigneeId ? users.find(u => u.id === formData.assigneeId)?.name : userSearch}
                             onChange={e => { setUserSearch(e.target.value); setFormData({...formData, assigneeId: ''}); setShowUserList(true); }}
                             onFocus={() => setShowUserList(true)}
                          />
                          {showUserList && (
                             <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-scale-in max-h-60 overflow-y-auto no-scrollbar">
                                {filteredUsers.map(user => (
                                   <button 
                                      key={user.id}
                                      type="button"
                                      onClick={() => { setFormData({...formData, assigneeId: user.id}); setShowUserList(false); setUserSearch(''); }}
                                      className="w-full p-4 flex items-center gap-3 hover:bg-blue-50 text-right transition-colors border-b border-slate-50 last:border-0"
                                   >
                                      <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0"><img src={user.avatar} className="w-full h-full object-cover"/></div>
                                      <div>
                                         <p className="text-sm font-black text-slate-900">{user.name}</p>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase">{user.role}</p>
                                      </div>
                                      {formData.assigneeId === user.id && <Check size={16} className="mr-auto text-blue-600" />}
                                   </button>
                                ))}
                             </div>
                          )}
                       </div>
                    </div>
                 </div>

                 <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الأولوية</label>
                       <div className="flex gap-2">
                          {[Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL].map(p => (
                             <button 
                                key={p}
                                type="button"
                                onClick={() => setFormData({...formData, priority: p})}
                                className={`flex-1 py-3 rounded-xl text-[9px] font-black transition-all border ${
                                   formData.priority === p 
                                   ? (p === Priority.CRITICAL ? 'bg-rose-600 text-white border-rose-600 shadow-lg' : 'bg-blue-600 text-white border-blue-600 shadow-lg')
                                   : 'bg-white text-slate-400 border-slate-100'
                                }`}
                             >
                                {p}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الموعد النهائي</label>
                       <div className="relative">
                          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                             type="date" 
                             className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                             value={formData.dueDate}
                             onChange={e => setFormData({...formData, dueDate: e.target.value})}
                          />
                       </div>
                    </div>

                    {formData.type === WorkItemType.APPROVAL && (
                       <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4 animate-pulse-soft">
                          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm"><ShieldCheck size={20}/></div>
                          <div>
                             <p className="text-[10px] font-black text-indigo-900 uppercase">سلسلة الاعتمادات</p>
                             <p className="text-[9px] font-bold text-indigo-600">سيتم تفعيل نظام "الموافقة الهرمية" لهذا الطلب آلياً.</p>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </form>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <ShieldCheck size={14} className="text-emerald-500" /> كافة البيانات تخضع لبروتوكول الأمان المؤسسي
           </div>
           <div className="flex gap-3 w-full md:w-auto">
              <button onClick={onClose} className="flex-1 md:flex-none px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all">إلغاء</button>
              <button 
                onClick={handleSubmit}
                disabled={loading || !formData.title}
                className="flex-[2] md:flex-none px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10 hover:scale-105 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20}/> : <Send size={20} className="rotate-180" />}
                اعتماد ونشر التكليف
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkItemModal;
