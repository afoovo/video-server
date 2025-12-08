/**
 * API请求工具
 * 适配sa-token认证机制
 */
import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
import type { ApiResponse } from '@/types/common';
import JSONbig from 'json-bigint';

// 创建 axios 实例，添加处理大整数
const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  transformResponse: [
    function (data) {
      if (typeof data === 'string' && data.length) {
        try {
          return JSONbig.parse(data);
        } catch (err) {
          console.error('JSON big int parse error:', err);
          return data;
        }
      }
      return data;
    },
  ],
});

// 判断是否是认证相关的URL
function isAuthRelatedUrl(url?: string): boolean {
  if (!url) return false;
  const authUrls: string[] = ['/auth/login', '/auth/register', '/auth/logout'];
  return authUrls.some(pattern => url.includes(pattern));
}

// 处理认证错误
function handleAuthError(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  router.push({
    path: '/login',
    query: { redirect: router.currentRoute.value.fullPath },
  });
}

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // 确保headers存在
    if (!config.headers) {
      config.headers = new axios.AxiosHeaders();
    }

    // 设置默认Content-Type
    if (!config.headers.has('Content-Type') && !config.headers.has('content-type')) {
      config.headers.set('Content-Type', 'application/json');
    }

    // 为所有请求添加Authorization头
    const token = localStorage.getItem('token');
    if (token && !config.headers.has('Authorization')) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    // 为所有请求添加satoken头（sa-token框架需要）
    if (!config.headers.has('satoken')) {
      config.headers.set('satoken', token || '');
    }

    // 处理上传文件时的Content-Type
    if (config.headers.get('Content-Type') === 'multipart/form-data') {
      config.headers.delete('Content-Type');
    }

    return config;
  },
  (error): Promise<any> => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse): any => {
    // 二进制响应直接返回
    if (
      response.config.responseType === 'blob' ||
      response.config.responseType === 'arraybuffer' ||
      response.headers['content-type']?.includes('video/')
    ) {
      return response.data;
    }

    const res = response.data;

    // 验证响应格式
    if (!res || typeof res !== 'object') {
      return Promise.reject(new Error('服务器响应格式错误'));
    }

    // 处理统一的响应格式 (后端使用code=200表示成功)
    if ((res as ApiResponse<any>).code !== undefined) {
      if ((res as ApiResponse<any>).code !== 200) {
        const errorMessage = (res as ApiResponse<any>).msg || '请求失败';
        ElMessage.error(errorMessage);

        // 处理未认证状态
        if ((res as ApiResponse<any>).code === 401 && !isAuthRelatedUrl(response.config.url)) {
          handleAuthError();
        }
        return Promise.reject(new Error(errorMessage));
      }

      return (res as ApiResponse<any>).data || res;
    }

    return res;
  },
  (error): Promise<any> => {
    const response = error.response;
    const errorData = response?.data;
    const url = error.config?.url;

    if (response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录');
      handleAuthError();
    } else if (response) {
      // 处理HTTP状态码错误
      const errorMessages: Record<number, string> = {
        403: errorData?.msg || '没有权限执行此操作',
        404: '请求的资源不存在',
        408: '请求超时，请检查网络连接',
        500: '服务器内部错误，请稍后重试',
        502: '网关错误，请稍后重试',
        503: '服务不可用，请稍后重试',
        504: '网关超时，请稍后重试',
      };
      ElMessage.error(
        errorMessages[response.status] || errorData?.msg || error.message || '请求失败'
      );
    } else {
      ElMessage.error('网络连接失败，请检查网络设置');
    }

    return Promise.reject(error);
  }
);

// 导出带类型的请求方法
export function get<T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
  return service.get(url, config);
}

export function post<T = any>(
  url: string,
  data?: any,
  config?: InternalAxiosRequestConfig
): Promise<T> {
  return service.post(url, data, config);
}

export function put<T = any>(
  url: string,
  data?: any,
  config?: InternalAxiosRequestConfig
): Promise<T> {
  return service.put(url, data, config);
}

/**
 * DELETE请求
 * @param url - 请求URL
 * @param config - 请求配置
 * @returns Promise<T>
 */
export function del<T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
  return service.delete(url, config);
}

export default service as AxiosInstance;
