import axios from './axiosClient';

// ROLES
export const callFetchAllRoles = queryString => {
    return axios.get(`/api/v1/roles?${queryString}`);
};

export const callGetRoleById = id => {
    return axios.get(`/api/v1/roles/${id}`);
};

export const callCreateRole = roleData => {
    return axios.post('/api/v1/roles', roleData);
};

export const callUpdateRole = roleData => {
    return axios.put('/api/v1/roles', roleData);
};

export const callDeleteRole = id => {
    return axios.delete(`/api/v1/roles/${id}`);
};

// PERMISSIONS
export const callFetchAllPermissions = queryString => {
    return axios.get(`/api/v1/permissions?${queryString}`);
};

export const callCreatePermission = permissionData => {
    return axios.post('/api/v1/permissions', permissionData);
};

export const callUpdatePermission = permissionData => {
    return axios.put('/api/v1/permissions', permissionData);
};

export const callDeletePermission = id => {
    return axios.delete(`/api/v1/permissions/${id}`);
};
