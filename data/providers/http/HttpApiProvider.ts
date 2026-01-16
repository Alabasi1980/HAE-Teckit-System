
import { 
  IDataProvider, IWorkItemRepository, IProjectRepository, IUserRepository, INotificationRepository, IAiService, 
  IAssetRepository, IDocumentRepository, IKnowledgeRepository, IFieldOpsRepository, IAutomationRepository, 
  IMaterialRepository, IDailyLogRepository, IEmployeeRepository, IPayrollRepository, IVendorRepository, 
  IProcurementRepository, ITicketsRepository, IStakeholderRepository
} from '../../contracts';
import { WorkItemMapper } from '../../mappers/WorkItemMapper';
import { ProjectMapper } from '../../mappers/ProjectMapper';
import { UserMapper } from '../../mappers/UserMapper';
import { ArticleMapper } from '../../mappers/ArticleMapper';
import { AssetMapper } from '../../mappers/AssetMapper';
import { NotificationMapper } from '../../mappers/NotificationMapper';
import { httpClient } from '../../../services/httpClient';
import { 
  Ticket, TicketComment, TicketActivity, TicketStatus
} from '../../../shared/types';
import { geminiService } from '../../../services/GeminiAiService';

/**
 * @class HttpApiProvider
 * @description يمنع هذا المزود أي عودة للبيانات المحلية (No Fallbacks).
 * إذا لم يوفر الـ Backend نقطة نهاية، سيتوقف النظام عن العمل لتنبيه المطور بالخلل.
 */
export class HttpApiProvider implements IDataProvider {
  
  tickets: ITicketsRepository = {
    getAll: async () => await httpClient.get<Ticket[]>('/tickets'),
    getById: async (id) => await httpClient.get<Ticket>(`/tickets/${id}`),
    create: async (ticket) => await httpClient.post<Ticket>('/tickets', ticket),
    update: async (id, updates) => await httpClient.put<Ticket>(`/tickets/${id}`, updates),
    addComment: async (ticketId, comment) => await httpClient.post<TicketComment>(`/tickets/${ticketId}/comments`, comment),
    getComments: async (ticketId) => await httpClient.get<TicketComment[]>(`/tickets/${ticketId}/comments`),
    getActivities: async (ticketId) => await httpClient.get<TicketActivity[]>(`/tickets/${ticketId}/activities`),
    transitionStatus: async (id, newStatus, comment) => {
      await httpClient.post(`/tickets/${id}/transition`, { status: newStatus, comment });
    }
  };

  workItems: IWorkItemRepository = {
    getAll: async () => (await httpClient.get<any[]>('/work-items')).map(WorkItemMapper.toDomain),
    getById: async (id) => WorkItemMapper.toDomain(await httpClient.get<any>(`/work-items/${id}`)),
    create: async (item) => WorkItemMapper.toDomain(await httpClient.post<any>('/work-items', WorkItemMapper.toDTO(item))),
    update: async (id, updates) => WorkItemMapper.toDomain(await httpClient.put<any>(`/work-items/${id}`, WorkItemMapper.toDTO(updates))),
    updateStatus: async (id, status) => WorkItemMapper.toDomain(await httpClient.patch<any>(`/work-items/${id}/status`, { status })),
    addComment: async (itemId, comment) => WorkItemMapper.toDomain(await httpClient.post<any>(`/work-items/${itemId}/comments`, comment)),
    submitApprovalDecision: async (itemId, stepId, decision, comments) => 
      WorkItemMapper.toDomain(await httpClient.post<any>(`/work-items/${itemId}/approvals/${stepId}`, { decision, comments })),
  };

  projects: IProjectRepository = {
    getAll: async () => (await httpClient.get<any[]>('/projects')).map(ProjectMapper.toDomain),
    getById: async (id) => ProjectMapper.toDomain(await httpClient.get<any>(`/projects/${id}`)),
    update: async (id, updates) => ProjectMapper.toDomain(await httpClient.put<any>(`/projects/${id}`, ProjectMapper.toDTO(updates))),
  };

  users: IUserRepository = {
    getAll: async () => (await httpClient.get<any[]>('/users')).map(UserMapper.toDomain),
    getCurrentUser: async () => UserMapper.toDomain(await httpClient.get<any>('/users/me')),
    setCurrentUser: async (id) => UserMapper.toDomain(await httpClient.post<any>(`/users/session`, { id })),
  };

  assets: IAssetRepository = {
    getAll: async () => (await httpClient.get<any[]>('/assets')).map(AssetMapper.toDomain),
    getById: async (id) => AssetMapper.toDomain(await httpClient.get<any>(`/assets/${id}`)),
    update: async (id, updates) => AssetMapper.toDomain(await httpClient.put<any>(`/assets/${id}`, AssetMapper.toDTO(updates))),
    create: async (asset) => AssetMapper.toDomain(await httpClient.post<any>('/assets', AssetMapper.toDTO(asset)))
  };

  materials: IMaterialRepository = {
    getAll: async () => await httpClient.get('/materials'),
    getById: async (id) => await httpClient.get(`/materials/${id}`),
    updateStock: async (id, qty, type, note) => await httpClient.patch(`/materials/${id}/stock`, { qty, type, note }),
    create: async (m) => await httpClient.post('/materials', m),
    getMovements: async (id) => await httpClient.get(`/materials/${id}/movements`)
  };

  dailyLogs: IDailyLogRepository = {
    getAll: async (pid) => await httpClient.get(`/daily-logs${pid ? `?projectId=${pid}` : ''}`),
    getById: async (id) => await httpClient.get(`/daily-logs/${id}`),
    create: async (l) => await httpClient.post('/daily-logs', l),
    approve: async (id) => { await httpClient.post(`/daily-logs/${id}/approve`, {}); }
  };

  employees: IEmployeeRepository = {
    getAll: async () => await httpClient.get('/employees'),
    getById: async (id) => await httpClient.get(`/employees/${id}`),
    update: async (id, u) => await httpClient.put(`/employees/${id}`, u),
    create: async (e) => await httpClient.post('/employees', e)
  };

  payroll: IPayrollRepository = {
    getMonthlyRecords: async (m, y) => await httpClient.get(`/payroll?month=${m}&year=${y}`),
    generatePayroll: async (m, y) => await httpClient.post(`/payroll/generate`, { m, y }),
    approveRecord: async (id) => { await httpClient.post(`/payroll/${id}/approve`, {}); },
    markAsPaid: async (id) => { await httpClient.post(`/payroll/${id}/pay`, {}); }
  };

  vendors: IVendorRepository = {
    getAll: async () => await httpClient.get('/vendors'),
    getById: async (id) => await httpClient.get(`/vendors/${id}`),
    getByCategory: async (c) => await httpClient.get(`/vendors/category/${c}`),
    create: async (v) => await httpClient.post('/vendors', v),
    update: async (id, u) => await httpClient.put(`/vendors/${id}`, u)
  };

  procurement: IProcurementRepository = {
    getPurchaseOrders: async (pid) => await httpClient.get(`/procurement/po${pid ? `?projectId=${pid}` : ''}`),
    createPO: async (po) => await httpClient.post('/procurement/po', po),
    updatePOStatus: async (id, s) => { await httpClient.patch(`/procurement/po/${id}/status`, { s }); },
    getContracts: async (pid) => await httpClient.get(`/procurement/contracts${pid ? `?projectId=${pid}` : ''}`),
    createContract: async (c) => await httpClient.post('/procurement/contracts', c),
    getPettyCashRecords: async (pid) => await httpClient.get(`/procurement/petty-cash?projectId=${pid}`),
    addPettyCashEntry: async (e) => await httpClient.post('/procurement/petty-cash', e)
  };

  stakeholders: IStakeholderRepository = {
    getClients: async () => await httpClient.get('/clients'),
    getClientById: async (id) => await httpClient.get(`/clients/${id}`),
    getChangeOrders: async (pid) => await httpClient.get(`/change-orders?projectId=${pid}`),
    createChangeOrder: async (co) => await httpClient.post('/change-orders', co),
    updateChangeOrderStatus: async (id, s) => { await httpClient.patch(`/change-orders/${id}/status`, { s }); },
    getRfIs: async (pid) => await httpClient.get(`/rfis?projectId=${pid}`),
    createRfi: async (rfi) => await httpClient.post('/rfis', rfi),
    updateRfiStatus: async (id, s, r) => { await httpClient.patch(`/rfis/${id}/status`, { s, r }); },
    getMaterialSubmittals: async (pid) => await httpClient.get(`/submittals?projectId=${pid}`),
    createMaterialSubmittal: async (ms) => await httpClient.post('/submittals', ms),
    updateSubmittalStatus: async (id, s, c) => { await httpClient.patch(`/submittals/${id}/status`, { s, c }); },
    getSubcontractors: async (pid) => await httpClient.get(`/subcontractors?projectId=${pid}`),
    getPaymentCertificates: async (pid) => await httpClient.get(`/certificates?projectId=${pid}`),
    createPaymentCertificate: async (c) => await httpClient.post('/certificates', c),
    updateCertificateStatus: async (id, s) => { await httpClient.patch(`/certificates/${id}/status`, { s }); },
    getNcrs: async (pid) => await httpClient.get(`/ncrs?projectId=${pid}`),
    createNcr: async (ncr) => await httpClient.post('/ncrs', ncr),
    updateNcrStatus: async (id, s) => { await httpClient.patch(`/ncrs/${id}/status`, { s }); },
    getPermits: async (pid) => await httpClient.get(`/permits?projectId=${pid}`),
    getLGs: async (pid) => await httpClient.get(`/lgs?projectId=${pid}`)
  };

  documents: IDocumentRepository = {
    getAll: async () => await httpClient.get('/documents'),
    getByProjectId: async (pid) => await httpClient.get(`/documents/project/${pid}`),
    upload: async (d) => await httpClient.post('/documents/upload', d),
    delete: async (id) => { await httpClient.delete(`/documents/${id}`); },
    getBlueprints: async (pid) => await httpClient.get(`/blueprints?projectId=${pid}`),
    updateBlueprintPins: async (id, pins) => { await httpClient.put(`/blueprints/${id}/pins`, { pins }); }
  };

  knowledge: IKnowledgeRepository = {
    getAll: async () => (await httpClient.get<any[]>('/knowledge')).map(ArticleMapper.toDomain),
    search: async (q) => (await httpClient.get<any[]>(`/knowledge/search?q=${q}`)).map(ArticleMapper.toDomain),
    create: async (a) => ArticleMapper.toDomain(await httpClient.post<any>('/knowledge', ArticleMapper.toDTO(a)))
  };

  notifications: INotificationRepository = {
    getAll: async () => (await httpClient.get<any[]>('/notifications')).map(NotificationMapper.toDomain),
    getForUser: async (id) => (await httpClient.get<any[]>(`/notifications/user/${id}`)).map(NotificationMapper.toDomain),
    getUnreadCount: async (id) => (await httpClient.get<any>(`/notifications/user/${id}/unread`)).count,
    create: async (n) => NotificationMapper.toDomain(await httpClient.post<any>('/notifications', NotificationMapper.toDTO(n))),
    markAsRead: async (id) => { await httpClient.post(`/notifications/${id}/read`, {}); },
    markAllAsRead: async (id) => { await httpClient.post(`/notifications/user/${id}/read-all`, {}); },
    getPreferences: () => { throw new Error("Missing Server Configuration for Preferences"); },
    savePreferences: async (p) => { await httpClient.post('/notifications/preferences', p); }
  };

  automation: IAutomationRepository = {
    getRules: () => { throw new Error("Automation Rules are Server-Authoritative. Access denied via local shim."); },
    toggleRule: (id) => { throw new Error("Unauthorized context."); }
  };

  fieldOps: IFieldOpsRepository = {
    getDrafts: async () => [],
    saveDraft: async () => {},
    removeDraft: async () => {},
    clearDrafts: async () => {}
  };

  ai: IAiService = geminiService;
  invalidateCache() {}
}
