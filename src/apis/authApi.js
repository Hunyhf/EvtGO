import axios from './axiosClient';

// Đăng ký tài khoản mới dựa trên AuthController.register
export const callRegister = (email, password, name, role_id) => {
    return axios.post('/api/v1/auth/register', {
        email,
        password,
        name,
        role: { id: role_id },
        age: null,
        gender: null,
        address: null
    });
};

// Đăng nhập
export const callLogin = (email, password) => {
    return axios.post('/api/v1/auth/login', {
        email,
        password
    });
};

// Đăng xuất
export const callLogout = () => {
    return axios.post('/api/v1/auth/logout');
};

// Lấy thông tin tài khoản hiện tại
export const callFetchAccount = () => {
    return axios.get('/api/v1/auth/account');
};

// Lấy Access Token mới bằng Refresh Token từ Cookie
export const callRefreshToken = () => {
    return axios.get('/api/v1/auth/refresh');
};
