import { createContext, useState, useEffect } from 'react';
import { callFetchAccount } from '@apis/authApi.js';
import { callGetUserById } from '@apis/userApi.js';
import Cookies from 'js-cookie';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({
        email: '',
        name: '',
        age: '',
        address: '',
        gender: ''
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const getStoredAge = (serverAge, userId) => {
        const cookieAge = Cookies.get(`user_age_${userId}`);
        return serverAge && serverAge !== 0 ? serverAge : cookieAge || '';
    };

    const loginContext = async (userData, accessToken) => {
        if (accessToken) {
            Cookies.set('access_token', accessToken, { expires: 1, path: '/' });
        }

        if (userData.age) {
            Cookies.set(`user_age_${userData.id}`, userData.age, {
                expires: 7
            });
        }

        try {
            const detailRes = await callGetUserById(userData.id);
            if (detailRes && detailRes.data) {
                setUser({
                    ...userData,
                    ...detailRes.data,
                    age: getStoredAge(detailRes.data.age, userData.id)
                });
            } else {
                setUser(userData);
            }
        } catch (error) {
            setUser(userData);
        }
        setIsAuthenticated(true);
    };

    const fetchAccount = async () => {
        const token = Cookies.get('access_token');
        if (!token) return setIsLoading(false);

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
        } finally {
            setIsLoading(false);
        }
    };

    const logoutContext = () => {
        setIsAuthenticated(false);
        setUser({ email: '', name: '', age: '', address: '' });
        Cookies.remove('access_token', { path: '/' });
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
