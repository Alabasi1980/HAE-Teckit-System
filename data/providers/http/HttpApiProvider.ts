import { IDataProvider, IWorkItemRepository, IProjectRepository, IUserRepository, INotificationRepository, IAiService, IAssetRepository, IDocumentRepository, IKnowledgeRepository, IFieldOpsRepository, IAutomationRepository } from '../../contracts';
import { WorkItemMapper, WorkItemDTO } from '../../mappers/WorkItemMapper';
import { ProjectMapper } from '../../mappers/ProjectMapper';
import { UserMapper } from '../../mappers/UserMapper';
import { ArticleMapper, ArticleDTO } from '../../mappers/ArticleMapper';
import { httpClient } from '../../../shared/services/httpClient';
import { WorkItem, Status } from '../../../shared/types';

/**
 * @class HttpApiProvider
 * @description مزود البيانات الفعلي عبر الـ API.
 */
export class HttpApiProvider implements IDataProvider {
  
  workItems: IWorkItemRepository = {
    getAll: async () => (await httpClient.get<WorkItemDTO[]>('/work-items')).map(WorkItemMapper.toDomain),
    getById: async (id) => WorkItemMapper.toDomain(await httpClient.get<WorkItemDTO>(`/work-items/${id}`)),
    create: async (item) => WorkItemMapper.toDomain(await httpClient.post<WorkItemDTO>('/work-items', WorkItemMapper.toDTO(item))),
    update: async (id, updates) => WorkItemMapper.toDomain(await httpClient.put<WorkItemDTO>(`/work-items/${id}`, WorkItemMapper.toDTO(updates))),
    updateStatus: async (id, status) => httpClient.patch(`/work-items/${id}/status`, { status }),
    addComment: async (itemId, comment) => httpClient.post(`/work-items/${itemId}/comments`, comment),
    submitApprovalDecision: async (itemId, stepId, decision, comments) => httpClient.post(`/work-items/${itemId}/approvals/${stepId}`, { decision, comments }),
  };

  projects: IProjectRepository = {
    getAll: async () => (await httpClient.get<any[]>('/projects')).map(ProjectMapper.toDomain),
    getById: async (id) => ProjectMapper.toDomain(await httpClient.get<any>(`/projects/${id}`)),
    update: async (id, updates) => httpClient.put(`/projects/${id}`, ProjectMapper.toDTO(updates)),
  };

  users: IUserRepository = {
    getAll: async () => (await httpClient.get<any[]>('/users')).map(UserMapper.toDomain),
    getCurrentUser: async () => UserMapper.toDomain(await httpClient.get<any>('/users/me')),
    setCurrentUser: async (id) => httpClient.post(`/users/session`, { id }),
  };

  notifications: INotificationRepository = {
    getAll: async () => { throw new Error("NOT_IMPLEMENTED"); },
    getForUser: async (id) => httpClient.get(`/notifications/user/${id}`),
    getUnreadCount: async (id) => (await httpClient.get<{count: number}>(`/notifications/user/${id}/unread`)).count,
    create: async (n) => httpClient.post('/notifications', n),
    markAsRead: async (id) => { await httpClient.post(`/notifications/${id}/read`, {}); },
    markAllAsRead: async (id) => { await httpClient.post(`/notifications/user/${id}/read-all`, {}); },
    getPreferences: () => { throw new Error("NOT_IMPLEMENTED"); },
    savePreferences: () => { throw new Error("NOT_IMPLEMENTED"); }
  };

  automation: IAutomationRepository = {
    getRules: () => { throw new Error("NOT_IMPLEMENTED"); },
    toggleRule: () => { throw new Error("NOT_IMPLEMENTED"); }
  };

  assets: IAssetRepository = {
    getAll: async () => httpClient.get('/assets'),
    getById: async (id) => httpClient.get(`/assets/${id}`),
    update: async (id, updates) => httpClient.put(`/assets/${id}`, updates),
    create: async (asset) => httpClient.post('/assets', asset),
  };

  knowledge: IKnowledgeRepository = {
    getAll: async () => (await httpClient.get<ArticleDTO[]>('/knowledge')).map(ArticleMapper.toDomain),
    search: async (q) => (await httpClient.get<ArticleDTO[]>(`/knowledge/search?q=${q}`)).map(ArticleMapper.toDomain),
    create: async (a) => httpClient.post('/knowledge', ArticleMapper.toDTO(a)),
  };

  documents: IDocumentRepository = {
    getAll: async () => httpClient.get('/documents'),
    getByProjectId: async (pid) => httpClient.get(`/documents/project/${pid}`),
    upload: async (d) => httpClient.post('/documents/upload', d),
    delete: async (id) => httpClient.delete(`/documents/${id}`),
  };

  ai: IAiService = {
    analyzeWorkItem: async (item) => (await httpClient.post<{analysis: string}>('/ai/analyze-work-item', item)).analysis,
    suggestPriority: async (t, d) => (await httpClient.post<{priority: string}>('/ai/suggest-priority', { t, d })).priority,
    generateExecutiveBrief: async (s) => (await httpClient.post<{brief: string}>('/ai/executive-brief', s)).brief,
    analyzeNotification: async (t, m) => httpClient.post('/ai/analyze-notification', { t, m }),
    askWiki: async (c, q) => (await httpClient.post<{answer: string}>('/ai/ask-wiki', { c, q })).answer,
  };

  fieldOps: IFieldOpsRepository = {
    getDrafts: () => [],
    saveDraft: () => { throw new Error("NOT_IMPLEMENTED"); },
    removeDraft: () => { throw new Error("NOT_IMPLEMENTED"); },
    clearDrafts: () => {}
  };

  invalidateCache() {}
}