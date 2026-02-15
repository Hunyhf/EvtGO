import axios from './axiosClient';

export const callUploadEventImages = (eventId, files, coverIndex = 0) => {
    const formData = new FormData();
    // 'files' là mảng các file từ input type="file"
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }
    if (coverIndex !== null) formData.append('coverIndex', coverIndex);

    return axios.post(`/api/v1/events/${eventId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const callUpdateEventImage = (eventId, imageId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.put(`/api/v1/events/${eventId}/images/${imageId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const callDeleteEventImage = (eventId, imageId) => {
    return axios.delete(`/api/v1/events/${eventId}/images/${imageId}`);
};
