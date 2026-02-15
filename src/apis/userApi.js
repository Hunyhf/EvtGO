import axios from './axiosClient';

export const callFetchAllUsers = queryString => {
    return axios.get(`/api/v1/users?${queryString}`);
};

export const callGetUserById = id => {
    return axios.get(`/api/v1/users/${id}`);
};

export const callCreateUser = userData => {
    return axios.post('/api/v1/users', userData);
};

export const callUpdateUser = userData => {
    return axios.put('/api/v1/users', userData);
};

export const callDeleteUser = id => {
    return axios.delete(`/api/v1/users/${id}`);
};
