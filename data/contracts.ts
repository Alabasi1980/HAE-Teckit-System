
import { Ticket, TicketComment, TicketActivity, TicketStatus, TicketPriority, WorkItem, Project, User, Asset, Material, StockMovement, DailyLog, Employee, PayrollRecord, Vendor, PurchaseOrder, Contract, Client, ChangeOrder, Rfi, MaterialSubmittal, Subcontractor, PaymentCertificate, Ncr, Permit, LetterOfGuarantee, Blueprint, TaskPin, Notification, NotificationPreferences, AutomationRule, AppDocument, AppArticle, PettyCashRecord } from '../shared/types'; // Updated imports

export interface ITicketsRepository {
  getAll(filters?: any): Promise<Ticket[]>;
  getById(id: string): Promise<Ticket | undefined>;
  create(ticket: Partial<Ticket>): Promise<Ticket>;
  update(id: string, updates: Partial<Ticket>): Promise<Ticket | null>;
  addComment(ticketId: string, comment: Partial<TicketComment>): Promise<TicketComment>;
  getComments(ticketId: string): Promise<TicketComment[]>;
  getActivities(ticketId: string): Promise<TicketActivity[]>;
  transitionStatus(id: string, newStatus: TicketStatus, comment?: string): Promise<void>;
}

export interface IWorkItemRepository {
  getAll(force?: boolean): Promise<WorkItem[]>;
  getById(id: string): Promise<WorkItem | undefined>;
  create(item: Partial<WorkItem>): Promise<WorkItem>;
  update(id: string, updates: Partial<WorkItem>): Promise<WorkItem | null>;
  updateStatus(id: string, status: string): Promise<WorkItem | null>;
  addComment(itemId: string, comment: any): Promise<WorkItem | null>;
  submitApprovalDecision(itemId: string, stepId: string, decision: string, comments: string): Promise<WorkItem | null>;
}

export interface IProjectRepository {
  getAll(force?: boolean): Promise<Project[]>;
  getById(id: string): Promise<Project | undefined>;
  update(id: string, updates: Partial<Project>): Promise<Project | null>;
}

export interface IUserRepository {
  getAll(force?: boolean): Promise<User[]>;
  getCurrentUser(): Promise<User>;
  setCurrentUser(id: string): Promise<User | undefined>;
}

export interface INotificationRepository {
  getAll(): Promise<Notification[]>;
  getForUser(id: string): Promise<Notification[]>;
  getUnreadCount(id: string): Promise<number>;
  create(n: Partial<Notification>): Promise<Notification>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(id: string): Promise<void>;
  getPreferences(): NotificationPreferences;
  savePreferences(prefs: NotificationPreferences): Promise<void>;
}

export interface IAiService {
  analyzeWorkItem(item: WorkItem): Promise<string>;
  suggestPriority(title: string, description: string): Promise<string>;
  generateExecutiveBrief(stats: any): Promise<string>;
  generateFinancialInsight(project: Project, actualCosts: any): Promise<string>;
  generateDailyReport(project: Project, items: WorkItem[], materials: any[], labor?: any[], machines?: any[]): Promise<string>;
  analyzeNotification(title: string, message: string): Promise<{ priority: string; category: string; summary?: string }>;
  askWiki(context: string, query: string): Promise<string>;
}

export interface IAssetRepository {
  getAll(): Promise<Asset[]>;
  getById(id: string): Promise<Asset | undefined>;
  update(id: string, updates: Partial<Asset>): Promise<Asset | null>;
  create(asset: Partial<Asset>): Promise<Asset>;
}

export interface IDocumentRepository {
  getAll(): Promise<AppDocument[]>; // Updated: Use AppDocument
  getByProjectId(pid: string): Promise<AppDocument[]>; // Updated: Use AppDocument
  upload(d: Partial<AppDocument>): Promise<AppDocument>; // Updated: Use AppDocument
  delete(id: string): Promise<void>;
  getBlueprints(projectId: string): Promise<Blueprint[]>;
  updateBlueprintPins(id: string, pins: TaskPin[]): Promise<void>;
}

export interface IKnowledgeRepository {
  getAll(): Promise<AppArticle[]>; // Updated: Use AppArticle
  search(q: string): Promise<AppArticle[]>; // Updated: Use AppArticle
  create(a: Partial<AppArticle>): Promise<AppArticle>; // Updated: Use AppArticle
}

export interface IFieldOpsRepository {
  getDrafts(): Promise<any[]>;
  saveDraft(d: any): Promise<void>;
  removeDraft(id: string): Promise<void>;
  clearDrafts(): Promise<void>;
}

export interface IAutomationRepository {
  getRules(): AutomationRule[];
  toggleRule(id: string): AutomationRule[];
}

export interface IMaterialRepository {
  getAll(): Promise<Material[]>;
  getById(id: string): Promise<Material | undefined>;
  updateStock(id: string, qty: number, type: string, note: string): Promise<Material>;
  create(material: Partial<Material>): Promise<Material>;
  getMovements(materialId: string): Promise<StockMovement[]>;
}

export interface IDailyLogRepository {
  getAll(projectId?: string): Promise<DailyLog[]>;
  getById(id: string): Promise<DailyLog | undefined>;
  create(log: Partial<DailyLog>): Promise<DailyLog>;
  approve(id: string): Promise<void>;
}

export interface IEmployeeRepository {
  getAll(): Promise<Employee[]>;
  getById(id: string): Promise<Employee | undefined>;
  update(id: string, updates: Partial<Employee>): Promise<Employee | null>;
  create(emp: Partial<Employee>): Promise<Employee>;
}

export interface IPayrollRepository {
  getMonthlyRecords(month: string, year: number): Promise<PayrollRecord[]>;
  generatePayroll(month: string, year: number): Promise<PayrollRecord[]>;
  approveRecord(id: string): Promise<void>;
  markAsPaid(id: string): Promise<void>;
}

export interface IVendorRepository {
  getAll(): Promise<Vendor[]>;
  getById(id: string): Promise<Vendor | undefined>;
  getByCategory(cat: string): Promise<Vendor[]>;
  create(vendor: Partial<Vendor>): Promise<Vendor>;
  update(id: string, updates: Partial<Vendor>): Promise<Vendor | null>;
}

export interface IProcurementRepository {
  getPurchaseOrders(projectId?: string): Promise<PurchaseOrder[]>;
  createPO(po: Partial<PurchaseOrder>): Promise<PurchaseOrder>;
  updatePOStatus(id: string, status: string): Promise<void>;
  getContracts(projectId?: string): Promise<Contract[]>;
  createContract(contract: Partial<Contract>): Promise<Contract>;
  getPettyCashRecords(projectId: string): Promise<PettyCashRecord[]>; // Updated: Import PettyCashRecord
  addPettyCashEntry(entry: Partial<PettyCashRecord>): Promise<PettyCashRecord>; // Updated: Import PettyCashRecord
}

export interface IStakeholderRepository {
  getClients(): Promise<Client[]>;
  getClientById(id: string): Promise<Client | undefined>;
  getChangeOrders(projectId: string): Promise<ChangeOrder[]>;
  createChangeOrder(co: Partial<ChangeOrder>): Promise<ChangeOrder>;
  updateChangeOrderStatus(id: string, status: string): Promise<void>;
  getRfIs(projectId: string): Promise<Rfi[]>;
  createRfi(rfi: Partial<Rfi>): Promise<Rfi>;
  updateRfiStatus(id: string, status: string, response?: string): Promise<void>;
  getMaterialSubmittals(projectId: string): Promise<MaterialSubmittal[]>;
  createMaterialSubmittal(ms: Partial<MaterialSubmittal>): Promise<MaterialSubmittal>;
  updateSubmittalStatus(id: string, status: string, comment?: string): Promise<void>;
  getSubcontractors(projectId: string): Promise<Subcontractor[]>;
  getPaymentCertificates(projectId: string): Promise<PaymentCertificate[]>;
  createPaymentCertificate(cert: Partial<PaymentCertificate>): Promise<PaymentCertificate>;
  updateCertificateStatus(id: string, status: string): Promise<void>;
  getNcrs(projectId: string): Promise<Ncr[]>;
  createNcr(ncr: Partial<Ncr>): Promise<Ncr>;
  updateNcrStatus(id: string, status: string): Promise<void>;
  getPermits(projectId: string): Promise<Permit[]>;
  getLGs(projectId: string): Promise<LetterOfGuarantee[]>;
}

export interface IDataProvider {
  workItems: IWorkItemRepository; 
  projects: IProjectRepository;
  users: IUserRepository;
  assets: IAssetRepository;
  materials: IMaterialRepository;
  dailyLogs: IDailyLogRepository;
  employees: IEmployeeRepository;
  payroll: IPayrollRepository;
  vendors: IVendorRepository;
  procurement: IProcurementRepository;
  stakeholders: IStakeholderRepository;
  documents: IDocumentRepository;
  knowledge: IKnowledgeRepository;
  notifications: INotificationRepository;
  automation: IAutomationRepository;
  fieldOps: IFieldOpsRepository;
  ai: IAiService;
  tickets: ITicketsRepository;
  invalidateCache(): void;
}
