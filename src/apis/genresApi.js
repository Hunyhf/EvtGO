/* src/apis/genresApi.js */
import axios from './axiosClient';

// Lấy danh sách thể loại (có thể truyền query params)
const getAll = params => {
    return axios.get('/api/v1/genres', { params });
};

// Lấy chi tiết 1 thể loại theo id
const getById = id => {
    return axios.get(`/api/v1/genres/${id}`);
};

// Tạo mới thể loại
const create = data => {
    return axios.post('/api/v1/genres', data);
};

// Cập nhật thể loại
const update = data => {
    return axios.put('/api/v1/genres', data);
};

// Xóa thể loại theo id
const remove = id => {
    return axios.delete(`/api/v1/genres/${id}`);
};

// Gom nhóm API liên quan đến thể loại
export const genresApi = {
    getAll,
    getById,
    create,
    update,
    remove
};
