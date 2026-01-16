
import { IDataProvider, ITicketsRepository, IWorkItemRepository, IProjectRepository, IUserRepository, INotificationRepository, IAiService, IAssetRepository, IDocumentRepository, IKnowledgeRepository, IFieldOpsRepository, IAutomationRepository, IMaterialRepository, IDailyLogRepository, IEmployeeRepository, IPayrollRepository, IVendorRepository, IProcurementRepository, IStakeholderRepository } from '../../contracts';
import { Ticket, TicketStatus, TicketPriority, TicketType, TicketComment, CommentVisibility, TicketActivity, WorkItem, Project, User, Notification, Asset, AppDocument, AppArticle, Material, DailyLog, Employee, PayrollRecord, Vendor, PurchaseOrder, Contract, PettyCashRecord, Client, ChangeOrder, Rfi, MaterialSubmittal, Subcontractor, PaymentCertificate, Ncr, Permit, LetterOfGuarantee, Blueprint, TaskPin, StockMovement } from '../../../shared/types';
import { storageService } from '../../../services/storageService';
import { MOCK_USERS, MOCK_PROJECTS, MOCK_WORK_ITEMS, MOCK_ASSETS, MOCK_ARTICLES } from '../../../shared/constants';

export class LocalStorageProvider implements IDataProvider {
  private async ensureInitialized<T>(storeName: string, defaults: T[]): Promise<T[]> {
    const items = await storageService.getAll<T>(storeName);
    if (items.length === 0) {
      for (const item of defaults) await storageService.put(storeName, item);
      return defaults;
    }
    return items;
  }

  private calculateSLA(priority: TicketPriority): { response: string, resolution: string } {
    const now = new Date();
    let resHours = 48; 
    let respMinutes = 120;
    switch(priority) {
      case TicketPriority.P1_CRITICAL: respMinutes = 15; resHours = 4; break;
      case TicketPriority.P2_HIGH: respMinutes = 60; resHours = 12; break;
      case TicketPriority.P3_MEDIUM: respMinutes = 240; resHours = 48; break;
      case TicketPriority.P4_LOW: respMinutes = 1440; resHours = 168; break;
    }
    return {
      response: new Date(now.getTime() + respMinutes * 60000).toISOString(),
      resolution: new Date(now.getTime() + resHours * 3600000).toISOString()
    };
  }

  private isValidTransition(current: TicketStatus, next: TicketStatus): boolean {
    const map: Record<TicketStatus, TicketStatus[]> = {
      [TicketStatus.NEW]: [TicketStatus.OPEN, TicketStatus.CANCELED],
      [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS, TicketStatus.WAITING_CUSTOMER, TicketStatus.CANCELED],
      [TicketStatus.IN_PROGRESS]: [TicketStatus.WAITING_CUSTOMER, TicketStatus.RESOLVED, TicketStatus.CANCELED],
      [TicketStatus.WAITING_CUSTOMER]: [TicketStatus.IN_PROGRESS, TicketStatus.CANCELED],
      [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.OPEN],
      [TicketStatus.CLOSED]: [TicketStatus.OPEN],
      [TicketStatus.CANCELED]: [TicketStatus.OPEN]
    };
    return map[current]?.includes(next) || false;
  }

  tickets: ITicketsRepository = {
    getAll: async () => this.ensureInitialized<Ticket>('tickets', []),
    getById: async (id) => (await this.tickets.getAll()).find(t => t.id === id),
    create: async (t) => {
      const sla = this.calculateSLA(t.priority || TicketPriority.P3_MEDIUM);
      const newItem = {
        ...t, id: `T-${Date.now()}`, key: `TCK-${new Date().getFullYear()}-${Math.floor(Math.random()*9000)+1000}`,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        status: TicketStatus.NEW, firstResponseDueAt: sla.response, resolutionDueAt: sla.resolution,
        tags: t.tags || []
      } as Ticket;
      await storageService.put('tickets', newItem);
      await storageService.put('ticket_activities', {
        id: `ACT-${Date.now()}`, ticketId: newItem.id, actorName: t.requesterName || 'System',
        action: 'تذكرة جديدة', details: 'تم إنشاء السجل وحساب مواعيد الـ SLA آلياً.', createdAt: newItem.createdAt
      });
      return newItem;
    },
    update: async (id, updates) => {
      const ticket = await this.tickets.getById(id);
      if (!ticket) return null;
      const updated = { ...ticket, ...updates, updatedAt: new Date().toISOString() };
      await storageService.put('tickets', updated);
      return updated;
    },
    addComment: async (ticketId, comment) => {
      const newComment = { ...comment, id: `TC-${Date.now()}`, ticketId, createdAt: new Date().toISOString() } as TicketComment;
      await storageService.put('ticket_comments', newComment);
      await storageService.put('ticket_activities', {
         id: `ACT-C-${Date.now()}`, ticketId, actorName: comment.authorName || 'User',
         action: comment.visibility === CommentVisibility.INTERNAL ? 'ملاحظة داخلية' : 'رد عام',
         details: 'تمت إضافة تعليق جديد على التذكرة.', createdAt: new Date().toISOString()
      });
      return newComment;
    },
    getComments: async (ticketId) => {
      const all = await storageService.getAll<TicketComment>('ticket_comments');
      const currentUser = JSON.parse(localStorage.getItem('enjaz_session_user') || '{}');
      const canSeeInternal = ['Project Manager', 'Supervisor', 'Admin'].includes(currentUser.role);
      
      return all
        .filter(c => c.ticketId === ticketId)
        .filter(c => c.visibility === CommentVisibility.PUBLIC || canSeeInternal)
        .sort((a,b) => a.createdAt.localeCompare(b.createdAt));
    },
    getActivities: async (ticketId) => {
      const all = await storageService.getAll<TicketActivity>('ticket_activities');
      return all.filter(a => a.ticketId === ticketId).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
    },
    transitionStatus: async (id, nextStatus, comment) => {
      const ticket = await this.tickets.getById(id);
      if (!ticket) throw new Error("التذكرة غير موجودة.");
      if (!this.isValidTransition(ticket.status, nextStatus)) {
        throw new Error(`انتقال غير مسموح به من ${ticket.status} إلى ${nextStatus}`);
      }
      const oldStatus = ticket.status;
      await this.tickets.update(id, { status: nextStatus });
      const currentUser = JSON.parse(localStorage.getItem('enjaz_session_user') || '{}');
      
      await storageService.put('ticket_activities', {
        id: `ACT-S-${Date.now()}`, 
        ticketId: id, 
        actorName: currentUser.name || 'System',
        action: 'تغيير الحالة', 
        details: `تم تغيير الحالة من ${oldStatus} إلى ${nextStatus}. ${comment || ''}`,
        createdAt: new Date().toISOString(),
        signatureUrl: ticket.signatureUrl // إدراج التوقيع في سجل النشاط إذا وجد
      });
    }
  };

  ai: IAiService = {
    analyzeWorkItem: async () => "STUB: يتم تحليل البيانات في السيرفر فقط.",
    suggestPriority: async () => "Medium",
    generateExecutiveBrief: async () => "STUB: تقرير استراتيجي محاكي للوضع الحالي.",
    generateFinancialInsight: async () => "STUB: الباك-إند هو من يملك المفاتيح والقدرة التحليلية.",
    generateDailyReport: async () => "STUB: ملخص يومي ذكي (محاكي).",
    askWiki: async () => "STUB: المساعد المعرفي في وضع الاستعداد.",
    analyzeNotification: async () => ({ priority: 'normal', category: 'system' })
  };

  workItems: IWorkItemRepository = {
    getAll: async () => this.ensureInitialized('work_items', MOCK_WORK_ITEMS),
    getById: async (id) => (await this.workItems.getAll()).find(i => i.id === id),
    create: async (item) => storageService.put('work_items', { ...item, id: `WI-${Date.now()}` } as WorkItem),
    update: async (id, updates) => {
       const item = await this.workItems.getById(id);
       if(!item) return null;
       return storageService.put('work_items', { ...item, ...updates });
    },
    updateStatus: async (id, status) => {
       const item = await this.workItems.getById(id);
       if(!item) return null;
       return storageService.put('work_items', { ...item, status: status as any });
    },
    addComment: async (itemId, comment) => {
       const item = await this.workItems.getById(itemId);
       if(!item) return null;
       const updated = { ...item, comments: [...(item.comments || []), comment] };
       return storageService.put('work_items', updated);
    },
    submitApprovalDecision: async (itemId, stepId, decision, comments) => {
       const item = await this.workItems.getById(itemId);
       if(!item) return null;
       const updatedChain = item.approvalChain?.map(s => s.id === stepId ? { ...s, decision, comments, decisionDate: new Date().toISOString() } : s);
       return storageService.put('work_items', { ...item, approvalChain: updatedChain as any });
    }
  };
  projects: IProjectRepository = {
    getAll: async () => this.ensureInitialized('projects', MOCK_PROJECTS),
    getById: async (id) => (await this.projects.getAll()).find(p => p.id === id),
    update: async (id, updates) => {
       const p = await this.projects.getById(id);
       if(!p) return null;
       return storageService.put('projects', { ...p, ...updates });
    }
  };
  users: IUserRepository = {
    getAll: async () => this.ensureInitialized('users', MOCK_USERS),
    getCurrentUser: async () => {
      const user = localStorage.getItem('enjaz_session_user');
      return user ? JSON.parse(user) : MOCK_USERS[0];
    },
    setCurrentUser: async (id) => {
       const user = (await this.users.getAll()).find(u => u.id === id);
       if(user) localStorage.setItem('enjaz_session_user', JSON.stringify(user));
       return user;
    }
  };
  assets: IAssetRepository = {
    getAll: async () => this.ensureInitialized('assets', MOCK_ASSETS),
    getById: async (id) => (await this.assets.getAll()).find(a => a.id === id),
    update: async (id, updates) => {
       const a = await this.assets.getById(id);
       if(!a) return null;
       return storageService.put('assets', { ...a, ...updates });
    },
    create: async (asset) => storageService.put('assets', { ...asset, id: `AST-${Date.now()}` } as Asset)
  };
  materials: IMaterialRepository = {
    getAll: async () => this.ensureInitialized('materials', []),
    getById: async (id) => (await this.materials.getAll()).find(m => m.id === id),
    updateStock: async (id, qty, type, note) => {
       const m = await this.materials.getById(id);
       if(!m) throw new Error("Not found");
       const newQty = type === 'Inbound' ? m.currentStock + qty : m.currentStock - qty;
       const updated = { ...m, currentStock: newQty };
       await storageService.put('materials', updated);
       await storageService.put('stock_movements', { id: `SM-${Date.now()}`, materialId: id, type, quantity: qty, note, createdAt: new Date().toISOString(), performedBy: 'System' });
       return updated;
    },
    create: async (material) => storageService.put('materials', material as Material),
    getMovements: async (mid) => (await storageService.getAll<StockMovement>('stock_movements')).filter(sm => sm.materialId === mid)
  };
  dailyLogs: IDailyLogRepository = {
     getAll: async (pid) => (await storageService.getAll<DailyLog>('daily_logs')).filter(l => !pid || l.projectId === pid),
     getById: async (id) => (await storageService.getAll<DailyLog>('daily_logs')).find(l => l.id === id),
     create: async (log) => storageService.put('daily_logs', { ...log, id: `DL-${Date.now()}` } as DailyLog),
     approve: async (id) => {
        const log = await this.dailyLogs.getById(id);
        if(log) await storageService.put('daily_logs', { ...log, isApproved: true });
     }
  };
  employees: IEmployeeRepository = {
     getAll: async () => this.ensureInitialized('employees', []),
     getById: async (id) => (await this.employees.getAll()).find(e => e.id === id),
     update: async (id, updates) => {
        const e = await this.employees.getById(id);
        if(!e) return null;
        return storageService.put('employees', { ...e, ...updates });
     },
     create: async (emp) => storageService.put('employees', { ...emp, id: `EMP-${Date.now()}` } as Employee)
  };
  payroll: IPayrollRepository = {
     getMonthlyRecords: async (m, y) => (await storageService.getAll<PayrollRecord>('payroll')).filter(r => r.month === m && r.year === y),
     generatePayroll: async (m, y) => {
        const emps = await this.employees.getAll();
        const records = emps.map(e => ({ id: `PR-${e.id}-${m}`, employeeId: e.id, employeeName: e.name, month: m, year: y, workedHours: 160, overtimeHours: 10, basePay: 5000, overtimePay: 500, deductions: 100, netPay: 5400, status: 'Draft' as const }));
        for(const r of records) await storageService.put('payroll', r);
        return records;
     },
     approveRecord: async (id) => {
        const r = (await storageService.getAll<PayrollRecord>('payroll')).find(rec => rec.id === id);
        if(r) await storageService.put('payroll', { ...r, status: 'Approved' });
     },
     markAsPaid: async (id) => {
        const r = (await storageService.getAll<PayrollRecord>('payroll')).find(rec => rec.id === id);
        if(r) await storageService.put('payroll', { ...r, status: 'Paid' });
     }
  };
  vendors: IVendorRepository = {
     getAll: async () => this.ensureInitialized('vendors', []),
     getById: async (id) => (await this.vendors.getAll()).find(v => v.id === id),
     getByCategory: async (cat) => (await this.vendors.getAll()).filter(v => v.category === cat),
     create: async (v) => storageService.put('vendors', { ...v, id: `V-${Date.now()}` } as Vendor),
     update: async (id, updates) => {
        const v = await this.vendors.getById(id);
        if(!v) return null;
        return storageService.put('vendors', { ...v, ...updates });
     }
  };
  procurement: IProcurementRepository = {
     getPurchaseOrders: async (pid) => (await storageService.getAll<PurchaseOrder>('pos')).filter(p => !pid || p.projectId === pid),
     createPO: async (po) => storageService.put('pos', { ...po, id: `PO-${Date.now()}` } as PurchaseOrder),
     updatePOStatus: async (id, status) => {
        const po = (await storageService.getAll<PurchaseOrder>('pos')).find(p => p.id === id);
        if(po) await storageService.put('pos', { ...po, status: status as any });
     },
     getContracts: async (pid) => (await storageService.getAll<Contract>('contracts')).filter(c => !pid || c.projectId === pid),
     createContract: async (c) => storageService.put('contracts', { ...c, id: `CN-${Date.now()}` } as Contract),
     getPettyCashRecords: async (pid) => (await storageService.getAll<PettyCashRecord>('petty_cash')).filter(r => r.projectId === pid),
     addPettyCashEntry: async (e) => storageService.put('petty_cash', { ...e, id: `PC-${Date.now()}` } as PettyCashRecord)
  };
  stakeholders: IStakeholderRepository = {
     getClients: async () => storageService.getAll<Client>('clients'),
     getClientById: async (id) => (await storageService.getAll<Client>('clients')).find(c => c.id === id),
     getChangeOrders: async (pid) => (await storageService.getAll<ChangeOrder>('cos')).filter(co => co.projectId === pid),
     createChangeOrder: async (co) => storageService.put('cos', { ...co, id: `CO-${Date.now()}` } as ChangeOrder),
     updateChangeOrderStatus: async (id, status) => {
        const co = (await storageService.getAll<ChangeOrder>('cos')).find(c => c.id === id);
        if(co) await storageService.put('cos', { ...co, status: status as any });
     },
     getRfIs: async (pid) => (await storageService.getAll<Rfi>('rfis')).filter(r => r.projectId === pid),
     createRfi: async (rfi) => storageService.put('rfis', { ...rfi, id: `RFI-${Date.now()}` } as Rfi),
     updateRfiStatus: async (id, status, response) => {
        const rfi = (await storageService.getAll<Rfi>('rfis')).find(r => r.id === id);
        if(rfi) await storageService.put('rfis', { ...rfi, status: status as any });
     },
     getMaterialSubmittals: async (pid) => (await storageService.getAll<MaterialSubmittal>('submittals')).filter(s => s.projectId === pid),
     createMaterialSubmittal: async (s) => storageService.put('submittals', { ...s, id: `MS-${Date.now()}` } as MaterialSubmittal),
     updateSubmittalStatus: async (id, status, comment) => {
        const s = (await storageService.getAll<MaterialSubmittal>('submittals')).find(sub => sub.id === id);
        if(s) await storageService.put('submittals', { ...s, status: status as any });
     },
     getSubcontractors: async (pid) => storageService.getAll<Subcontractor>('subs'),
     getPaymentCertificates: async (pid) => (await storageService.getAll<PaymentCertificate>('certs')).filter(c => c.projectId === pid),
     createPaymentCertificate: async (c) => storageService.put('certs', { ...c, id: `CERT-${Date.now()}` } as PaymentCertificate),
     updateCertificateStatus: async (id, status) => {
        const c = (await storageService.getAll<PaymentCertificate>('certs')).find(cert => cert.id === id);
        if(c) await storageService.put('certs', { ...c, status: status as any });
     },
     getNcrs: async (pid) => (await storageService.getAll<Ncr>('ncrs')).filter(n => n.projectId === pid),
     createNcr: async (ncr) => storageService.put('ncrs', { ...ncr, id: `NCR-${Date.now()}` } as Ncr),
     updateNcrStatus: async (id, status) => {
        const n = (await storageService.getAll<Ncr>('ncrs')).find(ncr => ncr.id === id);
        if(n) await storageService.put('ncrs', { ...n, status: status as any });
     },
     getPermits: async (pid) => (await storageService.getAll<Permit>('permits')).filter(p => p.projectId === pid),
     getLGs: async (pid) => (await storageService.getAll<LetterOfGuarantee>('lgs')).filter(l => l.projectId === pid)
  };
  documents: IDocumentRepository = {
     getAll: async () => storageService.getAll<AppDocument>('documents'),
     getByProjectId: async (pid) => (await storageService.getAll<AppDocument>('documents')).filter(d => d.projectId === pid),
     upload: async (d) => storageService.put('documents', { ...d, id: `DOC-${Date.now()}`, uploadedAt: new Date().toISOString() } as AppDocument),
     delete: async (id) => storageService.delete('documents', id),
     getBlueprints: async (pid) => (await storageService.getAll<Blueprint>('blueprints')).filter(b => b.projectId === pid),
     updateBlueprintPins: async (id, pins) => {
        const b = (await storageService.getAll<Blueprint>('blueprints')).find(bp => bp.id === id);
        if(b) await storageService.put('blueprints', { ...b, pins });
     }
  };
  knowledge: IKnowledgeRepository = {
     getAll: async () => this.ensureInitialized<AppArticle>('articles', MOCK_ARTICLES),
     search: async (q) => (await this.knowledge.getAll()).filter(a => a.title.includes(q) || a.content.includes(q)),
     create: async (a) => storageService.put('articles', { ...a, id: `KB-${Date.now()}` } as AppArticle)
  };
  notifications: INotificationRepository = {
     getAll: async () => storageService.getAll<Notification>('notifications'),
     getForUser: async (id) => (await this.notifications.getAll()).filter(n => n.userId === id),
     getUnreadCount: async (id) => (await this.notifications.getForUser(id)).filter(n => !n.isRead).length,
     create: async (n) => storageService.put('notifications', { ...n, id: `NT-${Date.now()}` } as Notification),
     markAsRead: async (id) => {
        const n = (await this.notifications.getAll()).find(not => not.id === id);
        if(n) await storageService.put('notifications', { ...n, isRead: true });
     },
     markAllAsRead: async (uid) => {
        const userNotifs = await this.notifications.getForUser(uid);
        for(const n of userNotifs) await this.notifications.markAsRead(n.id);
     },
     getPreferences: () => ({ dndEnabled: false, channels: { critical: { email: true, inApp: true, push: true }, mentions: { email: true, inApp: true, push: true }, updates: { email: false, inApp: true, push: false } } }),
     savePreferences: async (prefs) => { localStorage.setItem('notif_prefs', JSON.stringify(prefs)); }
  };
  automation: IAutomationRepository = {
     getRules: () => [],
     toggleRule: (id) => []
  };
  fieldOps: IFieldOpsRepository = {
     getDrafts: async () => storageService.getAll('field_drafts'),
     saveDraft: async (d) => storageService.put('field_drafts', d),
     removeDraft: async (id) => storageService.delete('field_drafts', id),
     clearDrafts: async () => { const ds = await this.fieldOps.getDrafts(); for(const d of ds) await this.fieldOps.removeDraft(d.id); }
  };
  invalidateCache() {}
}
