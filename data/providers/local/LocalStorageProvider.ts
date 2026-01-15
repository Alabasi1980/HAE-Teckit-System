import { IDataProvider, IWorkItemRepository, IProjectRepository, IUserRepository, IAssetRepository, IDocumentRepository, IKnowledgeRepository, INotificationRepository, IFieldOpsRepository, IAiService } from '../../contracts';
import { workItemsRepo } from '../../../shared/services/workItemsRepo';
import { projectsRepo } from '../../../shared/services/projectsRepo';
import { usersRepo } from '../../../shared/services/usersRepo';
import { assetsRepo } from '../../../shared/services/assetsRepo';
import { documentsRepo } from '../../../shared/services/documentsRepo';
import { knowledgeRepo } from '../../../shared/services/knowledgeRepo';
import { notificationsRepo } from '../../../shared/services/notificationsRepo';
import { WorkItem } from '../../../shared/types';

class AiServiceStub implements IAiService {
  async analyzeWorkItem(item: any): Promise<string> {
    return `**AI Analysis (Offline Mode)**\n\nTitle: ${item.title}\n\nThis is a placeholder analysis. The AI service is currently running in stub mode to protect API keys. Connect a backend to enable live Gemini analysis.`;
  }
  async suggestPriority(): Promise<string> {
    return "Medium";
  }
  async generateExecutiveBrief(): Promise<string> {
    return "## Executive Brief (Stub)\n\nSystem is operating normally. All KPIs are simulated.";
  }
  async analyzeNotification(): Promise<any> {
    return { priority: 'normal', category: 'system', summary: 'Auto-generated notification' };
  }
  async askWiki(_context: string, _query: string): Promise<string> {
    return "I am Enjaz AI (Stub). I cannot search the live wiki right now, but I can tell you that safety is our #1 priority!";
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
  workItems: IWorkItemRepository = workItemsRepo;
  projects: IProjectRepository = projectsRepo;
  users: IUserRepository = usersRepo;
  assets: IAssetRepository = assetsRepo;
  documents: IDocumentRepository = documentsRepo;
  knowledge: IKnowledgeRepository = knowledgeRepo;
  notifications: INotificationRepository = notificationsRepo;
  fieldOps: IFieldOpsRepository = new FieldOpsLocalRepo();
  ai: IAiService = new AiServiceStub();
}