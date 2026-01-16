import React, { useState } from 'react';
import { TicketType, TicketPriority, Ticket } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../shared/ui/ToastProvider';
import { TICKET_SCHEMAS } from '../config/ticketSchemas';
import { X, Send, AlertCircle, Info, Sparkles, Loader2, ChevronRight } from 'lucide-react';

interface CreateTicketViewProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTicketView: React.FC<CreateTicketViewProps> = ({ onClose, onSuccess }) => {
  const data = useData();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<TicketType>(TicketType.INQUIRY);
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.P3_MEDIUM);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dynamicFields, setDynamicFields] = useState<Record<string, any>>({});

  const schema = TICKET_SCHEMAS[type];

  const handleFieldChange = (name: string, value: any) => {
    setDynamicFields(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await data.users.getCurrentUser();
      
      // Merge base description with dynamic fields for persistence
      let fullDescription = description;
      if (Object.keys(dynamicFields).length > 0) {
        fullDescription += "\n\n---\nمعلومات إضافية:\n" + 
          Object.entries(dynamicFields).map(([k, v]) => `${k}: ${v}`).join('\n');
      }

      await data.tickets.create({
        title,
        description: fullDescription,
        type,
        priority,
        requesterId: user.id,
        requesterName: user.name,
        tags: [type]
      });

      showToast("تم فتح التذكرة بنجاح وجاري توجيهها للفريق المختص.", "success");
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || "فشل إنشاء التذكرة.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><Sparkles size={24}/></div>
              <div>
                 <h3 className="text-xl font-black text-slate-900">فتح تذكرة خدمة جديدة</h3>
                 <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">موجه بالنماذج الذكية (Schema-Driven)</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all"><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
           {/* Step 1: Classification */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">نوع التذكرة</label>
                 <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 transition-all"
                    value={type}
                    onChange={e => { setType(e.target.value as TicketType); setDynamicFields({}); }}
                 >
                    {Object.values(TicketType).map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الأولوية التشغيلية</label>
                 <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 transition-all"
                    value={priority}
                    onChange={e => setPriority(e.target.value as TicketPriority)}
                 >
                    {Object.values(TicketPriority).map(p => <option key={p} value={p}>{p}</option>)}
                 </select>
              </div>
           </div>

           {/* Step 2: Content */}
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">عنوان موجز</label>
                 <input 
                    required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 transition-all"
                    placeholder="مثال: عطل في رافعة الموقع الشمالي"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">شرح المشكلة أو الطلب</label>
                 <textarea 
                    required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold h-32 resize-none focus:ring-4 focus:ring-blue-100 transition-all"
                    placeholder="يرجى تزويدنا بكافة التفاصيل لتسريع الحل..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                 />
              </div>
           </div>

           {/* Step 3: Dynamic Schema Fields */}
           {schema && schema.fields.length > 0 && (
              <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 space-y-6">
                 <div className="flex items-center gap-2 mb-2 text-indigo-900 font-black">
                    <Info size={16} /> حقول النوع: {type}
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {schema.fields.map(field => (
                       <div key={field.name} className="space-y-1.5">
                          <label className="text-[10px] font-black text-indigo-400 uppercase mr-1">{field.label} {field.required && '*'}</label>
                          {field.type === 'select' ? (
                             <select 
                                required={field.required}
                                className="w-full p-3 bg-white border border-indigo-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-indigo-200"
                                onChange={e => handleFieldChange(field.name, e.target.value)}
                             >
                                <option value="">اختر...</option>
                                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                             </select>
                          ) : field.type === 'textarea' ? (
                             <textarea 
                                required={field.required}
                                className="w-full p-3 bg-white border border-indigo-100 rounded-xl text-xs font-bold h-20 resize-none"
                                onChange={e => handleFieldChange(field.name, e.target.value)}
                             />
                          ) : (
                             <input 
                                type={field.type}
                                required={field.required}
                                placeholder={field.placeholder}
                                className="w-full p-3 bg-white border border-indigo-100 rounded-xl text-xs font-bold"
                                onChange={e => handleFieldChange(field.name, e.target.value)}
                             />
                          )}
                       </div>
                    ))}
                 </div>
              </div>
           )}
        </form>

        <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
           <button onClick={onClose} className="px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all">إلغاء</button>
           <button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
           >
              {loading ? <Loader2 className="animate-spin" size={18}/> : <Send size={18} className="rotate-180"/>}
              إرسال التذكرة الآن
           </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketView;
