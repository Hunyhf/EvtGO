// src/apis/axiosClient.js
import axios from 'axios';
import Cookies from 'js-cookie';
import { message } from 'antd';

// Instance dùng riêng cho refresh token (không gắn interceptor chính)
const authInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    withCredentials: true
});

// Instance chính dùng cho toàn bộ request API
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    withCredentials: true
});

let isRefreshing = false;
let failedQueue = [];

/**
 * Xử lý các request đang chờ khi refresh token hoàn tất
 */
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

/**
 * Interceptor request
 * Tự động gắn access token vào header Authorization nếu tồn tại
 */
instance.interceptors.request.use(
    config => {
        const token = Cookies.get('access_token');

        if (token && token !== 'undefined' && token !== 'null') {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        } else if (config.headers?.Authorization) {
            delete config.headers.Authorization;
        }

        return config;
    },
    error => Promise.reject(error)
);

/**
 * Interceptor response
 * - Chuẩn hóa dữ liệu trả về
 * - Xử lý refresh token khi gặp lỗi 401
 * - Xử lý lỗi toàn cục
 */
instance.interceptors.response.use(
    response => {
        return response.data?.data !== undefined
            ? response.data.data
            : response.data;
    },

    async error => {
        const originalRequest = error.config || {};
        const status = error.response?.status;
        const url = originalRequest?.url || '';

        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Đã có lỗi xảy ra';

        // Các endpoint không hiển thị thông báo lỗi toàn cục
        const silentPaths = [
            '/api/v1/auth/account',
            '/api/v1/auth/refresh',
            '/api/v1/auth/login',
            '/api/v1/genres',
            '/api/v1/events'
        ];

        const isSilent = silentPaths.some(path => url.includes(path));

        // Xử lý lỗi 401 - Tự động refresh access token

        if (
            status === 401 &&
            !url.includes('/api/v1/auth/login') &&
            !url.includes('/api/v1/auth/refresh') &&
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
                // Gọi API refresh token
                const res = await authInstance.get('/api/v1/auth/refresh');

                // Lấy accessToken từ response
                const newAccessToken =
                    res.data?.data?.accessToken || res.data?.accessToken;

                if (newAccessToken) {
                    Cookies.set('access_token', newAccessToken, {
                        expires: 1,
                        path: '/'
                    });

                    processQueue(null, newAccessToken);

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return instance(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                Cookies.remove('access_token', { path: '/' });

                if (window.location.pathname !== '/' && !isSilent) {
                    window.location.replace('/');
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Xử lý lỗi toàn cục

        if (status) {
            if (!isSilent) {
                if (status === 404) {
                    if (window.location.pathname !== '/404') {
                        window.location.replace('/404');
                    }
                } else if (status === 500) {
                    message.error(
                        'Lỗi hệ thống từ phía Server, vui lòng thử lại sau!'
                    );
                } else {
                    message.error(errorMessage);
                }
            }
        } else {
            message.error(
                'Không thể kết nối đến máy chủ. Vui lòng kiểm tra Internet!'
            );
        }

        return Promise.reject(error.response?.data || error);
    }
);

export default instance;
