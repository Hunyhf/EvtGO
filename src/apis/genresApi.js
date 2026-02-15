import axios from './axiosClient';

export const callFetchAllGenres = queryString => {
    return axios.get(`/api/v1/genres?${queryString}`);
};

export const callGetGenreById = id => {
    return axios.get(`/api/v1/genres/${id}`);
};

export const callCreateGenre = genreData => {
    return axios.post('/api/v1/genres', genreData);
};

export const callUpdateGenre = genreData => {
    return axios.put('/api/v1/genres', genreData);
};

export const callDeleteGenre = id => {
    return axios.delete(`/api/v1/genres/${id}`);
};
