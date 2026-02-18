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

const getAll = params => {
    return axios.get('/api/v1/events', { params });
};

const toggleActive = id => {
    return axios.patch(`/api/v1/events/${id}/active`);
};

const togglePublished = id => {
    // BE hiện có endpoint này để đảo trạng thái is_published
    return axios.patch(`/api/v1/events/${id}/published`);
};

const approve = id => {
    /** * Sửa lỗi 404: Vì BE không có /approve, ta dùng /published.
     * Logic: Khi Admin bấm Duyệt, isPublished sẽ chuyển từ false -> true.
     */
    return togglePublished(id);
};

const reject = id => {
    /**
     * Vì BE không có /reject và không lưu reason,
     * ta sử dụng hàm remove (Xóa) để từ chối sự kiện này.
     */
    return remove(id);
};

// 2. Export gom nhóm
export const eventApi = {
    create,
    update,
    getById,
    remove,
    getAll,
    toggleActive,
    togglePublished,
    approve, // Đã map vào togglePublished
    reject // Đã map vào remove
};
