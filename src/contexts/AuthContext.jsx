// src/contexts/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { callFetchAccount } from '@apis/authApi.js';
import { ROLE_REDIRECT_MAP, ROLE_ID } from '@constants/roles.js';
import Cookies from 'js-cookie';

/**
 * Global Authentication Context
 * Quản lý trạng thái đăng nhập, thông tin user và điều hướng theo role.
 */
export const AuthContext = createContext({});

/**
 * Chuẩn hóa dữ liệu trả về từ API (hỗ trợ nhiều cấu trúc response khác nhau)
 */
const extractUserData = data => {
    if (!data) return null;
    return data.result || data.data || data.user || data;
};

/**
 * Lấy role_id từ nhiều cấu trúc dữ liệu user khác nhau
 */
const getRoleId = userData => {
    if (!userData) return null;
    if (userData?.role?.id) return userData.role.id;
    if (Array.isArray(userData?.roles) && userData.roles.length > 0)
        return userData.roles[0].id;
    return userData?.role_id || userData?.roleId || null;
};

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    /**
     * State lưu thông tin người dùng hiện tại
     */
    const [user, setUser] = useState({
        id: '',
        email: '',
        name: '',
        age: '',
        address: '',
        gender: '',
        avatar: '',
        role_id: null
    });

    /**
     * Trạng thái xác thực và loading hệ thống
     */
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Điều hướng người dùng dựa theo role
     */
    const redirectByRole = useCallback(
        (roleId, isReplace = true) => {
            const path = ROLE_REDIRECT_MAP[roleId] || '/';
            navigate(path, { replace: isReplace });
        },
        [navigate]
    );

    /**
     * Lưu thông tin bổ sung của user vào cookies
     * (phục vụ reload trang hoặc fallback khi API chưa trả đủ dữ liệu)
     */
    const saveExtraInfoToCookies = userData => {
        const expires = 1;

        if (userData?.age !== undefined && userData?.age !== null) {
            Cookies.set('u_age', userData.age, { expires });
        }

        if (userData?.address) {
            Cookies.set('u_address', userData.address, { expires });
        }

        if (userData?.gender) {
            Cookies.set('u_gender', userData.gender, { expires });
        }

        if (userData?.avatar) {
            Cookies.set('u_avatar', userData.avatar, { expires });
        }
    };

    /**
     * Xử lý đăng nhập:
     * - Lưu access_token
     * - Lưu role backup
     * - Cập nhật context
     * - Điều hướng theo role
     */
    const loginContext = async (userData, accessToken) => {
        const actualUser = extractUserData(userData);

        if (accessToken) {
            Cookies.set('access_token', accessToken, {
                expires: 1,
                path: '/'
            });
        }

        const roleId = getRoleId(actualUser);

        if (roleId) {
            Cookies.set('backup_role_id', roleId, {
                expires: 1,
                path: '/'
            });
        }

        saveExtraInfoToCookies(actualUser);

        setUser({ ...actualUser, role_id: roleId });
        setIsAuthenticated(true);

        redirectByRole(roleId);
    };

    /**
     * Cập nhật thông tin user trong context
     * (dùng khi chỉnh sửa profile)
     */
    const updateUserContext = updatedData => {
        const actualUser = extractUserData(updatedData);

        setUser(prev => {
            const newRoleId = getRoleId(actualUser) || prev.role_id;
            const newUser = { ...prev, ...actualUser, role_id: newRoleId };

            saveExtraInfoToCookies(newUser);

            return newUser;
        });
    };

    /**
     * Lấy thông tin tài khoản từ server khi reload trang
     * - Kiểm tra token
     * - Đồng bộ dữ liệu server và cookie
     * - Điều hướng nếu cần
     */
    const fetchAccount = async () => {
        const token = Cookies.get('access_token');

        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await callFetchAccount();
            const serverUser = extractUserData(res);

            if (serverUser) {
                const roleId =
                    getRoleId(serverUser) || Cookies.get('backup_role_id');

                setUser({
                    ...serverUser,
                    role_id: roleId,
                    age: serverUser.age ?? Cookies.get('u_age') ?? '',
                    address:
                        serverUser.address || Cookies.get('u_address') || '',
                    gender:
                        serverUser.gender || Cookies.get('u_gender') || 'MALE',
                    avatar: serverUser.avatar || Cookies.get('u_avatar') || ''
                });

                setIsAuthenticated(true);

                if (
                    window.location.pathname === '/' &&
                    roleId !== ROLE_ID.CUSTOMER
                ) {
                    const targetPath = ROLE_REDIRECT_MAP[roleId];

                    if (targetPath && targetPath !== '/') {
                        navigate(targetPath, { replace: true });
                        return;
                    }
                }
            }
        } catch (error) {
            console.error('>>> [LỖI] fetchAccount:', error);

            if (error.status === 401 || error.status === 403) {
                logoutContext();
            }
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Đăng xuất:
     * - Reset state
     * - Xóa toàn bộ cookie liên quan
     * - Điều hướng về trang chủ
     */
    const logoutContext = () => {
        setIsAuthenticated(false);

        setUser({
            id: '',
            email: '',
            name: '',
            age: '',
            address: '',
            gender: '',
            avatar: '',
            role_id: null
        });

        Cookies.remove('access_token', { path: '/' });
        Cookies.remove('backup_role_id', { path: '/' });
        Cookies.remove('u_age');
        Cookies.remove('u_address');
        Cookies.remove('u_gender');
        Cookies.remove('u_avatar');

        navigate('/');
    };

    /**
     * Tự động kiểm tra đăng nhập khi ứng dụng khởi động
     */
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
                updateUserContext,
                isLoading
            }}
        >
            {!isLoading ? (
                children
            ) : (
                <div
                    className='loading-screen'
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh'
                    }}
                >
                    Đang tải thông tin hệ thống...
                </div>
            )}
        </AuthContext.Provider>
    );
};
