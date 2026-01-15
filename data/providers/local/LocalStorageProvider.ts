import { IDataProvider, IWorkItemRepository, IProjectRepository, IUserRepository, IAssetRepository, IDocumentRepository, IKnowledgeRepository, INotificationRepository, IFieldOpsRepository, IAiService, IAutomationRepository } from '../../contracts';
import { WorkItem, Status, Notification, NotificationPreferences, AutomationRule, Priority, WorkItemType, ApprovalDecision, User, Project, Asset, Article } from '../../../shared/types';
import { MOCK_WORK_ITEMS, MOCK_PROJECTS, MOCK_USERS, MOCK_ASSETS, MOCK_ARTICLES } from '../../../shared/constants';

// --- Internal Helper for Persistent Storage ---
const STORE = {
  get: <T>(key: string, defaultValue: T[]): T[] => {
    const data = localStorage.getItem(`enjaz_v2_${key}`);
    return data ? JSON.parse(data) : defaultValue;
  },
  save: (key: string, data: any) => {
    localStorage.setItem(`enjaz_v2_${key}`, JSON.stringify(data));
  }
};

class LocalAiService implements IAiService {
  async analyzeWorkItem(item: WorkItem) { 
    return `### تحليل Gemini الذكي\nتبدو العملية **${item.title}** ذات أولوية **${item.priority}**. \n\n**التوصية:** يرجى التأكد من توفر الموارد البشرية اللازمة قبل تاريخ الاستحقاق ${item.dueDate}.`; 
  }
  async suggestPriority() { return "Medium"; }
  async generateExecutiveBrief() { return "## ملخص الأداء التشغيلي\nالنظام مستقر، وتم إنجاز 85% من مهام الأسبوع الحالي."; }
  async analyzeNotification() { return { priority: 'normal', category: 'system' }; }
  async askWiki(_c: string, q: string) { return `بناءً على الوثائق الداخلية، الإجابة على "${q}" هي: يجب اتباع معايير السلامة المهنية ISO-45001.`; }
}

export class LocalStorageProvider implements IDataProvider {
  private cache = new Map<string, any>();
  ai = new LocalAiService();

  invalidateCache() { this.cache.clear(); }

  workItems: IWorkItemRepository = {
    getAll: async (force) => {
      if (!force && this.cache.has('wi')) return this.cache.get('wi');
      const data = STORE.get('work_items', MOCK_WORK_ITEMS);
      this.cache.set('wi', data);
      return data;
    },
    getById: async (id) => (await this.workItems.getAll()).find(i => i.id === id),
    create: async (item) => {
      const all = await this.workItems.getAll(true);
      const newItem = { 
        ...item, 
        id: `WI-${Date.now()}`, 
        createdAt: new Date().toISOString(), 
        status: item.status || Status.OPEN, 
        comments: [], 
        tags: item.tags || [] 
      } as WorkItem;
      STORE.save('work_items', [newItem, ...all]);
      this.invalidateCache();
      return newItem;
    },
    update: async (id, updates) => {
      const all = await this.workItems.getAll(true);
      const idx = all.findIndex(i => i.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...updates };
      STORE.save('work_items', all);
      this.invalidateCache();
      return all[idx];
    },
    updateStatus: async (id, status) => this.workItems.update(id, { status }),
    addComment: async (id, comment) => {
      const item = await this.workItems.getById(id);
      if (!item) return null;
      return this.workItems.update(id, { comments: [...item.comments, comment] });
    },
    submitApprovalDecision: async (id, stepId, decision, comments) => {
      const item = await this.workItems.getById(id);
      if (!item || !item.approvalChain) return null;
      const chain = item.approvalChain.map(s => 
        s.id === stepId ? { ...s, decision, comments, decisionDate: new Date().toISOString() } : s
      );
      let status = item.status;
      if (chain.some(s => s.decision === ApprovalDecision.REJECTED)) status = Status.REJECTED;
      else if (chain.every(s => s.decision === ApprovalDecision.APPROVED)) status = Status.APPROVED;
      return this.workItems.update(id, { approvalChain: chain, status });
    }
  };

  projects: IProjectRepository = {
    getAll: async (force) => {
      if (!force && this.cache.has('pj')) return this.cache.get('pj');
      const data = STORE.get('projects', MOCK_PROJECTS);
      this.cache.set('pj', data);
      return data;
    },
    getById: async (id) => (await this.projects.getAll()).find(p => p.id === id),
    update: async (id, updates) => {
      const all = await this.projects.getAll(true);
      const idx = all.findIndex(p => p.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...updates };
      STORE.save('projects', all);
      this.invalidateCache();
      return all[idx];
    }
  };

  users: IUserRepository = {
    getAll: async () => STORE.get('users', MOCK_USERS),
    getCurrentUser: async () => {
      const id = localStorage.getItem('enjaz_user_session_id');
      const all = await this.users.getAll();
      return all.find(u => u.id === id) || all[0];
    },
    setCurrentUser: async (id) => {
      const all = await this.users.getAll();
      const user = all.find(u => u.id === id);
      if (user) localStorage.setItem('enjaz_user_session_id', user.id);
      return user;
    }
  };

  notifications: INotificationRepository = {
    getAll: async () => STORE.get('notifs', []),
    getForUser: async (uid) => (await this.notifications.getAll())
      .filter(n => n.userId === uid)
      .sort((a,b) => b.createdAt.localeCompare(a.createdAt)),
    getUnreadCount: async (uid) => (await this.notifications.getForUser(uid)).filter(n => !n.isRead).length,
    create: async (n) => {
      const all = await this.notifications.getAll();
      const newItem = { ...n, id: `N-${Date.now()}`, isRead: false, createdAt: new Date().toISOString() } as Notification;
      STORE.save('notifs', [newItem, ...all]);
      return newItem;
    },
    markAsRead: async (id) => {
      const all = await this.notifications.getAll();
      STORE.save('notifs', all.map(n => n.id === id ? { ...n, isRead: true } : n));
    },
    markAllAsRead: async (uid) => {
      const all = await this.notifications.getAll();
      STORE.save('notifs', all.map(n => n.userId === uid ? { ...n, isRead: true } : n));
    },
    getPreferences: () => STORE.get('notif_prefs', [{
      userId: 'default', dndEnabled: false, channels: {
        critical: { email: true, inApp: true, push: true },
        mentions: { email: true, inApp: true, push: true },
        updates: { email: false, inApp: true, push: false }
      }
    } as any])[0],
    savePreferences: (p) => STORE.save('notif_prefs', [p])
  };

  automation: IAutomationRepository = {
    getRules: () => STORE.get('rules', [
      { id: 'r1', name: 'أتمتة السلامة', description: 'توجيه بلاغات الحوادث فوراً لمشرف الموقع.', isEnabled: true, trigger: 'On Create' },
      { id: 'r2', name: 'اتفاقية الحالة الحرجة', description: 'ضبط الاستحقاق لـ 24 ساعة للمهام الحرجة.', isEnabled: true, trigger: 'On Create' }
    ]),
    toggleRule: (id) => {
      const rules = this.automation.getRules();
      const updated = rules.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r);
      STORE.save('rules', updated);
      return updated;
    }
  };

  assets: IAssetRepository = {
    getAll: async () => STORE.get('assets', MOCK_ASSETS),
    getById: async (id) => (await this.assets.getAll()).find(a => a.id === id),
    update: async (id, updates) => {
      const all = await this.assets.getAll();
      const idx = all.findIndex(a => a.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...updates };
      STORE.save('assets', all);
      return all[idx];
    },
    create: async (a) => {
      const all = await this.assets.getAll();
      const newItem = { ...a, id: `AST-${Date.now()}` } as any;
      STORE.save('assets', [newItem, ...all]);
      return newItem;
    }
  };

  documents: IDocumentRepository = {
    getAll: async () => STORE.get('docs', []),
    getByProjectId: async (pid) => (await this.documents.getAll()).filter(d => d.projectId === pid),
    upload: async (d) => {
      const all = await this.documents.getAll();
      const newItem = { ...d, id: `DOC-${Date.now()}`, uploadedAt: new Date().toISOString() } as any;
      STORE.save('docs', [newItem, ...all]);
      return newItem;
    },
    delete: async (id) => STORE.save('docs', (await this.documents.getAll()).filter(d => d.id !== id))
  };

  knowledge: IKnowledgeRepository = {
    getAll: async () => STORE.get('kb', MOCK_ARTICLES),
    search: async (q) => (await this.knowledge.getAll()).filter(a => a.title.includes(q)),
    create: async (a) => {
      const all = await this.knowledge.getAll();
      const newItem = { ...a, id: `KB-${Date.now()}`, lastUpdated: new Date().toISOString() } as any;
      STORE.save('kb', [newItem, ...all]);
      return newItem;
    }
  };

  fieldOps: IFieldOpsRepository = {
    getDrafts: () => STORE.get('field_drafts', []),
    saveDraft: (i) => {
      const d = [...this.fieldOps.getDrafts(), { ...i, id: `draft-${Date.now()}` }];
      STORE.save('field_drafts', d);
      return d;
    },
    removeDraft: (id) => {
      const d = this.fieldOps.getDrafts().filter(x => x.id !== id);
      STORE.save('field_drafts', d);
      return d;
    },
    clearDrafts: () => STORE.save('field_drafts', [])
  };
}