import axiosClient from './axiosClient';

const categoryApi = {
    // Lấy tất cả danh mục (genres)
    getAll: params => {
        // SỬA TẠI ĐÂY: Thêm /api/v1 vào trước /genres
        const url = '/api/v1/genres';
        return axiosClient.get(url, { params });
    },

    // Lấy chi tiết một danh mục
    getById: id => {
        const url = `/api/v1/genres/${id}`;
        return axiosClient.get(url);
    }
};

export default categoryApi;
