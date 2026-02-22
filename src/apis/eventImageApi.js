import axios from './axiosClient';

// Upload nhiều ảnh cho 1 event
const uploadEventImages = (eventId, formData) => {
    return axios.post(`/api/v1/events/${eventId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// Cập nhật 1 ảnh cụ thể của event
const updateEventImage = (eventId, imageId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    return axios.put(`/api/v1/events/${eventId}/images/${imageId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// Xóa 1 ảnh khỏi event
const deleteEventImage = (eventId, imageId) => {
    return axios.delete(`/api/v1/events/${eventId}/images/${imageId}`);
};

// Gom nhóm các API liên quan đến ảnh event
export const eventImageApi = {
    uploadEventImages,
    updateEventImage,
    deleteEventImage
};
