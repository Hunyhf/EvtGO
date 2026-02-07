import axios from './axiosClient';

export const callUpdateUser = userData => {
    return axios.put('/api/v1/users', userData);
};
