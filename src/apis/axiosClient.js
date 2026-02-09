import axios from 'axios';
import Cookies from 'js-cookie';

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

//Request Interceptor: Đọc token từ Cookie
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

// 2. Response Interceptor: Xử lý Refresh Token
instance.interceptors.response.use(
    response => response.data,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
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
                // THAY ĐỔI: Gọi endpoint refresh bằng chính instance để dùng baseURL
                const res = await instance.get('/api/v1/auth/refresh');

                const newAccessToken = res.data?.accessToken;

                if (newAccessToken) {
                    // THAY ĐỔI: Lưu token mới vào Cookie
                    Cookies.set('access_token', newAccessToken, { expires: 1 });

                    processQueue(null, newAccessToken);

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return instance(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);

                // THAY ĐỔI: Xóa token ở Cookie khi lỗi
                Cookies.remove('access_token');

                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error.response?.data || error);
    }
);

export default instance;
