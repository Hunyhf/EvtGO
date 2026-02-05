import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true // Cho phép gửi cookie (refresh_token)
});

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
        // Nếu lỗi 401 (Unauthorized) và chưa retry lần nào
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Gọi API refresh token
                const res = await instance.get('/api/v1/auth/refresh');
                if (res && res.data) {
                    const newAccessToken = res.data.access_token;
                    localStorage.setItem('access_token', newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return instance(originalRequest); // Gọi lại request cũ
                }
            } catch (refreshError) {
                // Nếu refresh cũng lỗi -> Hết phiên, logout
                localStorage.removeItem('access_token');
                window.location.href = '/';
            }
        }
        return Promise.reject(error.response?.data || error);
    }
);

export default instance;
