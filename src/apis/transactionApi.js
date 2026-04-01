import axiosClient from './axiosClient';

const transactionApi = {
    // Tạo mới giao dịch
    createTransaction: data => {
        return axiosClient.post('/api/v1/transactions', data);
    },

    // Cập nhật giao dịch theo ID
    updateTransaction: (id, data) => {
        return axiosClient.put(`/api/v1/transactions/${id}`, data);
    },

    // Lấy thông tin giao dịch theo ID
    getTransactionById: id => {
        return axiosClient.get(`/api/v1/transactions/${id}`);
    },

    // Lấy danh sách tất cả giao dịch
    getAllTransactions: () => {
        return axiosClient.get('/api/v1/transactions');
    }
};

export default transactionApi;
