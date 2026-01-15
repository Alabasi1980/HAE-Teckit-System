
import { WorkItem, Project, User, Asset, Document, Article, Status, ApprovalDecision, Comment, Notification } from '../shared/types';

export interface IWorkItemRepository {
  getAll(forceRefresh?: boolean): Promise<WorkItem[]>;
  getById(id: string): Promise<WorkItem | undefined>;
  create(item: Partial<WorkItem>): Promise<WorkItem>;
  update(id: string, updates: Partial<WorkItem>): Promise<WorkItem | null>;
  updateStatus(id: string, status: Status): Promise<WorkItem | null>;
  addComment(itemId: string, comment: Comment): Promise<WorkItem | null>;
  submitApprovalDecision(itemId: string, stepId: string, decision: ApprovalDecision, comments: string): Promise<WorkItem | null>;
}

export interface IProjectRepository {
  getAll(forceRefresh?: boolean): Promise<Project[]>;
  getById(id: string): Promise<Project | undefined>;
  update(id: string, updates: Partial<Project>): Promise<Project | null>;
}

export interface IUserRepository {
  getAll(forceRefresh?: boolean): Promise<User[]>;
  getCurrentUser(): Promise<User>;
  setCurrentUser(userId: string): Promise<User | undefined>;
}

export interface IAssetRepository {
  getAll(): Promise<Asset[]>;
  getById(id: string): Promise<Asset | undefined>;
  update(id: string, updates: Partial<Asset>): Promise<Asset | null>;
  create(asset: Partial<Asset>): Promise<Asset>;
}

export interface IDocumentRepository {
  getAll(): Promise<Document[]>;
  getByProjectId(projectId: string): Promise<Document[]>;
  upload(doc: Partial<Document>): Promise<Document>;
  delete(id: string): Promise<void>;
}

export interface IKnowledgeRepository {
  getAll(): Promise<Article[]>;
  search(term: string): Promise<Article[]>;
  create(article: Partial<Article>): Promise<Article>;
}

export interface INotificationRepository {
  getAll(): Promise<Notification[]>;
  getForUser(userId: string): Promise<Notification[]>;
  getUnreadCount(userId: string): Promise<number>;
  create(notification: Partial<Notification>): Promise<Notification>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}

export interface IFieldOpsRepository {
  getDrafts(): Partial<WorkItem>[];
  saveDraft(item: Partial<WorkItem>): Partial<WorkItem>[];
  removeDraft(id: string): Partial<WorkItem>[];
  clearDrafts(): void;
}

export interface IAiService {
  analyzeWorkItem(item: WorkItem): Promise<string>;
  suggestPriority(title: string, description: string): Promise<string>;
  generateExecutiveBrief(stats: any): Promise<string>;
  analyzeNotification(title: string, message: string): Promise<{ priority: string; category: string; summary?: string }>;
  askWiki(context: string, query: string): Promise<string>;
}

export interface IDataProvider {
  workItems: IWorkItemRepository;
  projects: IProjectRepository;
  users: IUserRepository;
  assets: IAssetRepository;
  documents: IDocumentRepository;
  knowledge: IKnowledgeRepository;
  notifications: INotificationRepository;
  fieldOps: IFieldOpsRepository;
  ai: IAiService;
  invalidateCache(): void;
}
