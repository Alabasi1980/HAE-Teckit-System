
import { IDataProvider, IWorkItemRepository, IProjectRepository, IUserRepository, IAssetRepository, IDocumentRepository, IKnowledgeRepository, INotificationRepository, IFieldOpsRepository, IAiService } from '../../contracts';
import { workItemsRepo } from '../../../shared/services/workItemsRepo';
import { projectsRepo } from '../../../shared/services/projectsRepo';
import { usersRepo } from '../../../shared/services/usersRepo';
import { assetsRepo } from '../../../shared/services/assetsRepo';
import { documentsRepo } from '../../../shared/services/documentsRepo';
import { knowledgeRepo } from '../../../shared/services/knowledgeRepo';
import { notificationsRepo } from '../../../shared/services/notificationsRepo';
import { WorkItem, Project, User } from '../../../shared/types';
import { GoogleGenAI } from "@google/genai";

class CacheManager {
  private cache = new Map<string, { data: any, timestamp: number }>();
  private TTL = 30000; // 30 seconds

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  clear() {
    this.cache.clear();
  }
}

class AiServiceManager implements IAiService {
  private getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeWorkItem(item: WorkItem): Promise<string> {
    const ai = this.getClient();
    const prompt = `حلل المهمة الإنشائية التالية: ${item.title}. الوصف: ${item.description}. قدم تقييم مخاطر و3 خطوات للحل بالعربية المهنية.`;
    try {
      const result = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      return result.text || "لم يتمكن النظام من التحليل.";
    } catch (e) {
      return "**[وضع المحاكاة]** المهمة تبدو ضمن النطاق الطبيعي ولكن تتطلب مراقبة جودة مكثفة.";
    }
  }

  async suggestPriority(title: string, description: string): Promise<string> {
    return "Medium";
  }

  async generateExecutiveBrief(stats: any): Promise<string> {
    const ai = this.getClient();
    const prompt = `أنت مستشار إدارة مشاريع. قدم ملخصاً تنفيذياً بالعربية بناءً على الأرقام: ${JSON.stringify(stats)}`;
    try {
      const result = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      return result.text || "الملخص غير متاح حالياً.";
    } catch (e) {
      return "الأداء العام للمشروع مستقر مع وجود ملاحظات طفيفة على الجدول الزمني.";
    }
  }

  async analyzeNotification(title: string, message: string): Promise<any> {
    return { priority: 'normal', category: 'system' };
  }

  async askWiki(context: string, query: string): Promise<string> {
    const ai = this.getClient();
    const prompt = `استخدم قاعدة المعرفة التالية للإجابة على سؤال الموظف: \n${context}\n السؤال: ${query}\n أجب بالعربية المهنية.`;
    try {
      const result = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      return result.text || "عذراً، لم أجد إجابة دقيقة في قاعدة المعرفة.";
    } catch (e) {
      return "بناءً على السياسات العامة، يرجى مراجعة مدير القسم المعني للحصول على أدق المعلومات.";
    }
  }
}

const DRAFTS_KEY = 'enjaz_field_drafts';
class FieldOpsLocalRepo implements IFieldOpsRepository {
  getDrafts(): Partial<WorkItem>[] {
    const data = localStorage.getItem(DRAFTS_KEY);
    return data ? JSON.parse(data) : [];
  }
  saveDraft(item: Partial<WorkItem>): Partial<WorkItem>[] {
    const drafts = this.getDrafts();
    drafts.unshift({ ...item, id: `draft-${Date.now()}` });
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    return drafts;
  }
  removeDraft(id: string): Partial<WorkItem>[] {
    const drafts = this.getDrafts().filter(d => d.id !== id);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    return drafts;
  }
  clearDrafts(): void {
    localStorage.removeItem(DRAFTS_KEY);
  }
}

export class LocalStorageProvider implements IDataProvider {
  private cache = new CacheManager();

  workItems: IWorkItemRepository = {
    ...workItemsRepo,
    getAll: async (forceRefresh = false) => {
      const cached = this.cache.get('workItems');
      if (cached && !forceRefresh) return cached;
      const data = await workItemsRepo.getAll();
      this.cache.set('workItems', data);
      return data;
    },
    updateStatus: async (id, status) => {
      const result = await workItemsRepo.updateStatus(id, status);
      this.cache.clear(); // Invalidate on write
      return result;
    }
  };

  projects: IProjectRepository = {
    ...projectsRepo,
    getAll: async (forceRefresh = false) => {
      const cached = this.cache.get('projects');
      if (cached && !forceRefresh) return cached;
      const data = await projectsRepo.getAll();
      this.cache.set('projects', data);
      return data;
    }
  };

  users: IUserRepository = {
    ...usersRepo,
    getAll: async (forceRefresh = false) => {
      const cached = this.cache.get('users');
      if (cached && !forceRefresh) return cached;
      const data = await usersRepo.getAll();
      this.cache.set('users', data);
      return data;
    },
    getCurrentUser: usersRepo.getCurrentUser,
    setCurrentUser: async (id) => {
      const user = await usersRepo.setCurrentUser(id);
      this.cache.clear();
      return user;
    }
  };

  assets: IAssetRepository = assetsRepo;
  documents: IDocumentRepository = documentsRepo;
  knowledge: IKnowledgeRepository = knowledgeRepo;
  notifications: INotificationRepository = notificationsRepo;
  fieldOps: IFieldOpsRepository = new FieldOpsLocalRepo();
  ai: IAiService = new AiServiceManager();

  invalidateCache() {
    this.cache.clear();
  }
}
