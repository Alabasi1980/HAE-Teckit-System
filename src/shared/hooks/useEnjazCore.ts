
import { useState, useEffect, useCallback } from 'react';
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

  const loadAllData = useCallback(async () => {
    try {
      const [items, projs, usrs, currUser] = await Promise.all([
        data.workItems.getAll(),
        data.projects.getAll(),
        data.users.getAll(),
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
  }, [currentUser, loadAllData, data]);

  const handleStatusUpdate = async (id: string, newStatus: Status) => {
    await data.workItems.updateStatus(id, newStatus);
    await loadAllData();
  };

  const handleSwitchUser = async (userId: string) => {
    const newUser = await data.users.setCurrentUser(userId);
    if (newUser) {
      setCurrentUser(newUser);
      await loadAllData();
    }
  };

  const markAllNotifsRead = async () => {
    if (currentUser) {
      await data.notifications.markAllAsRead(currentUser.id);
      await loadAllData();
    }
  };

  return {
    workItems, projects, users, currentUser, notifications, isLoading,
    loadAllData, handleStatusUpdate, handleSwitchUser, markAllNotifsRead
  };
};
