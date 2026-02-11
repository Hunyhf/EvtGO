import axios from './axiosClient';

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

export const callLogin = (email, password) => {
    return axios.post('/api/v1/auth/login', {
        email,
        password
    });
};

export const callLogout = () => {
    return axios.post('/api/v1/auth/logout');
};

export const callFetchAccount = () => {
    return axios.get('/api/v1/auth/account');
};
