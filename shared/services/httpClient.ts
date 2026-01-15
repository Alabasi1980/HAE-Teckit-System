/**
 * @class HttpClient
 * @description محرك الطلبات البرمجية مع معالجة تلقائية للروابط والتوكنات.
 */
export class HttpClient {
  private baseUrl: string;

  constructor() {
    // جلب الرابط من ملف البيئة ومعالجة السلاش في النهاية
    let rawUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    this.baseUrl = rawUrl.replace(/\/+$/, ''); // يزيل أي / من نهاية الرابط
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('enjaz_session_token');
    
    // التأكد من أن المسار يبدأ بـ / واحدة فقط
    const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${this.baseUrl}${cleanPath}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(fullUrl, { ...options, headers });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.warn("[HTTP] Unauthorized - redirecting to login");
          // يمكن إضافة منطق تحويل المستخدم هنا
        }
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || `API_ERROR_${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error(`[HTTP] Failed to fetch ${fullUrl}:`, error.message);
      throw error;
    }
  }

  get<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'GET' }); }
  post<T>(endpoint: string, data: any) { return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }); }
  put<T>(endpoint: string, data: any) { return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }); }
  patch<T>(endpoint: string, data: any) { return this.request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }); }
  delete<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'DELETE' }); }
}

export const httpClient = new HttpClient();
