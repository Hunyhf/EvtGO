import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { callFetchAccount } from '@apis/authApi.js';
import { ROLE_REDIRECT_MAP } from '@constants/roles.js';
import Cookies from 'js-cookie';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        id: '',
        email: '',
        name: '',
        age: '',
        address: '',
        gender: '',
        role_id: null // Chúng ta sẽ map từ role.id của Backend vào đây
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Hàm điều hướng dựa trên Role ID
    const redirectByRole = useCallback(
        roleId => {
            const path = ROLE_REDIRECT_MAP[roleId] || '/';
            navigate(path, { replace: true });
        },
        [navigate]
    );

    // 1. LOGIN CONTEXT: Dùng dữ liệu từ API Login trả về, không gọi thêm API detail nữa
    const loginContext = async (userData, accessToken) => {
        // Lưu Token vào Cookie
        if (accessToken) {
            Cookies.set('access_token', accessToken, { expires: 1, path: '/' });
        }

        // TƯ DUY SENIOR: API Login của bạn (ResLoginDTO) đã trả về đầy đủ {user, access_token}.
        // Trong đó user đã có sẵn role. Chúng ta chỉ cần map lại cho đúng state.
        const mappedUser = {
            ...userData,
            role_id: userData.role?.id || userData.role_id // Lấy id từ object role
        };

        setUser(mappedUser);
        setIsAuthenticated(true);

        // Điều hướng ngay lập tức dựa trên role vừa đăng nhập
        redirectByRole(mappedUser.role_id);
    };

    // 2. FETCH ACCOUNT (CÁCH A): Lấy thông tin từ token khi F5 trang
    const fetchAccount = async () => {
        const token = Cookies.get('access_token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            // TƯ DUY SENIOR: Gọi đúng endpoint /api/v1/auth/account
            const res = await callFetchAccount();

            // res lúc này chính là object userGetAccount (do interceptor bóc data.data)
            if (res && res.user) {
                const serverUser = res.user;

                // Map dữ liệu từ Backend vào State của FE
                setUser({
                    id: serverUser.id,
                    email: serverUser.email,
                    name: serverUser.name,
                    role_id: serverUser.role?.id || null, // Backend cần trả về role ở đây
                    // Các trường khác nếu backend chưa có thì để mặc định
                    age: serverUser.age || '',
                    address: serverUser.address || '',
                    gender: serverUser.gender || ''
                });
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Lỗi khi fetch account (Way A):', error);
            setIsAuthenticated(false);
            setUser({ email: '', name: '', role_id: null });
            Cookies.remove('access_token', { path: '/' });
        } finally {
            setIsLoading(false);
        }
    };

    const logoutContext = () => {
        setIsAuthenticated(false);
        setUser({ email: '', name: '', role_id: null });
        Cookies.remove('access_token', { path: '/' });
        // Chuyển về trang chủ cho Guest thay vì bắt vào /login (tùy UX bạn muốn)
        navigate('/');
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
            {/* TƯ DUY SENIOR: Không render app khi đang check token để tránh nháy trang */}
            {!isLoading ? (
                children
            ) : (
                <div className='loading-screen'>
                    Đang kiểm tra quyền truy cập...
                </div>
            )}
        </AuthContext.Provider>
    );
};
