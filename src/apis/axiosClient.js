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
        if (token && token !== 'undefined' && token !== 'null') {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
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
        const url = originalRequest.url;

        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Đã có lỗi xảy ra';

        // 1. Cập nhật danh sách Silent Paths
        const silentPaths = [
            '/api/v1/auth/account',
            '/api/v1/auth/refresh',
            '/api/v1/auth/login', // Thêm login vào đây để không hiện toast khi sai pass
            '/api/v1/genres'
        ];
        const isSilent = silentPaths.some(path => url.includes(path));

        // 2. Xử lý lỗi 401 - Refresh Token
        // Chỉ chạy refresh token nếu KHÔNG phải API login
        if (
            status === 401 &&
            !url.includes('/api/v1/auth/login') &&
            !originalRequest._retry
        ) {
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
                if (window.location.pathname !== '/' && !isSilent) {
                    window.location.href = '/';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // 3. Global Error Handling (Dựa trên biến isSilent)
        if (status) {
            switch (status) {
                case 400:
                case 401:
                case 403:
                    // Nếu thuộc silentPaths (như login), sẽ không hiện toast
                    if (!isSilent) {
                        toast.error(errorMessage);
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
