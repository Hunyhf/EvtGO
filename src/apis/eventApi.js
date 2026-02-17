// src/apis/eventApi.js
import axios from './axiosClient';

// 1. Định nghĩa các hàm (Private functions)

const create = data => {
    return axios.post('/api/v1/events', data);
};

const update = (id, data) => {
    return axios.put(`/api/v1/events/${id}`, data);
};

const getById = id => {
    return axios.get(`/api/v1/events/${id}`);
};

const remove = id => {
    return axios.delete(`/api/v1/events/${id}`);
};

// Refactor: Dùng params object thay vì queryString string thủ công
// Axios sẽ tự động serialize object này thành ?page=1&size=10...
const getAll = params => {
    return axios.get('/api/v1/events', { params });
};

const toggleActive = id => {
    return axios.patch(`/api/v1/events/${id}/active`);
};

const togglePublished = id => {
    return axios.patch(`/api/v1/events/${id}/published`);
};

// 2. Export gom nhóm (Named Export) để khớp với import { eventApi } bên Genre.jsx
export const eventApi = {
    create, // map với callCreateEvent
    update, // map với callUpdateEvent
    getById, // map với callGetEventById
    remove, // map với callDeleteEvent
    getAll, // map với callFetchAllEvents
    toggleActive, // map với callToggleEventActive
    togglePublished // map với callToggleEventPublished
};
