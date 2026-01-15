
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Menu, Plus, Bell, Settings, Search, Command, CheckCheck, AlertOctagon, AtSign, Zap, HelpCircle, ChevronLeft } from 'lucide-react';
import { Notification, NotificationPriority } from '../../../shared/types';

type View = 'dashboard' | 'workitems' | 'approvals' | 'projects' | 'field-ops' | 'project-detail' | 'documents' | 'knowledge' | 'assets' | 'settings' | 'profile';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  onOpenCreateModal: () => void;
  notifications: Notification[];
  onNotificationClick: (n: Notification) => void;
  onMarkAllRead: () => void;
  unreadCount: number;
  projectTitle?: string;
}

const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  setIsSidebarOpen,
  onOpenCreateModal,
  notifications,
  onNotificationClick,
  onMarkAllRead,
  unreadCount,
  projectTitle
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'critical' | 'mentions'>('all');
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'لوحة القيادة';
      case 'workitems': return 'مركز العمليات';
      case 'approvals': return 'الموافقات والاعتمادات';
      case 'projects': return 'إدارة المشاريع';
      case 'project-detail': return projectTitle || 'تفاصيل المشروع';
      case 'documents': return 'الأرشيف المركزي';
      case 'assets': return 'سجل الأصول';
      case 'knowledge': return 'قاعدة المعرفة (Wiki)';
      case 'settings': return 'إعدادات النظام';
      case 'profile': return 'الملف الشخصي';
      case 'field-ops': return 'بوابة الميدان';
      default: return 'Enjaz One';
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (notifFilter === 'critical') return n.priority === 'critical' || n.priority === 'high';
      if (notifFilter === 'mentions') return n.category === 'mention';
      return true;
    });
  }, [notifications, notifFilter]);

  const getPriorityIcon = (priority: NotificationPriority) => {
    if (priority === 'critical') return <AlertOctagon size={14} className="text-white fill-rose-500" />;
    if (priority === 'high') return <Zap size={14} className="text-orange-500" />;
    return <div className="w-2 h-2 rounded-full bg-blue-500"></div>;
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-30 sticky top-0" dir="rtl">
      
      {/* Left Side: Navigation Info */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
        
        <div className="flex flex-col">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span>Enjaz One</span>
              <ChevronLeft size={10} />
              <span>{currentView === 'project-detail' ? 'المشاريع' : 'الرئيسية'}</span>
           </div>
           <h2 className="text-xl font-black text-slate-900 tracking-tight">
             {getPageTitle()}
           </h2>
        </div>
      </div>

      {/* Center: Search Bar (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-xl mx-4">
         <div className="relative w-full group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="بحث في المهام، المشاريع، أو الوثائق..." 
              className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-300 outline-none transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 border border-slate-200 rounded px-1.5 py-0.5 bg-white text-[10px] font-bold text-slate-400 shadow-sm">
               <Command size={10} /> K
            </div>
         </div>
      </div>

      {/* Right Side: Actions */}
      <div className="flex items-center gap-3">
          
          <button 
            onClick={onOpenCreateModal}
            className="hidden lg:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg shadow-slate-900/20 hover:scale-105 active:scale-95"
          >
            <Plus size={16} /> إضافة جديد
          </button>
          
          <button className="lg:hidden p-3 bg-slate-900 text-white rounded-xl shadow-lg" onClick={onOpenCreateModal}>
            <Plus size={20} />
          </button>

          <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>
          
          {/* Notification Bell */}
          <div className="relative" ref={notifDropdownRef}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`p-3 rounded-xl relative transition-all ${isNotifOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            >
              <Bell size={20} className={unreadCount > 0 ? 'animate-wiggle' : ''} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* Dropdown Content */}
            {isNotifOpen && (
              <div className="absolute left-0 top-full mt-4 w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in-down origin-top-left">
                <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-xl sticky top-0 z-10">
                    <span className="text-base font-black text-slate-800 flex items-center gap-2">
                      التنبيهات <span className="px-2 py-0.5 bg-blue-50 rounded-lg text-xs text-blue-600">{unreadCount}</span>
                    </span>
                    {unreadCount > 0 && (
                      <button onClick={onMarkAllRead} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors bg-blue-50 px-3 py-1 rounded-lg">
                        <CheckCheck size={14} /> قراءة الكل
                      </button>
                    )}
                </div>
                
                {/* Filter Tabs */}
                <div className="flex gap-2 px-5 py-3 bg-slate-50/50 border-b border-slate-100 overflow-x-auto no-scrollbar">
                   <button 
                     onClick={() => setNotifFilter('all')}
                     className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all whitespace-nowrap ${notifFilter === 'all' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                   >
                     الكل
                   </button>
                   <button 
                     onClick={() => setNotifFilter('critical')}
                     className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all whitespace-nowrap flex items-center gap-1 ${notifFilter === 'critical' ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'bg-white border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600'}`}
                   >
                     <AlertOctagon size={12} /> هام جداً
                   </button>
                   <button 
                     onClick={() => setNotifFilter('mentions')}
                     className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all whitespace-nowrap flex items-center gap-1 ${notifFilter === 'mentions' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
                   >
                     <AtSign size={12} /> إشارات
                   </button>
                </div>

                <div className="max-h-[24rem] overflow-y-auto bg-white">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-4">
                      <div className="p-4 bg-slate-50 rounded-full"><Bell size={32} className="opacity-20" /></div>
                      <p className="text-xs font-bold">لا توجد تنبيهات جديدة!</p>
                    </div>
                  ) : (
                    filteredNotifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => { onNotificationClick(n); setIsNotifOpen(false); }}
                        className={`group p-5 border-b border-slate-50 hover:bg-blue-50/30 cursor-pointer flex gap-4 transition-colors relative ${!n.isRead ? 'bg-slate-50/50' : ''}`}
                      >
                        {!n.isRead && <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"></div>}
                        
                        <div className={`mt-1 w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border shadow-sm ${
                          n.priority === 'critical' ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                          n.category === 'mention' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                          'bg-white border-slate-100 text-slate-400'
                        }`}>
                           {getPriorityIcon(n.priority)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                               <p className={`text-sm font-black truncate pl-2 ${n.priority === 'critical' ? 'text-rose-700' : 'text-slate-800'}`}>{n.title}</p>
                               <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            
                            {n.aiSummary ? (
                              <div className="flex items-start gap-1.5 mb-2 bg-blue-50 p-2 rounded-lg border border-blue-100">
                                 <Zap size={12} className="text-blue-600 mt-0.5 shrink-0" />
                                 <p className="text-[10px] font-bold text-blue-800 leading-tight">{n.aiSummary}</p>
                              </div>
                            ) : (
                              <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                            )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                   <button 
                     onClick={() => { setIsNotifOpen(false); setCurrentView('settings'); }}
                     className="text-[10px] font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 w-full py-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200"
                   >
                     <Settings size={12} /> تخصيص التنبيهات الذكية
                   </button>
                </div>
              </div>
            )}
          </div>

          <button 
            className="p-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            title="Help & Support"
          >
             <HelpCircle size={20} />
          </button>

          <button 
            onClick={() => setCurrentView('settings')}
            className={`p-3 rounded-xl transition-all ${currentView === 'settings' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
          >
            <Settings size={20} />
          </button>
      </div>
    </header>
  );
};

export default Header;
