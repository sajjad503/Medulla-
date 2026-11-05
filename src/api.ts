import axios from 'axios';

// آدرس پایه API: در محیط سرور محلی یا هاست اشتراکی cPanel به صورت خودکار از مسیر نسبی استفاده می‌کند
// اگر در فایل .env مقدار VITE_API_URL تعیین شده باشد از آن، وگرنه از آدرس جاری هاست استفاده می‌نماید
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined' && (window as any).__MEDULLA_API_URL__) {
    return (window as any).__MEDULLA_API_URL__;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return '';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 20000,
  withCredentials: true,
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
