// src/apis/fileApi.js
import axiosClient from './axiosClient';

const fileApi = {
    uploadFile: (file, folder) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        return axiosClient.post('/api/v1/files', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

export default fileApi;
