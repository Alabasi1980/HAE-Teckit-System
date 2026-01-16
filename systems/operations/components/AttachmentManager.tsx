
import React from 'react';
import { WorkItemAttachment } from '../../../shared/types';
import { Paperclip, FileText, ExternalLink, Trash2, Camera, Upload, Eye } from 'lucide-react';

interface AttachmentManagerProps {
  attachments: WorkItemAttachment[];
  onAdd: (file: File) => Promise<void>;
}

const AttachmentManager: React.FC<AttachmentManagerProps> = ({ attachments, onAdd }) => {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-r-4 border-blue-600 pr-3 flex items-center gap-2">
             <Paperclip size={16} /> الوثائق والمرفقات
          </h3>
          <label className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-sm border border-blue-100">
             <Upload size={18}/>
             <input type="file" className="hidden" onChange={e => e.target.files && onAdd(e.target.files[0])} />
          </label>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attachments.length === 0 ? (
             <div className="col-span-full py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 gap-2">
                <Camera size={32} className="opacity-20"/>
                <p className="text-[10px] font-black uppercase tracking-widest">لا توجد صور أو ملفات مرفقة</p>
             </div>
          ) : (
             attachments.map(att => (
                <div key={att.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-all">
                   <div className="flex items-center gap-4 min-w-0">
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                         {att.type.includes('image') ? <Camera size={20}/> : <FileText size={20}/>}
                      </div>
                      <div className="min-w-0">
                         <p className="text-xs font-black text-slate-800 truncate">{att.name}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase">{att.size} • {att.uploadedBy}</p>
                      </div>
                   </div>
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-blue-600"><Eye size={16}/></button>
                      <button className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={16}/></button>
                   </div>
                </div>
             ))
          )}
       </div>
    </div>
  );
};

export default AttachmentManager;
