import axios from './axiosClient';

// Cập nhật prefix này cho khớp với ApiPaths.EVENT_STAFFS_API trong Java nếu có khác biệt
const PREFIX = '/api/v1/event-staffs';

export const callAddStaffToEvent = data => {
    return axios.post(`${PREFIX}`, data);
};

export const callRemoveStaffFromEvent = id => {
    return axios.delete(`${PREFIX}/${id}`);
};

export const callGetStaffsByEventId = eventId => {
    return axios.get(`${PREFIX}/event/${eventId}`);
};
