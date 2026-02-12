import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { callFetchAccount } from '@apis/authApi.js';
import { ROLE_REDIRECT_MAP } from '@constants/roles.js';
import Cookies from 'js-cookie';

export const AuthContext = createContext({});

const getRoleId = userData => {
    if (!userData) return null;
    // 1. Kiểm tra object role lồng nhau: { role: { id: 3 } }
    if (userData?.role?.id) return userData.role.id;
    // 2. Kiểm tra mảng roles: { roles: [{ id: 3 }] }
    if (Array.isArray(userData?.roles) && userData.roles.length > 0)
        return userData.roles[0].id;
    // 3. Kiểm tra các biến phẳng
    return userData?.role_id || userData?.roleId || null;
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
            // Dùng setTimeout 0ms để đảm bảo State đã được cập nhật trước khi chuyển hướng
            setTimeout(() => {
                navigate(path, { replace: true });
            }, 0);
        },
        [navigate]
    );

    const saveExtraInfoToCookies = userData => {
        const expires = 1;
        if (userData.age) Cookies.set('u_age', userData.age, { expires });
        if (userData.address)
            Cookies.set('u_address', userData.address, { expires });
        if (userData.gender)
            Cookies.set('u_gender', userData.gender, { expires });
    };

    // 1. LOGIN: Xử lý đăng nhập và chuyển hướng tự động
    const loginContext = async (userData, accessToken) => {
        if (accessToken) {
            Cookies.set('access_token', accessToken, { expires: 1, path: '/' });
        }

        const roleId = getRoleId(userData);

        // Lưu backup để khi F5 không bị mất quyền
        if (roleId) {
            Cookies.set('backup_role_id', roleId, { expires: 1, path: '/' });
        }
        saveExtraInfoToCookies(userData);

        setUser({ ...userData, role_id: roleId });
        setIsAuthenticated(true);

        // ĐIỀU HƯỚNG TỚI DASHBOARD (Organizer sẽ về /organizer)
        redirectByRole(roleId);
    };

    // 2. UPDATE: Đồng bộ State và Cookie mà không chuyển hướng
    const updateUserContext = updatedData => {
        setUser(prev => {
            const newRoleId = getRoleId(updatedData) || prev.role_id;
            const newUser = { ...prev, ...updatedData, role_id: newRoleId };
            saveExtraInfoToCookies(newUser);
            return newUser;
        });
    };

    // 3. FETCH ACCOUNT: Khôi phục phiên làm việc khi F5
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
                const cookieAge = Cookies.get('u_age');
                const cookieAddress = Cookies.get('u_address');
                const cookieGender = Cookies.get('u_gender');

                // Lấy role từ API, nếu thiếu thì lấy từ Cookie backup
                let roleId =
                    getRoleId(serverUser) || Cookies.get('backup_role_id');

                setUser({
                    ...serverUser,
                    role_id: roleId,
                    age: serverUser.age || cookieAge || '',
                    address: serverUser.address || cookieAddress || '',
                    gender: serverUser.gender || cookieGender || 'MALE'
                });
                setIsAuthenticated(true);
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

    const logoutContext = () => {
        setIsAuthenticated(false);
        setUser({ email: '', name: '', role_id: null });
        Cookies.remove('access_token', { path: '/' });
        Cookies.remove('backup_role_id', { path: '/' });
        Cookies.remove('u_age');
        Cookies.remove('u_address');
        Cookies.remove('u_gender');
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
                updateUserContext,
                isLoading
            }}
        >
            {!isLoading ? (
                children
            ) : (
                <div className='loading-screen'>Đang tải thông tin...</div>
            )}
        </AuthContext.Provider>
    );
};
