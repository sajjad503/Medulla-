import axios from 'axios';

// در محیط توسعه AI Studio از آدرس نسبی (سرور محلی Express/Node) استفاده می‌کنیم تا خطای Network Error به خاطر عدم دسترسی به سرور خارجی لیارا رخ ندهد
const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// ارسال خودکار توکن امنیتی در هدر تمامی درخواست‌ها
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('mentora_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {}
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// مدیریت سراسری خطاهای پاسخ سرور
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const errorMsg = error?.response?.data?.detail || error?.message || 'خطای ناشناخته در ارتباط با سرور';

    if (status === 401) {
      try {
        localStorage.removeItem('mentora_token');
        window.dispatchEvent(new Event('mentora_auth_change'));
      } catch (_) {}
    } else if (status === 500) {
      console.error('[Database / Server Error 500]:', errorMsg);
    } else if (error?.code === 'ERR_NETWORK' || !error?.response) {
      console.warn('[Network Error / Offline / Fallback Handled]:', errorMsg);
    }

    return Promise.reject(error);
  }
);

export default api;
