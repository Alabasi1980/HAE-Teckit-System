
import React, { useState } from 'react';
import { 
  LayoutGrid, CheckSquare, Building2, FolderOpen, BookOpen, 
  Box, HardHat, ChevronLeft, ChevronRight, UserCircle, LogOut,
  ShieldCheck, HelpCircle, Activity
} from 'lucide-react';
import { User } from '../../../shared/types';
import { authService } from '../../auth';

type View = 'dashboard' | 'workitems' | 'approvals' | 'projects' | 'field-ops' | 'project-detail' | 'documents' | 'knowledge' | 'assets' | 'settings' | 'profile';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  currentUser: User | null;
  users: User[];
  pendingCount: number;
  onSwitchUser: (userId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setCurrentView, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  isCollapsed,
  setIsCollapsed,
  currentUser, 
  users, 
  pendingCount, 
  onSwitchUser 
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'لوحة القيادة', icon: LayoutGrid },
    { id: 'workitems', label: 'مركز العمليات', icon: CheckSquare },
    { id: 'approvals', label: 'الموافقات', icon: ShieldCheck, badge: pendingCount },
    { id: 'projects', label: 'إدارة المشاريع', icon: Building2 },
    { id: 'assets', label: 'الأصول والمعدات', icon: Box },
    { id: 'documents', label: 'الأرشيف والوثائق', icon: FolderOpen },
    { id: 'knowledge', label: 'قاعدة المعرفة', icon: BookOpen },
    { id: 'field-ops', label: 'تطبيق الميدان', icon: HardHat, category: 'أدوات' },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId as View);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:sticky top-0 right-0 h-screen bg-slate-900 text-white z-50
        transition-all duration-300 ease-in-out flex flex-col border-l border-slate-800
        ${isSidebarOpen ? 'translate-x-0 w-72' : 'translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
      `} dir="rtl">
        
        {/* Brand Header */}
        <div className={`flex items-center gap-3 p-6 mb-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20 shrink-0">E</div>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <h1 className="text-xl font-black tracking-tight">Enjaz One</h1>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">v2.0 Enterprise</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id || (item.id === 'workitems' && currentView === 'approvals' && !item.badge);
            return (
              <React.Fragment key={item.id}>
                {item.category && !isCollapsed && (
                   <div className="pt-6 pb-2 px-2 animate-fade-in">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.category}</p>
                   </div>
                )}
                {item.category && isCollapsed && <div className="h-4"></div>} {/* Spacer for collapsed */}
                
                <button
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : ''}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all mb-1 group relative ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 font-bold' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <item.icon size={22} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  
                  {!isCollapsed && <span className="flex-1 text-right truncate animate-fade-in">{item.label}</span>}
                  
                  {item.badge && item.badge > 0 && (
                    <span className={`bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse ${isCollapsed ? 'absolute top-1 right-2' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-slate-800 space-y-2">
           {/* Collapse Toggle (Desktop) */}
           <button 
             onClick={() => setIsCollapsed(!isCollapsed)}
             className="hidden lg:flex w-full items-center justify-center p-2 rounded-xl text-slate-500 hover:bg-slate-800 transition-colors"
           >
             {isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
           </button>

           {/* User Profile */}
           <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700 ${isCollapsed ? 'justify-center' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={currentUser?.avatar} alt="User" className="w-full h-full object-cover" />
                </div>
                {!isCollapsed && (
                  <div className="text-right flex-1 min-w-0 animate-fade-in">
                    <p className="text-sm font-bold text-white truncate">{currentUser?.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{currentUser?.role}</p>
                  </div>
                )}
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className={`absolute bottom-full mb-3 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden animate-slide-in-up w-64 z-50 ${isCollapsed ? 'right-full mr-2' : 'left-0 right-0'}`}>
                   <div className="p-3 bg-slate-800/50 border-b border-slate-800">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">الحساب</p>
                   </div>
                   <button 
                      onClick={() => { handleNavClick('profile'); setIsUserMenuOpen(false); }}
                      className="w-full text-right px-4 py-3 text-sm flex items-center gap-3 text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
                   >
                      <UserCircle size={18} /> ملفي الشخصي
                   </button>
                   <button 
                      onClick={() => { handleNavClick('settings'); setIsUserMenuOpen(false); }}
                      className="w-full text-right px-4 py-3 text-sm flex items-center gap-3 text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
                   >
                      <Activity size={18} /> سجل النشاطات
                   </button>
                   
                   <div className="p-2 bg-slate-800/30 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-2 text-right">
                      تبديل المستخدم (Admin)
                   </div>
                   <div className="max-h-32 overflow-y-auto">
                     {users.map(u => (
                       <button
                         key={u.id}
                         onClick={() => { onSwitchUser(u.id); setIsUserMenuOpen(false); }}
                         className={`w-full text-right px-4 py-3 text-sm flex items-center gap-3 hover:bg-slate-800 transition-colors ${currentUser?.id === u.id ? 'text-blue-400 bg-blue-500/5 font-bold' : 'text-slate-400'}`}
                       >
                          <div className={`w-6 h-6 rounded-full border ${currentUser?.id === u.id ? 'border-blue-500' : 'border-slate-700'} overflow-hidden`}>
                             <img src={u.avatar} className="w-full h-full object-cover" />
                          </div>
                          <span className="truncate">{u.name}</span>
                       </button>
                     ))}
                   </div>
                   <button 
                     onClick={handleLogout}
                     className="w-full text-right px-4 py-3 text-sm flex items-center gap-3 text-red-400 hover:bg-red-500/10 border-t border-slate-800"
                   >
                      <LogOut size={18} /> تسجيل خروج
                   </button>
                </div>
              )}
           </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
