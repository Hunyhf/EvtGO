// src/apis/axiosClient.js
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    withCredentials: true
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

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

instance.interceptors.response.use(
    response => {
        return response.data?.data !== undefined
            ? response.data.data
            : response.data;
    },

    async error => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const url = originalRequest.url; // Lấy URL để kiểm tra điều kiện

        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Đã có lỗi xảy ra';

        // Danh sách các API không cần hiện thông báo lỗi (Silent APIs)
        // Guest truy cập các API này thường xuyên gặp 401/403/400
        const silentPaths = [
            '/api/v1/auth/account',
            '/api/v1/auth/refresh',
            '/api/v1/genres'
        ];
        const isSilent = silentPaths.some(path => url.includes(path));

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

                // Chỉ chuyển hướng nếu không phải là guest đang ở trang chủ
                if (window.location.pathname !== '/' && !isSilent) {
                    window.location.href = '/';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // B. Global Error Handling
        if (status) {
            switch (status) {
                case 400:
                    // Không hiện toast 400 cho API refresh (Guest thường bị lỗi này)
                    if (!url.includes('/api/v1/auth/refresh')) {
                        toast.error(errorMessage);
                    }
                    break;
                case 403:
                    // Không hiện toast 403 cho các API trong danh sách silent
                    if (!isSilent) {
                        toast.error(
                            'Bạn không có quyền thực hiện hành động này!'
                        );
                    }
                    break;
                case 404:
                    if (window.location.pathname !== '/404') {
                        window.location.href = '/404';
                    }
                    break;
                case 500:
                    toast.error(
                        'Lỗi hệ thống từ phía Server, vui lòng thử lại sau!'
                    );
                    break;
                default:
                    if (!isSilent) {
                        toast.error(errorMessage);
                    }
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
