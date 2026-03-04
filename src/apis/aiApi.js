import axiosClient from './axiosClient';

export const aiApi = {
    chat: data => {
        return axiosClient.post('/api/v1/ai/chat', data);
    },
    chatWithImage: (message, sessionId, imageFile) => {
        const formData = new FormData();
        formData.append('message', message);
        if (sessionId) formData.append('sessionId', sessionId);
        formData.append('image', imageFile);
        return axiosClient.post('/api/v1/ai/chat-with-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};
