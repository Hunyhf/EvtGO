// src/apis/orderApi.js
import axiosClient from './axiosClient';

const orderApi = {
    // Tạo đơn hàng mới
    createOrder: data => {
        return axiosClient.post('/api/v1/orders', data);
    },

    // Thanh toán đơn hàng
    payOrder: data => {
        return axiosClient.post('/api/v1/orders/pay', data);
    },

    // Xem chi tiết đơn hàng
    getOrderById: id => {
        return axiosClient.get(`/api/v1/orders/${id}`);
    },

    // Danh sách đơn hàng (hỗ trợ filter và phân trang)
    getAllOrders: query => {
        return axiosClient.get(`/api/v1/orders?${query}`);
    },

    // Xem vé đã mua của tôi
    getMyTickets: () => {
        return axiosClient.get('/api/v1/orders/my-tickets');
    },

    // Xác thực QR code (dành cho nhân viên check-in)
    verifyQrCode: qrCode => {
        return axiosClient.post(`/api/v1/orders/verify-qr?qrCode=${qrCode}`);
    }
};

export default orderApi;
