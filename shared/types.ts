
export enum TicketType {
  INCIDENT = 'Incident',
  SERVICE_REQUEST = 'Service Request',
  PROBLEM = 'Problem',
  CHANGE_REQUEST = 'Change Request',
  COMPLAINT = 'Complaint',
  INQUIRY = 'Inquiry'
}

export enum TicketStatus {
  NEW = 'New',
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  WAITING_CUSTOMER = 'Waiting on Customer',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
  CANCELED = 'Canceled'
}

export enum TicketPriority {
  P1_CRITICAL = 'P1 - Critical',
  P2_HIGH = 'P2 - High',
  P3_MEDIUM = 'P3 - Medium',
  P4_LOW = 'P4 - Low'
}

export enum CommentVisibility {
  PUBLIC = 'Public Reply',
  INTERNAL = 'Internal Note'
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  body: string;
  visibility: CommentVisibility;
  attachments?: string[];
  createdAt: string;
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  actorName: string;
  action: string;
  details?: string;
  createdAt: string;
  signatureUrl?: string;
}

export interface Ticket {
  id: string;
  key: string;
  title: string;
  description: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  requesterId: string;
  requesterName: string;
  assigneeId?: string;
  assigneeName?: string;
  teamId?: string;
  projectId?: string;
  sourceRefId?: string;
  firstResponseDueAt: string;
  resolutionDueAt: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  signatureUrl?: string;
}

export enum Priority {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum Status {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  PENDING_APPROVAL = 'Pending Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  DONE = 'Done'
}

export enum WorkItemType {
  TASK = 'Task',
  APPROVAL = 'Approval',
  ISSUE = 'Issue/Blocker',
  FOLLOW_UP = 'Follow-up',
  CHECKLIST = 'Checklist',
  INCIDENT = 'Field Incident',
  OBSERVATION = 'Safety Observation'
}

export enum RecurrenceInterval {
  NONE = 'None',
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly'
}

export interface Department {
  id: string;
  name: string;
  managerId: string;
  parentDeptId?: string;
  description?: string;
  color?: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email?: string;
  phone?: string;
  departmentId?: string;
  department?: string;
  managerId?: string;
  joinDate?: string;
  points?: number; // Added for Gamification
}

export interface ProjectStaffing {
  userId: string;
  projectRole: 'PM' | 'SiteEngineer' | 'Accountant' | 'SafetyOfficer' | 'Supervisor';
  assignedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TimeLog {
  id: string;
  userId: string;
  userName: string;
  hours: number;
  note: string;
  date: string;
}

export interface WorkItemAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
  isSystem?: boolean;
}

export enum ApprovalDecision {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface ApprovalStep {
  id: string;
  approverId: string;
  approverName: string;
  role: string;
  decision: ApprovalDecision;
  comments?: string;
  decisionDate?: string;
}

export interface WorkItem {
  id: string;
  title: string;
  description: string;
  type: WorkItemType;
  priority: Priority;
  status: Status;
  projectId: string;
  assigneeId?: string;
  targetDeptId?: string;
  targetRole?: string;
  creatorId?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  dueDate: string;
  tags?: string[];
  comments: Comment[];
  subtasks?: Subtask[];
  timeLogs?: TimeLog[];
  itemAttachments?: WorkItemAttachment[];
  approvalChain?: ApprovalStep[];
  location?: { lat: number; lng: number };
  attachments?: string[];
  assetId?: string;
  dependencies?: string[];
  watchers?: string[];
  estimatedHours?: number;
  actualHours?: number;
  relatedToId?: string;
  relatedToType?: 'Project' | 'Asset' | 'Ticket' | 'Vendor' | 'Employee';
  recurrence?: RecurrenceInterval;
  nextOccurrenceId?: string;
}

export enum ProjectStatus {
  PLANNING = 'Planning',
  ACTIVE = 'Active',
  DELAYED = 'Delayed',
  COMPLETED = 'Completed'
}

export enum ProjectHealth {
  GOOD = 'Good',
  AT_RISK = 'At Risk',
  CRITICAL = 'Critical'
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  progress: number;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  latLng?: { lat: number; lng: number }; // Added for Geofencing
  geofenceRadius?: number; // Meters
  code: string;
  status: ProjectStatus;
  health: ProjectHealth;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  managerId: string;
  teamIds: string[];
  staffing?: ProjectStaffing[];
  version: number;
  updatedAt: string;
  milestones?: Milestone[];
  clientId?: string;
}

export enum AssetStatus {
  AVAILABLE = 'Available',
  IN_USE = 'In Use',
  MAINTENANCE = 'Maintenance',
  LOST = 'Lost',
  RETIRED = 'Retired'
}

export enum AssetCategory {
  HEAVY_EQUIPMENT = 'Heavy Equipment',
  VEHICLE = 'Vehicle',
  TOOLS = 'Tools',
  IT = 'IT',
  OTHER = 'Other'
}

export interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  category: AssetCategory;
  status: AssetStatus;
  location: string;
  purchaseDate: string;
  value: number;
  lastMaintenance?: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'update';
  priority: NotificationPriority;
  category: NotificationCategory;
  isRead: boolean;
  createdAt: string;
  relatedItemId?: string;
  aiSummary?: string;
}

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';
export type NotificationCategory = 'system' | 'mention' | 'task' | 'approval';

export interface AppDocument {
  id: string;
  title: string;
  projectId: string;
  url: string;
  category: 'Blueprint' | 'Contract' | 'Permit' | 'Report' | 'Invoice' | 'Technical' | 'Other';
  size: string;
  type: string;
  uploaderId: string;
  uploaderName: string;
  uploadedAt: string;
}

export interface AppArticle {
  id: string;
  title: string;
  category: string;
  authorName: string;
  lastUpdated: string;
  tags: string[];
  content: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  trigger: {
    type: 'STATUS_CHANGE';
    toStatus: Status;
    workItemType?: WorkItemType;
  };
  action: {
    type: 'CREATE_TASK';
    titleTemplate: string;
    descTemplate: string;
    targetRole?: string;
    priority: Priority;
  };
}

export interface NotificationPreferences {
  dndEnabled: boolean;
  channels: {
    critical: { email: boolean; inApp: boolean; push: boolean };
    mentions: { email: boolean; inApp: boolean; push: boolean };
    updates: { email: boolean; inApp: boolean; push: boolean };
  };
}

export interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minThreshold: number;
  unitPrice: number;
}

export interface StockMovement {
  id: string;
  materialId: string;
  type: 'Inbound' | 'Outbound';
  quantity: number;
  note: string;
  performedBy: string;
  createdAt: string;
}

export type StockMovementType = 'Inbound' | 'Outbound';

export interface DailyLog {
  id: string;
  projectId: string;
  date: string;
  weatherStatus?: string;
  manpowerCount: number;
  laborDetails?: { trade: string; count: number; hours: number; estimatedRate?: number }[];
  equipmentDetails?: { assetName: string; assetId: string; operatingHours: number; fuelConsumed: number; hourlyRate?: number }[];
  consumedMaterials?: { materialId: string; name: string; quantity: number; unit: string; unitCost?: number }[];
  content: string;
  stats?: { tasksCompleted: number; incidentsReported: number; materialsRequested: number };
  createdBy: string;
  isApproved: boolean;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  department: string;
  joinDate: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  currentProject?: string;
  email: string;
  phone: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  workedHours: number;
  overtimeHours: number;
  basePay: number;
  overtimePay: number;
  deductions: number;
  netPay: number;
  status: 'Draft' | 'Approved' | 'Paid';
}

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  trade: string;
  rating: number;
  contactEmail: string;
  contactPhone: string;
}

export enum VendorCategory {
  AGREEMENT = 'Strategy Agreement',
  RETAIL = 'Retail / Spot'
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  vendorCategory: VendorCategory;
  projectId: string;
  projectName: string;
  grandTotal: number;
  status: 'Draft' | 'Sent' | 'Received' | 'Cancelled';
  createdAt: string;
}

export interface Contract {
  id: string;
  contractNumber: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
  projectId?: string;
}

export interface PettyCashRecord {
  id: string;
  projectId: string;
  amount: number;
  date: string;
  description: string;
  vendorName: string;
  receiptUrl?: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  avatar?: string;
  email: string;
}

export interface ChangeOrder {
  id: string;
  projectId: string;
  title: string;
  description: string;
  impactOnBudget: number;
  impactOnTimeline: number;
  status: 'Sent' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface Rfi {
  id: string;
  rfiNo: string;
  projectId: string;
  subject: string;
  description: string;
  status: 'Pending' | 'Closed';
  createdAt: string;
  location: string;
  drawingRef?: string;
}

export interface MaterialSubmittal {
  id: string;
  submittalNo: string;
  materialName: string;
  manufacturer: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  projectId: string;
}

export interface Subcontractor {
  id: string;
  name: string;
  trade: string;
  performanceScore: number;
  totalContractValue: number;
  paidAmount: number;
}

export interface PaymentCertificate {
  id: string;
  subcontractorId: string;
  subcontractorName: string;
  period: string;
  claimedPercentage: number;
  approvedPercentage: number;
  status: 'Draft' | 'Sent' | 'Approved';
  projectId: string;
}

export interface Ncr {
  id: string;
  title: string;
  description: string;
  subcontractorId: string;
  severity: 'Minor' | 'Major' | 'Critical';
  status: 'Open' | 'Closed';
  issuedBy: string;
  createdAt: string;
  projectId: string;
}

export interface Permit {
  id: string;
  title: string;
  authority: string;
  expiryDate: string;
  status: 'Active' | 'Renewal' | 'Expired';
  projectId: string;
}

export interface InspectionVisit {
  id: string;
  projectId: string;
  authorityName: string;
  inspectorName?: string;
  date: string;
  result: 'Pass' | 'Fail' | 'Conditional';
  infractionAmount?: number;
  notes: string;
  attachments?: string[];
  remediationTaskId?: string;
}

export interface LetterOfGuarantee {
  id: string;
  bankName: string;
  type: string;
  amount: number;
  expiryDate: string;
  status: 'Active' | 'Expired';
  projectId: string;
}

export interface Blueprint {
  id: string;
  title: string;
  imageUrl: string;
  version: string;
  pins: TaskPin[];
  projectId: string;
}

export interface TaskPin {
  id: string;
  workItemId: string;
  x: number;
  y: number;
  priority: Priority;
}

export type View = 'dashboard' | 'ceo-board' | 'org-structure' | 'workitems' | 'workload' | 'compliance' | 'tickets' | 'approvals' | 'projects' | 'field-ops' | 'project-detail' | 'documents' | 'knowledge' | 'assets' | 'inventory' | 'finance' | 'procurement' | 'hr' | 'payroll' | 'settings' | 'profile';
