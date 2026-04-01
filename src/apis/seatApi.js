import axiosClient from './axiosClient';

// Khai báo các endpoint tương ứng với SeatController
const seatApi = {
    // Tạo mới ghế
    createSeat: data => {
        return axiosClient.post('/api/v1/seats', data);
    },

    // Cập nhật ghế theo ID
    updateSeat: (id, data) => {
        return axiosClient.put(`/api/v1/seats/${id}`, data);
    },

    // Xóa ghế theo ID
    deleteSeat: id => {
        return axiosClient.delete(`/api/v1/seats/${id}`);
    },

    // Lấy thông tin ghế theo ID
    getSeatById: id => {
        return axiosClient.get(`/api/v1/seats/${id}`);
    },

    // Lấy danh sách ghế theo ID của sự kiện
    getSeatsByEventId: eventId => {
        return axiosClient.get(`/api/v1/seats/event/${eventId}`);
    }
};

export default seatApi;
ss;
