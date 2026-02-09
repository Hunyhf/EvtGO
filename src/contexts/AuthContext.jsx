import { createContext, useState, useEffect } from 'react';
import { callFetchAccount } from '@apis/authApi.js';
import Cookies from 'js-cookie';

export const AuthContext = createContext({
    isAuthenticated: false,
    user: {
        email: '',
        name: ''
    },
    loginContext: () => {},
    logoutContext: () => {}
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({
        email: '',
        name: ''
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    //  Nhận thêm accessToken để lưu vào Cookie ngay tại
    const loginContext = (userData, accessToken) => {
        setIsAuthenticated(true);
        setUser(userData);
        if (accessToken) {
            // Lưu access_token vào cookie, hết hạn sau 1 ngày (86400s theo config backend)
            Cookies.set('access_token', accessToken, { expires: 1, path: '/' });
        }
    };

    const logoutContext = () => {
        setIsAuthenticated(false);
        setUser({ email: '', name: '' });
        // THAY ĐỔI: Xóa token trong Cookie thay vì localStorage
        Cookies.remove('access_token', { path: '/' });
    };

    const fetchAccount = async () => {
        // THAY ĐỔI: Kiểm tra token từ Cookie
        const token = Cookies.get('access_token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await callFetchAccount();
            // Backend trả về data.user trong ResLoginDTO.UserGetAccount
            if (res && res.data) {
                // Chỉ cập nhật user profile, không cần set lại token vì đã có sẵn
                setIsAuthenticated(true);
                setUser(res.data.user);
            }
        } catch (error) {
            // Token hết hạn hoặc không hợp lệ -> dọn dẹp cookie và state
            logoutContext();
        } finally {
            setIsLoading(false);
        }
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
