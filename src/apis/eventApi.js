import axios from './axiosClient';

// Lấy sự kiện xu hướng - Hiện tại sort theo ngày tạo mới nhất làm placeholder
export const callFetchTrendingEvents = (size = 4) => {
    return axios.get('/api/v1/events', {
        params: {
            page: 1,
            size: size,
            sort: 'createdAt,desc' // Sau này BE thêm viewCount thì đổi thành 'viewCount,desc'
        }
    });
};

// Lấy sự kiện ưu đãi - Hiện tại lấy các sự kiện đã công khai
export const callFetchDiscountEvents = (size = 8) => {
    return axios.get('/api/v1/events', {
        params: {
            page: 1,
            size: size,
            filter: 'isPublished:true' // Placeholder logic cho ưu đãi
        }
    });
};
