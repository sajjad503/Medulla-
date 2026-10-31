import axios from 'axios';

// ایجاد یک نمونه (instance) از اکسیوس با آدرس پایه بک‌اند
const api = axios.create({
  baseURL: 'http://localhost:8000', // آدرس سرور FastAPI شما روی لوکال
});

// این بخش به صورت خودکار توکن امنیتی را به تمام درخواست‌ها اضافه می‌کند
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mentora_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
