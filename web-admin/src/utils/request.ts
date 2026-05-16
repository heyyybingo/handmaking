/**
 * Axios 请求工具类
 * 封装统一的请求拦截、响应拦截、Token管理、错误重试
 */
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';

/**
 * API 基础地址
 * 开发阶段通过 Vite proxy 代理到后端，生产阶段使用相对路径
 */
const BASE_URL = '/api';

/**
 * 创建 Axios 实例
 * 配置基础URL、超时时间、请求/响应拦截器
 */
const request: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器
 * 自动携带 JWT Token
 */
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('admin_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * 响应拦截器
 * 处理401未授权（跳转登录页）、403无权限提示、500服务器错误、网络错误
 * 支持 5xx 错误自动重试一次（延迟 1 秒）
 */
request.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Token 过期或无效，清除本地存储并跳转登录页
        localStorage.removeItem('admin_token');
        message.error('登录已过期，请重新登录');
        window.location.href = '/login';
      } else if (status === 403) {
        message.error('无权限访问');
        // 可选：跳转到 403 页面
        // window.location.href = '/403';
      } else if (status >= 500) {
        // 5xx 错误：重试一次（延迟 1 秒）
        if (!config._retryCount || config._retryCount < 1) {
          config._retryCount = (config._retryCount || 0) + 1;
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return request(config);
        }
        message.error('服务器错误，请稍后重试');
      }
    } else if (error.code === 'ECONNABORTED') {
      message.error('请求超时，请稍后重试');
    } else {
      // 网络错误（无 response）
      message.error('网络连接失败，请检查网络');
    }

    return Promise.reject(error);
  },
);

export default request;

/**
 * 通用 GET 请求
 * @param url - 请求路径
 * @param config - Axios 请求配置
 */
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return request.get(url, config) as Promise<T>;
}

/**
 * 通用 POST 请求
 * @param url - 请求路径
 * @param data - 请求体
 * @param config - Axios 请求配置
 */
export async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return request.post(url, data, config) as Promise<T>;
}

/**
 * 通用 PUT 请求
 * @param url - 请求路径
 * @param data - 请求体
 * @param config - Axios 请求配置
 */
export async function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return request.put(url, data, config) as Promise<T>;
}

/**
 * 通用 DELETE 请求
 * @param url - 请求路径
 * @param config - Axios 请求配置
 */
export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return request.delete(url, config) as Promise<T>;
}