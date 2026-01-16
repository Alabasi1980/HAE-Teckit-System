
import React from 'react';
import { WorkItem, Priority } from '../../../shared/types';
import { Link2, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

interface DependencyManagerProps {
  item: WorkItem;
  allItems: WorkItem[];
  onDependencyClick: (id: string) => void;
}

const DependencyManager: React.FC<DependencyManagerProps> = ({ item, allItems, onDependencyClick }) => {
  const dependencies = allItems.filter(i => item.dependencies?.includes(i.id));

  if (!item.dependencies || item.dependencies.length === 0) return null;

  return (
    <div className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-200/60 shadow-inner">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <Link2 size={16} className="text-blue-600" /> المهام المرتبطة (Dependencies)
        </h4>
        <span className="text-[10px] font-black text-slate-400">تحتاج هذه المهمة لإغلاق ما يلي أولاً</span>
      </div>

      <div className="space-y-3">
        {dependencies.map(dep => (
          <div 
            key={dep.id} 
            onClick={() => onDependencyClick(dep.id)}
            className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl hover:border-blue-300 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${dep.status === 'Done' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500 animate-pulse'}`}>
                {dep.status === 'Done' ? <CheckCircle2 size={14}/> : <AlertTriangle size={14}/>}
              </div>
              <div>
                 <p className="text-xs font-black text-slate-800 group-hover:text-blue-600 transition-colors">{dep.title}</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">{dep.id} • {dep.status}</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-300" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DependencyManager;
