
import React from 'react';
import { 
  LayoutDashboard, HardHat, ListTodo, ShieldCheck, 
  Zap, Building2, Package, Wallet, Users, 
  FileText, BookOpen, Settings, UserCircle, LogOut, TicketCheck, ChevronLeft,
  Network, Scale, Landmark
} from 'lucide-react';
import { authService } from '../../auth';
import { View } from '../../../shared/types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen }) => {
  const systems = [
    {
      id: 'core',
      label: 'الرئيسية',
      icon: LayoutDashboard,
      actions: [
        { id: 'dash', label: 'لوحة التحكم', icon: LayoutDashboard, view: 'dashboard' as View },
        { id: 'org', label: 'الهيكل التنظيمي', icon: Network, view: 'org-structure' as View },
      ]
    },
    {
      id: 'ops',
      label: 'نظام العمليات',
      icon: HardHat,
      actions: [
        { id: 'ops-daily', label: 'مركز العمليات', icon: ListTodo, view: 'workitems' as View },
        { id: 'ops-load', label: 'موازن ضغط العمل', icon: Scale, view: 'workload' as View },
        { id: 'ops-comp', label: 'مركز الامتثال', icon: Landmark, view: 'compliance' as View },
        { id: 'ops-tickets', label: 'مركز التذاكر', icon: TicketCheck, view: 'tickets' as View },
        { id: 'ops-appr', label: 'مركز الاعتمادات', icon: ShieldCheck, view: 'approvals' as View },
        { id: 'fld-gate', label: 'بوابة الميدان', icon: Zap, view: 'field-ops' as View },
      ]
    },
    {
      id: 'proj',
      label: 'إدارة المشاريع',
      icon: Building2,
      actions: [
        { id: 'p-list', label: 'كافة المشاريع', icon: Building2, view: 'projects' as View },
        { id: 'p-docs', label: 'الأرشيف الفني', icon: FileText, view: 'documents' as View },
      ]
    },
    {
      id: 'resources',
      label: 'الموارد والأصول',
      icon: Package,
      actions: [
        { id: 'res-assets', label: 'سجل الأصول', icon: HardHat, view: 'assets' as View },
        { id: 'res-inv', label: 'المخزون', icon: Package, view: 'inventory' as View },
      ]
    },
    {
      id: 'finance',
      label: 'المالية والتعاقدات',
      icon: Wallet,
      actions: [
        { id: 'fin-cost', label: 'مركز التكاليف', icon: Wallet, view: 'finance' as View },
      ]
    },
    {
      id: 'hr',
      label: 'الموارد البشرية',
      icon: Users,
      actions: [
        { id: 'hr-dash', label: 'الموظفين', icon: Users, view: 'hr' as View },
        { id: 'hr-pay', label: 'الرواتب', icon: Wallet, view: 'payroll' as View },
      ]
    }
  ];

  return (
    <aside className={`bg-slate-900 text-white h-screen flex flex-col transition-all duration-300 z-50 ${isOpen ? 'w-72' : 'w-20'}`} dir="rtl">
      <div className="p-6 flex items-center justify-between">
        {isOpen && <h1 className="text-2xl font-black tracking-tighter">ENJAZ <span className="text-blue-500">ONE</span></h1>}
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-white/10 rounded-xl">
           <ChevronLeft className={`transition-transform ${!isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-8 py-6">
        {systems.map(sys => (
          <div key={sys.id}>
             {isOpen && <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">{sys.label}</p>}
             <div className="space-y-1">
                {sys.actions.map(action => (
                   <button 
                     key={action.id}
                     onClick={() => setCurrentView(action.view)}
                     className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${currentView === action.view ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                   >
                      <action.icon size={20} />
                      {isOpen && <span className="text-sm font-bold">{action.label}</span>}
                   </button>
                ))}
             </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/5 space-y-1">
         <button 
           onClick={() => setCurrentView('profile')}
           className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${currentView === 'profile' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
         >
            <UserCircle size={20} />
            {isOpen && <span className="text-sm font-bold">الملف الشخصي</span>}
         </button>
         <button 
           onClick={() => authService.logout()}
           className="w-full flex items-center gap-4 p-3 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all"
         >
            <LogOut size={20} />
            {isOpen && <span className="text-sm font-bold">تسجيل الخروج</span>}
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;
