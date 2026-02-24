import axios from './axiosClient';

const create = data => {
    return axios.post('/api/v1/tickets', data);
};

const update = (id, data) => {
    return axios.put(`/api/v1/tickets/${id}`, data);
};

const getById = id => {
    return axios.get(`/api/v1/tickets/${id}`);
};

const remove = id => {
    return axios.delete(`/api/v1/tickets/${id}`);
};

const getAll = params => {
    return axios.get('/api/v1/tickets', { params });
};

export const ticketApi = {
    create,
    update,
    getById,
    remove,
    getAll
};
