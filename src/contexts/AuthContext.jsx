import { createContext, useState, useEffect } from 'react';
import { callFetchAccount } from '@apis/authApi.js';
import { callGetUserById } from '@apis/userApi.js'; // Import hàm mới
import Cookies from 'js-cookie';

export const AuthContext = createContext({
    isAuthenticated: false,
    user: {
        email: '',
        name: '',
        age: '',
        address: '',
        gender: ''
    },
    loginContext: () => {},
    logoutContext: () => {}
});

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

    // Cải tiến loginContext để lấy đủ data ngay khi vừa đăng nhập xong
    const loginContext = async (userData, accessToken) => {
        if (accessToken) {
            Cookies.set('access_token', accessToken, { expires: 1, path: '/' });
        }

        try {
            // Sau khi login thành công, lấy thêm chi tiết để có age/address
            const detailRes = await callGetUserById(userData.id);
            if (detailRes && detailRes.data) {
                setUser({ ...userData, ...detailRes.data });
            } else {
                setUser(userData);
            }
        } catch (error) {
            // Nếu lỗi lấy chi tiết (ví dụ 403), vẫn giữ data cơ bản
            setUser(userData);
        }
        setIsAuthenticated(true);
    };

    const logoutContext = () => {
        setIsAuthenticated(false);
        setUser({ email: '', name: '', age: '', address: '' });
        Cookies.remove('access_token', { path: '/' });
    };

    const fetchAccount = async () => {
        const token = Cookies.get('access_token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await callFetchAccount();
            if (res && res.data && res.data.user) {
                const basicUser = res.data.user; // Chỉ có id, email, name

                // Thực hiện "Double Fetch" để lấy thêm age và address
                try {
                    const detailRes = await callGetUserById(basicUser.id);
                    if (detailRes && detailRes.data) {
                        setIsAuthenticated(true);
                        // Merge (gộp) thông tin cơ bản và thông tin chi tiết
                        setUser({ ...basicUser, ...detailRes.data });
                    }
                } catch (detailError) {
                    console.error(
                        'Không thể lấy thông tin chi tiết:',
                        detailError
                    );
                    setIsAuthenticated(true);
                    setUser(basicUser);
                }
            }
        } catch (error) {
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
