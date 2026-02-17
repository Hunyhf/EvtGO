import axios from './axiosClient';

export const callCreateEvent = data => {
    return axios.post('/api/v1/events', data);
};

export const callUpdateEvent = (id, eventData) => {
    return axios.put(`/api/v1/events/${id}`, eventData);
};

export const callGetEventById = id => {
    return axios.get(`/api/v1/events/${id}`);
};

export const callDeleteEvent = id => {
    return axios.delete(`/api/v1/events/${id}`);
};

// Sử dụng query string để filter và phân trang (ví dụ: ?page=1&size=10&filter=name~'Sơn Tùng')
export const callFetchAllEvents = queryString => {
    return axios.get(`/api/v1/events?${queryString}`);
};

export const callToggleEventActive = id => {
    return axios.patch(`/api/v1/events/${id}/active`);
};

export const callToggleEventPublished = id => {
    return axios.patch(`/api/v1/events/${id}/published`);
};
