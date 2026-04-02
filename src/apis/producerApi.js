// src/apis/producerApi.js
import axiosClient from './axiosClient';

const producerApi = {
    // Lấy thông tin Producer của tài khoản đang đăng nhập
    getProducerByAccount: () => {
        return axiosClient.get('/api/v1/producers/account');
    },

    // Tạo mới nhà sản xuất
    createProducer: data => {
        return axiosClient.post('/api/v1/producers', data);
    },

    // Cập nhật nhà sản xuất theo ID
    updateProducer: (id, data) => {
        return axiosClient.put(`/api/v1/producers/${id}`, data);
    },

    // Xóa nhà sản xuất theo ID
    deleteProducer: id => {
        return axiosClient.delete(`/api/v1/producers/${id}`);
    },

    // Lấy thông tin nhà sản xuất theo ID
    getProducerById: id => {
        return axiosClient.get(`/api/v1/producers/${id}`);
    },

    // Lấy danh sách tất cả nhà sản xuất
    getAllProducers: () => {
        return axiosClient.get('/api/v1/producers');
    }
};

export default producerApi;
