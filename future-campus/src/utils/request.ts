import axios from 'axios';
import Cookies from 'js-cookie';

// 从环境变量获取配置
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888/campus/help';
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 5000;

// 创建 axios 实例
const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
});

// 请求拦截器 - 可以在这里统一添加 token 等
api.interceptors.request.use(
  (config) => {
    // 从 Cookie 获取 token
    const token = Cookies.get('token');
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API 请求错误:', error);
    
    // 统一处理常见的错误状态码
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('未授权，请重新登录');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          console.error('拒绝访问');
          break;
        case 404:
          console.error('请求资源不存在');
          break;
        case 500:
          console.error('服务器错误');
          break;
        default:
          console.error('请求失败');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
