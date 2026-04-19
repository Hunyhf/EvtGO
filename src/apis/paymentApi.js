import axiosClient from './axiosClient';

const paymentApi = {
    createMoMoPayment: (data) => {
        const url = '/api/v1/payment/create';
        return axiosClient.post(url, data);
    }
};

export default paymentApi;