/**
 * @file httpClient.ts
 * @description عميل HTTP الموحد للمنصة.
 */

const getBaseUrl = () => {
  // استخدام المتغير من Vite
  return (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
};

// Fix: Defining request as a standalone generic function to ensure proper type inference for generic parameters
const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const baseUrl = getBaseUrl();
  const token = localStorage.getItem('enjaz_session_token');
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API_ERROR: ${response.status}`);
  }

  return await response.json();
};

export const httpClient = {
  request,

  // Fix: Directly calling the generic request function to resolve type argument errors and ensure Promise<T> return type
  get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'GET' });
  },

  // Fix: Directly calling the generic request function to resolve type argument errors and ensure Promise<T> return type
  post<T>(endpoint: string, data: any): Promise<T> {
    return request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) });
  },

  // Fix: Directly calling the generic request function to resolve type argument errors and ensure Promise<T> return type
  put<T>(endpoint: string, data: any): Promise<T> {
    return request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) });
  },

  // Fix: Directly calling the generic request function to resolve type argument errors and ensure Promise<T> return type
  patch<T>(endpoint: string, data: any): Promise<T> {
    return request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) });
  },

  // Fix: Directly calling the generic request function to resolve type argument errors and ensure Promise<T> return type
  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE' });
  }
};
