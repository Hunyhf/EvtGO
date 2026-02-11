import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { callFetchAccount } from '@apis/authApi.js';
import { ROLE_REDIRECT_MAP } from '@constants/roles.js';
import Cookies from 'js-cookie';

export const AuthContext = createContext({});

// Helper để lấy role_id đồng nhất từ nhiều nguồn dữ liệu khác nhau
const getRoleId = userData => {
    return userData?.role?.id || userData?.role_id || userData?.roleId || null;
};

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        id: '',
        email: '',
        name: '',
        age: '',
        address: '',
        gender: '',
        role_id: null
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const redirectByRole = useCallback(
        roleId => {
            const path = ROLE_REDIRECT_MAP[roleId] || '/';
            navigate(path, { replace: true });
        },
        [navigate]
    );

    // 1. LOGIN CONTEXT: Dùng khi đăng nhập mới, có kèm Redirect
    const loginContext = async (userData, accessToken) => {
        if (accessToken) {
            Cookies.set('access_token', accessToken, { expires: 1, path: '/' });
        }

        const roleId = getRoleId(userData);
        const mappedUser = {
            ...userData,
            role_id: roleId
        };

        setUser(mappedUser);
        setIsAuthenticated(true);

        // Chỉ Redirect khi thực hiện Login
        redirectByRole(roleId);
    };

    // 2. UPDATE USER CONTEXT: TƯ DUY SENIOR - Cập nhật thông tin User mà không Redirect
    // Dùng cái này trong trang Profile sau khi call API update thành công
    const updateUserContext = updatedData => {
        setUser(prev => {
            const newRoleId = getRoleId(updatedData) || prev.role_id;
            return {
                ...prev,
                ...updatedData,
                role_id: newRoleId // Đảm bảo role_id không bị mất nếu API update không trả về role
            };
        });
    };

    // 3. FETCH ACCOUNT: Lấy lại thông tin khi F5 trang
    const fetchAccount = async () => {
        const token = Cookies.get('access_token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await callFetchAccount();
            if (res && res.user) {
                const serverUser = res.user;
                setUser({
                    ...serverUser,
                    role_id: getRoleId(serverUser),
                    age: serverUser.age || '',
                    address: serverUser.address || '',
                    gender: serverUser.gender || ''
                });
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Lỗi khi fetch account:', error);
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
                updateUserContext, // Export hàm mới ra để Profile.jsx có thể dùng
                isLoading
            }}
        >
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
