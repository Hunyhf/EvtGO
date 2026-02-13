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

// CÁC API DÀNH CHO ORGANIZER (QUẢN LÝ SỰ KIỆN)

// Lấy danh sách sự kiện (có hỗ trợ truyền params để phân trang/lọc)
export const callFetchAllEvents = params => {
    return axios.get('/api/v1/events', { params });
};

// Xóa sự kiện theo ID
export const callDeleteEvent = id => {
    return axios.delete(`/api/v1/events/${id}`);
};

// Lấy chi tiết một sự kiện theo ID (Dùng khi vào trang Sửa)
export const callGetEventById = id => {
    return axios.get(`/api/v1/events/${id}`);
};

// Tạo sự kiện mới
export const callCreateEvent = eventData => {
    return axios.post('/api/v1/events', eventData);
};

// Cập nhật sự kiện hiện tại
export const callUpdateEvent = (id, eventData) => {
    return axios.put(`/api/v1/events/${id}`, eventData);
};
