import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { callFetchAccount } from '@apis/authApi.js';
import { ROLE_REDIRECT_MAP } from '@constants/roles.js';
import Cookies from 'js-cookie';

export const AuthContext = createContext({});

const getRoleId = userData => {
    if (!userData) return null;
    if (userData?.role?.id) return userData.role.id;
    if (Array.isArray(userData?.roles) && userData.roles.length > 0)
        return userData.roles[0].id;
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
            navigate(path, { replace: true });
        },
        [navigate]
    );

    // Hàm bổ trợ để lưu các trường thông tin phụ vào Cookie
    const saveExtraInfoToCookies = userData => {
        const expires = 1; // 1 ngày theo token
        if (userData.age) Cookies.set('u_age', userData.age, { expires });
        if (userData.address)
            Cookies.set('u_address', userData.address, { expires });
        if (userData.gender)
            Cookies.set('u_gender', userData.gender, { expires });
    };

    // 1. LOGIN: Lưu token và thông tin phụ vào Cookie
    const loginContext = async (userData, accessToken) => {
        if (accessToken) {
            Cookies.set('access_token', accessToken, { expires: 1, path: '/' });
        }

        const roleId = getRoleId(userData);
        if (roleId) {
            Cookies.set('backup_role_id', roleId, { expires: 1, path: '/' });
        }

        // Lưu thông tin phụ
        saveExtraInfoToCookies(userData);

        setUser({ ...userData, role_id: roleId });
        setIsAuthenticated(true);
        redirectByRole(roleId);
    };

    // 2. UPDATE USER: Cập nhật state và đồng bộ lại Cookie
    const updateUserContext = updatedData => {
        setUser(prev => {
            const newRoleId = getRoleId(updatedData) || prev.role_id;
            const newUser = {
                ...prev,
                ...updatedData,
                role_id: newRoleId
            };

            // Đồng bộ lại Cookie khi có thay đổi
            saveExtraInfoToCookies(newUser);

            if (getRoleId(updatedData)) {
                Cookies.set('backup_role_id', newRoleId, {
                    expires: 1,
                    path: '/'
                });
            }
            return newUser;
        });
    };

    // 3. FETCH ACCOUNT: Lấy thông tin từ API và đắp dữ liệu từ Cookie
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

                // Lấy thông tin "bù đắp" từ Cookie
                const cookieAge = Cookies.get('u_age');
                const cookieAddress = Cookies.get('u_address');
                const cookieGender = Cookies.get('u_gender');

                let roleId =
                    getRoleId(serverUser) || Cookies.get('backup_role_id');

                setUser({
                    ...serverUser,
                    role_id: roleId,
                    // Nếu API thiếu thì lấy từ Cookie, nếu cả 2 thiếu thì để mặc định
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

    // 4. LOGOUT: Dọn dẹp sạch sẽ Cookies
    const logoutContext = () => {
        setIsAuthenticated(false);
        setUser({ email: '', name: '', role_id: null });

        // Xóa tất cả các keys liên quan
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
