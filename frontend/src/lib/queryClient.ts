import { QueryClient, QueryFunction } from "@tanstack/react-query";
import type { ApiResponse, PaginatedResponse } from "@shared/schemas/schema";

// API基础URL配置
const API_BASE_URL = (import.meta as any).env?.PROD 
  ? '/api' // 生产环境：相对路径，避免跨域
  : '/api'; // 开发环境：通过Vite代理

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    let errorCode = 'UNKNOWN_ERROR';
    
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
      errorCode = errorData.error?.code || errorCode;
    } catch {
      // 如果解析JSON失败，使用默认错误信息
      if (res.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
        errorCode = 'SERVER_ERROR';
      } else if (res.status === 404) {
        errorMessage = 'The requested resource was not found.';
        errorCode = 'NOT_FOUND';
      } else if (res.status === 401) {
        errorMessage = 'You are not authorized to perform this action.';
        errorCode = 'UNAUTHORIZED';
      } else if (res.status === 403) {
        errorMessage = 'Access denied.';
        errorCode = 'FORBIDDEN';
      } else if (res.status >= 400 && res.status < 500) {
        errorMessage = 'Please check your input and try again.';
        errorCode = 'VALIDATION_ERROR';
      }
    }
    
    const error = new Error(errorMessage);
    (error as any).code = errorCode;
    (error as any).status = res.status;
    throw error;
  }
}

export async function apiRequest(
  method: string,
  endpoint: string,
  data?: unknown | undefined,
): Promise<Response> {
  const url = `${API_BASE_URL}/${endpoint.replace(/^\//, '')}`;
  
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await apiRequest('GET', endpoint);
  const result: ApiResponse<T> | PaginatedResponse<T> = await res.json();
  
  if (!result.success) {
    throw new Error(result.message || 'API request failed');
  }
  
  // 处理分页响应
  if ('data' in result && result.data && typeof result.data === 'object' && 'products' in result.data) {
    return result.data as T;
  }
  
  return result.data as T;
}

export async function apiPost<T>(endpoint: string, data: unknown): Promise<T> {
  const res = await apiRequest('POST', endpoint, data);
  const result: ApiResponse<T> = await res.json();
  
  if (!result.success) {
    throw new Error(result.message || 'API request failed');
  }
  
  return result.data as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn = <T>(options: { on401: UnauthorizedBehavior }): QueryFunction<T> => {
  return async ({ queryKey }) => {
    const endpoint = queryKey.join("/");
    
    try {
      return await apiGet<T>(endpoint);
    } catch (error) {
      if (options.on401 === "returnNull" && 
          error instanceof Error && 
          error.message.includes("401")) {
        return null as T;
      }
      throw error;
    }
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5分钟缓存
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});




