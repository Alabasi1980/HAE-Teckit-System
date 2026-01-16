
/**
 * @file storageService.ts
 * @description مدير تخزين بيانات متقدم يدعم هجرة البيانات (Migrations) وإدارة الجلسات المتعددة لضمان سلامة بيانات الميدان.
 */

const DB_NAME = 'EnjazOneDB';
/* 
  تنبيه: قمنا برفع الإصدار إلى 5 لضمان تفعيل onupgradeneeded وإضافة الجداول الجديدة
*/
const DB_VERSION = 5;

// تعريف هيكل المخازن (Stores) وإعداداتها
const STORE_CONFIGS: Record<string, IDBObjectStoreParameters> = {
  'work_items': { keyPath: 'id' },
  'projects': { keyPath: 'id' },
  'assets': { keyPath: 'id' },
  'articles': { keyPath: 'id' },
  'notifications': { keyPath: 'id' },
  'field_drafts': { keyPath: 'id' },
  'settings': { keyPath: 'id' },
  'users': { keyPath: 'id' },
  'documents': { keyPath: 'id' },
  'blueprints': { keyPath: 'id' },
  /* إضافة الجداول المفقودة لنظام التذاكر */
  'tickets': { keyPath: 'id' },
  'ticket_activities': { keyPath: 'id' },
  'ticket_comments': { keyPath: 'id' }
};

export const storageService = {
  db: null as IDBDatabase | null,
  initPromise: null as Promise<IDBDatabase> | null,

  /**
   * تهيئة قاعدة البيانات مع معالجة الإصدارات والترقيات.
   */
  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = request.result;
        Object.entries(STORE_CONFIGS).forEach(([name, config]) => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, config);
          }
        });
      };

      request.onsuccess = () => {
        this.db = request.result;
        
        this.db.onversionchange = () => {
          this.db?.close();
          this.db = null;
          this.initPromise = null;
        };
        
        resolve(this.db);
      };

      request.onerror = () => {
        this.initPromise = null;
        reject(request.error);
      };

      request.onblocked = () => {
        console.warn("[Storage] Database upgrade blocked. Please close other tabs.");
      };
    });

    return this.initPromise;
  },

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.init();
    if (!db.objectStoreNames.contains(storeName)) {
      console.error(`Store ${storeName} not found in DB`);
      return [];
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async put<T>(storeName: string, item: T): Promise<T> {
    const db = await this.init();
    if (!db.objectStoreNames.contains(storeName)) {
      throw new Error(`CRITICAL: Store ${storeName} is missing. Migration failed?`);
    }
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  },

  async delete(storeName: string, id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};
