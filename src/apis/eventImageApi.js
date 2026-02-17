// src/apis/eventImageApi.js
import axios from './axiosClient';

// 1. Định nghĩa các hàm (Private functions)

// Refactor: Nhận payload là FormData trực tiếp để linh hoạt hơn
// (Khớp với logic bên CreateEvent.jsx đang truyền vào)
const uploadEventImages = (eventId, formData) => {
    return axios.post(`/api/v1/events/${eventId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

const updateEventImage = (eventId, imageId, file) => {
    // Nếu component chưa build FormData thì build ở đây
    const formData = new FormData();
    formData.append('file', file);

    return axios.put(`/api/v1/events/${eventId}/images/${imageId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

const deleteEventImage = (eventId, imageId) => {
    return axios.delete(`/api/v1/events/${eventId}/images/${imageId}`);
};

// 2. Export gom nhóm (Named Export Object)
export const eventImageApi = {
    uploadEventImages, // map với callUploadEventImages cũ
    updateEventImage, // map với callUpdateEventImage cũ
    deleteEventImage // map với callDeleteEventImage cũ
};
