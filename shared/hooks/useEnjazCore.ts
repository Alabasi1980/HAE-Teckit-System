
import { useState, useEffect, useCallback, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { WorkItem, Project, User, Notification, Status } from '../types';

export const useEnjazCore = () => {
  const data = useData();
  
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const previousWorkItems = useRef<WorkItem[]>([]);

  const loadAllData = useCallback(async (forceRefresh = false) => {
    setError(null);
    try {
      const [items, projs, usrs, currUser] = await Promise.all([
        data.workItems.getAll(forceRefresh),
        data.projects.getAll(forceRefresh),
        data.users.getAll(forceRefresh),
        data.users.getCurrentUser()
      ]);
      
      setWorkItems(items);
      setProjects(projs);
      setUsers(usrs);
      setCurrentUser(currUser);
      
      if (currUser) {
        const notifs = await data.notifications.getForUser(currUser.id);
        setNotifications(notifs);
      }
    } catch (err: any) {
      console.error("Critical: Data Load Failed", err);
      setError("فشل في مزامنة البيانات مع الخادم. يرجى التحقق من الاتصال.");
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleStatusUpdate = async (id: string, newStatus: Status) => {
    previousWorkItems.current = [...workItems];
    setWorkItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));

    try {
      await data.workItems.updateStatus(id, newStatus);
      data.invalidateCache(); 
    } catch (err: any) {
      setWorkItems(previousWorkItems.current);
      setError("فشل تحديث الحالة. تأكد من صلاحياتك واتصالك بالشبكة.");
    }
  };

  const handleSwitchUser = async (userId: string) => {
    try {
      const newUser = await data.users.setCurrentUser(userId);
      if (newUser) {
        setCurrentUser(newUser);
        data.invalidateCache();
        await loadAllData(true);
      }
    } catch (err) {
      setError("فشل تبديل المستخدم.");
    }
  };

  const markAllNotifsRead = async () => {
    if (currentUser) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      try {
        await data.notifications.markAllAsRead(currentUser.id);
      } catch (err) {
        // Silent fail for non-critical action
      }
    }
  };

  return {
    workItems, projects, users, currentUser, notifications, isLoading, error, setError,
    loadAllData, handleStatusUpdate, handleSwitchUser, markAllNotifsRead
  };
};
