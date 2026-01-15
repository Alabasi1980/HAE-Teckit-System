
import { WorkItem, NotificationPriority, NotificationCategory } from "../types";

// LEGACY SERVICE - DEPRECATED
// Use useData().ai instead.
// Keeping this to prevent build errors in components not yet refactored completely.

export const analyzeWorkItem = async (item: WorkItem): Promise<string> => {
  return "AI Service has been moved to DataProvider. Please update your component to use `useData().ai.analyzeWorkItem()`.";
};

export const suggestWorkItemPriority = async (title: string, description: string): Promise<string> => {
  return "Medium";
};

export const generateExecutiveBrief = async (stats: any): Promise<string> => {
  return "AI Service has been moved to DataProvider.";
};

export const analyzeNotification = async (title: string, message: string): Promise<{ priority: NotificationPriority; category: NotificationCategory; summary?: string }> => {
  return { priority: 'normal', category: 'system' };
};
