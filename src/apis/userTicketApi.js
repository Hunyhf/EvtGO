import axiosClient from './axiosClient';

const userTicketApi = {
    // Tạo mới vé cho người dùng
    createUserTicket: data => {
        return axiosClient.post('/api/v1/user-tickets', data);
    },

    // Cập nhật vé người dùng theo ID
    updateUserTicket: (id, data) => {
        return axiosClient.put(`/api/v1/user-tickets/${id}`, data);
    },

    // Lấy thông tin vé người dùng theo ID
    getUserTicketById: id => {
        return axiosClient.get(`/api/v1/user-tickets/${id}`);
    },

    // Lấy tất cả vé của người dùng (Có hỗ trợ phân trang và filter động từ cấu trúc Spring Filter)
    getAllUserTickets: params => {
        return axiosClient.get('/api/v1/user-tickets', { params });
    },

    // Lấy danh sách vé theo ID người dùng cụ thể
    getUserTicketsByUserId: userId => {
        return axiosClient.get(`/api/v1/user-tickets/user/${userId}`);
    }
};

export default userTicketApi;
