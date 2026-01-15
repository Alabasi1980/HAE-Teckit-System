
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

  // Reference for rollback if needed
  const previousWorkItems = useRef<WorkItem[]>([]);

  const loadAllData = useCallback(async (forceRefresh = false) => {
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
    } catch (error) {
      console.error("Critical: Data Load Failed", error);
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(() => {
       if (currentUser) {
         data.notifications.getForUser(currentUser.id).then(setNotifications);
       }
    }, 30000);
    return () => clearInterval(interval);
  }, [currentUser, loadAllData]);

  const handleStatusUpdate = async (id: string, newStatus: Status) => {
    // 1. Optimistic Update (Immediate Feedback)
    previousWorkItems.current = [...workItems];
    setWorkItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));

    try {
      // 2. Real API Call
      await data.workItems.updateStatus(id, newStatus);
      // Optional: Refresh cache background
      data.invalidateCache(); 
    } catch (error) {
      // 3. Rollback on Failure
      setWorkItems(previousWorkItems.current);
      console.error("Failed to update status, rolling back UI", error);
      alert("عذراً، فشل تحديث الحالة. يرجى المحاولة لاحقاً.");
    }
  };

  const handleSwitchUser = async (userId: string) => {
    const newUser = await data.users.setCurrentUser(userId);
    if (newUser) {
      setCurrentUser(newUser);
      data.invalidateCache();
      await loadAllData(true);
    }
  };

  const markAllNotifsRead = async () => {
    if (currentUser) {
      // Optimistic read
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await data.notifications.markAllAsRead(currentUser.id);
    }
  };

  return {
    workItems, projects, users, currentUser, notifications, isLoading,
    loadAllData, handleStatusUpdate, handleSwitchUser, markAllNotifsRead
  };
};
