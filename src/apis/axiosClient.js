import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const instance = axios.create({
    // Sử dụng biến môi trường, fallback về localhost nếu không có
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    withCredentials: true
});

// Biến quản lý trạng thái refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// 1. Request Interceptor: Đọc token từ Cookie
instance.interceptors.request.use(
    config => {
        const token = Cookies.get('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// 2. Response Interceptor: Xử lý dữ liệu và lỗi toàn cục
instance.interceptors.response.use(
    response => {
        return response.data?.data !== undefined
            ? response.data.data
            : response.data;
    },

    async error => {
        const originalRequest = error.config;
        const status = error.response?.status;

        // Lấy message lỗi từ cấu trúc RestResponse của Backend
        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Đã có lỗi xảy ra';

        // A. Xử lý lỗi 401 - Refresh Token
        if (status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return instance(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await instance.get('/api/v1/auth/refresh');
                const newAccessToken = res.data?.accessToken;

                if (newAccessToken) {
                    Cookies.set('access_token', newAccessToken, { expires: 1 });
                    processQueue(null, newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return instance(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                Cookies.remove('access_token');
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // B. Global Error Handling - Hiển thị Toast hoặc Chuyển hướng
        if (status) {
            switch (status) {
                case 400:
                    toast.error(errorMessage);
                    break;
                case 403:
                    toast.error('Bạn không có quyền thực hiện hành động này!');
                    break;
                case 404:
                    window.location.href = '/404';
                    break;
                case 500:
                    toast.error(
                        'Lỗi hệ thống từ phía Server, vui lòng thử lại sau!'
                    );
                    break;
                default:
                    toast.error(errorMessage);
                    break;
            }
        } else {
            toast.error(
                'Không thể kết nối đến máy chủ. Vui lòng kiểm tra Internet!'
            );
        }

        return Promise.reject(error.response?.data || error);
    }
);

export default instance;
