import axios from './axiosClient';

/**
 * Lấy danh sách tất cả danh mục
 */
export const callFetchCategories = () => {
    return axios.get('/api/v1/categories');
};

/**
 * Lấy sự kiện theo danh mục
 * @param {number} categoryId
 */
export const callFetchEventsByCategory = categoryId => {
    return axios.get(`/api/v1/events?filter=category.id:${categoryId}`);
};
