import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { callFetchAccount } from '@apis/authApi.js';
import { callGetUserById } from '@apis/userApi.js';
import { ROLE_REDIRECT_MAP } from '@constants/roles.js';
import Cookies from 'js-cookie';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        email: '',
        name: '',
        age: '',
        address: '',
        gender: '',
        role_id: null
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const getStoredAge = (serverAge, userId) => {
        if (serverAge && serverAge !== 0) return serverAge;
        return Cookies.get(`user_age_${userId}`) || '';
    };

    // Hàm điều hướng dựa trên Role ID
    const redirectByRole = useCallback(
        roleId => {
            const path = ROLE_REDIRECT_MAP[roleId] || '/';
            navigate(path, { replace: true });
        },
        [navigate]
    );

    const loginContext = async (userData, accessToken) => {
        // 1. Lưu Token vào Cookie
        if (accessToken) {
            Cookies.set('access_token', accessToken, { expires: 1, path: '/' });
        }

        let finalUser = { ...userData };

        // 2. Lấy thêm thông tin chi tiết nếu cần
        try {
            const detailRes = await callGetUserById(userData.id);
            if (detailRes?.data) {
                finalUser = {
                    ...userData,
                    ...detailRes.data,
                    age: getStoredAge(detailRes.data.age, userData.id)
                };
            }
        } catch (error) {
            console.error('Lỗi lấy chi tiết user:', error);
        }

        // 3. Cập nhật State và Điều hướng
        setUser(finalUser);
        setIsAuthenticated(true);

        // Thực hiện vào trang theo Role ID (1->Admin, 2->Customer...)
        redirectByRole(finalUser.role_id);
    };

    const fetchAccount = async () => {
        const token = Cookies.get('access_token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await callFetchAccount();
            if (res?.data?.user) {
                const basicUser = res.data.user;
                const detailRes = await callGetUserById(basicUser.id);
                const detailData = detailRes?.data || {};

                setUser({
                    ...basicUser,
                    ...detailData,
                    age: getStoredAge(detailData.age, basicUser.id)
                });
                setIsAuthenticated(true);
            }
        } catch (error) {
            setIsAuthenticated(false);
            Cookies.remove('access_token', { path: '/' }); // Token lỗi thì xóa luôn
        } finally {
            setIsLoading(false);
        }
    };

    const logoutContext = () => {
        setIsAuthenticated(false);
        setUser({ email: '', name: '', age: '', address: '', role_id: null });
        Cookies.remove('access_token', { path: '/' });
        navigate('/login');
    };

    useEffect(() => {
        fetchAccount();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                loginContext,
                logoutContext,
                isLoading
            }}
        >
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
