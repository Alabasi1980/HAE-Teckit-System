import { IDataProvider, IWorkItemRepository } from '../../contracts';
import { WorkItemMapper, WorkItemDTO } from '../../mappers/WorkItemMapper';
import { WorkItem, Status } from '../../../shared/types';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('enjaz_session_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });
      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized request");
        }
        throw new Error(`API Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Fetch error on ${endpoint}:`, error);
      throw error;
    }
  }

  get<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'GET' }); }
  post<T>(endpoint: string, data: any) { return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }); }
  put<T>(endpoint: string, data: any) { return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }); }
  delete(endpoint: string) { return this.request(endpoint, { method: 'DELETE' }); }
}

class WorkItemHttpRepo implements IWorkItemRepository {
  constructor(private client: ApiClient) {}

  async getAll(): Promise<WorkItem[]> {
    const dtos = await this.client.get<WorkItemDTO[]>('/work-items');
    return dtos.map(WorkItemMapper.toDomain);
  }

  async getById(id: string): Promise<WorkItem | undefined> {
    const dto = await this.client.get<WorkItemDTO>(`/work-items/${id}`);
    return WorkItemMapper.toDomain(dto);
  }

  async create(item: Partial<WorkItem>): Promise<WorkItem> {
    const dto = WorkItemMapper.toDTO(item);
    const result = await this.client.post<WorkItemDTO>('/work-items', dto);
    return WorkItemMapper.toDomain(result);
  }

  async update(id: string, updates: Partial<WorkItem>): Promise<WorkItem | null> {
    const dto = WorkItemMapper.toDTO(updates);
    const result = await this.client.put<WorkItemDTO>(`/work-items/${id}`, dto);
    return WorkItemMapper.toDomain(result);
  }

  async updateStatus(id: string, status: Status): Promise<WorkItem | null> {
    const result = await this.client.put<WorkItemDTO>(`/work-items/${id}/status`, { status });
    return WorkItemMapper.toDomain(result);
  }

  async addComment(itemId: string, comment: any): Promise<WorkItem | null> {
    const result = await this.client.post<WorkItemDTO>(`/work-items/${itemId}/comments`, comment);
    return WorkItemMapper.toDomain(result);
  }

  async submitApprovalDecision(itemId: string, stepId: string, decision: any, comments: string): Promise<WorkItem | null> {
    const result = await this.client.post<WorkItemDTO>(`/work-items/${itemId}/approvals/${stepId}`, { decision, comments });
    return WorkItemMapper.toDomain(result);
  }
}

export class HttpApiProvider implements IDataProvider {
  private client = new ApiClient();
  workItems = new WorkItemHttpRepo(this.client);

  get projects(): any { return { getAll: () => this.client.get('/projects') }; }
  get users(): any { return { 
    getAll: () => this.client.get('/users'),
    getCurrentUser: () => this.client.get('/users/me'),
    setCurrentUser: (id: string) => this.client.post('/users/session', { id })
  }; }
  get assets(): any { return { getAll: () => Promise.resolve([]) }; }
  get documents(): any { return { getAll: () => Promise.resolve([]) }; }
  get knowledge(): any { return { getAll: () => Promise.resolve([]) }; }
  get notifications(): any { return { getForUser: (id: string) => this.client.get(`/notifications/${id}`) }; }
  get fieldOps(): any { return { getDrafts: () => [], saveDraft: () => [], removeDraft: () => [], clearDrafts: () => {} }; }
  get ai(): any { return { 
    analyzeWorkItem: () => Promise.resolve("AI stub"),
    generateExecutiveBrief: () => Promise.resolve("Brief stub")
  }; }

  // Fix: Added missing invalidateCache method to satisfy IDataProvider interface requirement and allow correct usage in DataContext
  invalidateCache(): void {
    // Cache invalidation logic for HTTP provider
    console.log('HTTP Cache Invalidation triggered');
  }
}
