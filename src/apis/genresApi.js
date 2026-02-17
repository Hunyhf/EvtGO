/* src/apis/genresApi.js */
import axios from './axiosClient';

// 1. Định nghĩa các hàm private hoặc export lẻ nếu cần tái sử dụng chỗ khác
// Note: Tôi đổi tên tham số thành 'params' để linh hoạt hơn (string hoặc object đều xử lý được ở axios config)

const getAll = params => {
    // Refactor: Dùng params của axios config thay vì nối chuỗi thủ công để tránh lỗi encode
    return axios.get('/api/v1/genres', { params });
};

const getById = id => {
    return axios.get(`/api/v1/genres/${id}`);
};

const create = data => {
    return axios.post('/api/v1/genres', data);
};

const update = data => {
    return axios.put('/api/v1/genres', data);
};

const remove = id => {
    return axios.delete(`/api/v1/genres/${id}`);
};

// 2. Export gom nhóm (Named Export) đúng theo yêu cầu của Nav.jsx
// Nav.jsx đang gọi: genresApi.getAll() -> nên key ở đây phải là getAll
export const genresApi = {
    getAll, // Map với callFetchAllGenres cũ
    getById, // Map với callGetGenreById cũ
    create, // Map với callCreateGenre cũ
    update, // Map với callUpdateGenre cũ
    remove // Map với callDeleteGenre cũ
};
