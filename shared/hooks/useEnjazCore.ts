
import { useState, useEffect, useCallback, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { WorkItem, Project, User, Notification, Status, Priority, AutomationRule } from '../types';

export const useEnjazCore = () => {
  const data = useData();
  
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pendingUpdatesCount = useRef(0);
  const activeAbortController = useRef<AbortController | null>(null);

  const loadAllData = useCallback(async (forceRefresh = false) => {
    if (activeAbortController.current) {
      activeAbortController.current.abort();
    }
    
    const controller = new AbortController();
    activeAbortController.current = controller;

    try {
      if (forceRefresh) data.invalidateCache();
      
      const [items, projs, usrs, currUser] = await Promise.all([
        data.workItems.getAll(forceRefresh),
        data.projects.getAll(forceRefresh),
        data.users.getAll(forceRefresh),
        data.users.getCurrentUser()
      ]);
      
      if (controller.signal.aborted) return;

      setWorkItems(items);
      setProjects(projs);
      setUsers(usrs);
      setCurrentUser(currUser);
      
      if (currUser) {
        const notifs = await data.notifications.getForUser(currUser.id);
        setNotifications(notifs);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error("Critical: Data Load Failed", err);
      setError("فشل في مزامنة البيانات. سيتم المحاولة مجدداً.");
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [data]);

  useEffect(() => {
    loadAllData();
    return () => activeAbortController.current?.abort();
  }, [loadAllData]);

  useEffect(() => {
    if (!currentUser || isLoading) return;

    const pollInterval = setInterval(() => {
      if (pendingUpdatesCount.current > 0) return;

      data.notifications.getForUser(currentUser.id).then(notifs => {
          setNotifications(notifs);
      }).catch(() => {});
      
      data.workItems.getAll(true).then(items => {
          setWorkItems(items);
      }).catch(() => {});

    }, 30000); 

    return () => clearInterval(pollInterval);
  }, [currentUser, data, isLoading]);

  const handleStatusUpdate = async (id: string, newStatus: Status) => {
    pendingUpdatesCount.current++;
    const oldItem = workItems.find(i => i.id === id);
    if (!oldItem) return;

    setWorkItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    
    try {
      await data.workItems.updateStatus(id, newStatus);
      
      // Gamification System: Reward Points
      if (newStatus === Status.DONE && currentUser) {
         const today = new Date().toISOString().split('T')[0];
         const isOnTime = today <= oldItem.dueDate;
         
         if (isOnTime) {
            let pointsAwarded = 10; // نقاط أساسية
            if (oldItem.priority === Priority.CRITICAL) pointsAwarded = 50;
            else if (oldItem.priority === Priority.HIGH) pointsAwarded = 25;
            
            const updatedUser = await data.users.updatePoints(currentUser.id, pointsAwarded);
            if (updatedUser) {
               setCurrentUser(updatedUser);
               // تنبيه بنجاح كسب النقاط
               await data.notifications.create({
                  userId: currentUser.id,
                  title: "تم كسب نقاط خبرة (XP)!",
                  message: `أحسنت! لقد حصلت على ${pointsAwarded} نقطة لإنجاز المهمة "${oldItem.title}" في موعدها.`,
                  type: 'info',
                  priority: 'normal',
                  category: 'system',
                  createdAt: new Date().toISOString(),
                  isRead: false
               });
            }
         }
      }

      // Automation Trigger
      if (newStatus === Status.DONE || newStatus === Status.APPROVED) {
         const rules = await data.automation.getRules();
         const activeRules = rules.filter(r => r.isEnabled && r.trigger.toStatus === newStatus);
         
         for (const rule of activeRules) {
            if (rule.action.type === 'CREATE_TASK') {
               const title = rule.action.titleTemplate.replace('{title}', oldItem?.title || '');
               const description = rule.action.descTemplate.replace('{title}', oldItem?.title || '');
               
               await data.workItems.create({
                  title,
                  description,
                  projectId: oldItem?.projectId || 'General',
                  status: Status.OPEN,
                  priority: rule.action.priority,
                  dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                  comments: [{
                     id: `sys-${Date.now()}`,
                     text: `تم إنشاء هذه المهمة تلقائياً بواسطة محرك الأتمتة: ${rule.name}`,
                     userId: 'SYSTEM',
                     userName: 'محرك الأتمتة',
                     timestamp: new Date().toISOString(),
                     isSystem: true
                  }]
               });
            }
         }
         if (activeRules.length > 0) {
            await loadAllData(true);
         }
      }

    } catch (err: any) {
      setError("فشل تحديث الحالة. جاري إعادة المحاولة...");
      await loadAllData(true);
    } finally {
      pendingUpdatesCount.current = Math.max(0, pendingUpdatesCount.current - 1);
    }
  };

  const handleSwitchUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const newUser = await data.users.setCurrentUser(userId);
      if (newUser) {
        setCurrentUser(newUser);
        await loadAllData(true);
      }
    } catch (err) {
      setError("فشل تبديل المستخدم.");
      setIsLoading(false);
    }
  };

  const markAllNotifsRead = async () => {
    if (currentUser) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      try {
        await data.notifications.markAllAsRead(currentUser.id);
      } catch (err) {}
    }
  };

  return {
    workItems, projects, users, currentUser, notifications, isLoading, error, setError,
    loadAllData, handleStatusUpdate, handleSwitchUser, markAllNotifsRead
  };
};
