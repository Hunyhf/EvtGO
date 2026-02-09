import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8080',
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

instance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

instance.interceptors.response.use(
    response => response.data,
    async error => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và không phải là yêu cầu Login/Refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Nếu đang gọi refresh rồi, các request khác đứng đợi vào hàng chờ (Queue)
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
                const res = await axios.get(
                    'http://localhost:8080/api/v1/auth/refresh',
                    {
                        withCredentials: true
                    }
                );

                const newAccessToken = res.data?.data?.accessToken;

                if (newAccessToken) {
                    localStorage.setItem('access_token', newAccessToken);
                    instance.defaults.headers.common['Authorization'] =
                        `Bearer ${newAccessToken}`;

                    // Giải phóng hàng chờ
                    processQueue(null, newAccessToken);

                    // Gửi lại request ban đầu
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return instance(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('access_token');

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
