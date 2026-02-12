import axiosClient from './axiosClient';

const categoryApi = {
    // Lấy tất cả danh mục (genres)
    getAll: params => {
        const url = '/genres';
        return axiosClient.get(url, { params });
    },

    // Lấy chi tiết một danh mục (nếu cần)
    getById: id => {
        const url = `/genres/${id}`;
        return axiosClient.get(url);
    }
};

export default categoryApi;
