// src/contexts/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { callFetchAccount } from '@apis/authApi.js';
import { ROLE_REDIRECT_MAP, ROLE_ID } from '@constants/roles.js';
import Cookies from 'js-cookie';

export const AuthContext = createContext({});

const extractUserData = data => {
    if (!data) return null;
    return data.result || data.data || data.user || data;
};

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
        (roleId, isReplace = true) => {
            const path = ROLE_REDIRECT_MAP[roleId] || '/';
            navigate(path, { replace: isReplace });
        },
        [navigate]
    );

    const saveExtraInfoToCookies = userData => {
        const expires = 1;
        // SỬA LỖI: Kiểm tra khác undefined để số 0 vẫn được lưu vào cookie
        if (userData?.age !== undefined && userData?.age !== null) {
            Cookies.set('u_age', userData.age, { expires });
        }
        if (userData?.address) {
            Cookies.set('u_address', userData.address, { expires });
        }
        if (userData?.gender) {
            Cookies.set('u_gender', userData.gender, { expires });
        }
    };

    const loginContext = async (userData, accessToken) => {
        const actualUser = extractUserData(userData); // Bóc tách dữ liệu sạch

        if (accessToken) {
            Cookies.set('access_token', accessToken, { expires: 1, path: '/' });
        }
        const roleId = getRoleId(actualUser);
        if (roleId) {
            Cookies.set('backup_role_id', roleId, { expires: 1, path: '/' });
        }

        saveExtraInfoToCookies(actualUser);
        setUser({ ...actualUser, role_id: roleId });
        setIsAuthenticated(true);
        redirectByRole(roleId);
    };

    const updateUserContext = updatedData => {
        const actualUser = extractUserData(updatedData); // SỬA LỖI: Tránh object lồng nhau

        setUser(prev => {
            const newRoleId = getRoleId(actualUser) || prev.role_id;
            const newUser = { ...prev, ...actualUser, role_id: newRoleId };
            saveExtraInfoToCookies(newUser);
            return newUser;
        });
    };

    const fetchAccount = async () => {
        const token = Cookies.get('access_token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await callFetchAccount();
            const serverUser = extractUserData(res); // Đồng bộ cách lấy dữ liệu sạch

            if (serverUser) {
                const roleId =
                    getRoleId(serverUser) || Cookies.get('backup_role_id');

                setUser({
                    ...serverUser,
                    role_id: roleId,
                    // SỬA LỖI: Dùng ?? (Nullish Coalescing) để ưu tiên giá trị 0 thay vì chuỗi rỗng
                    age: serverUser.age ?? Cookies.get('u_age') ?? '',
                    address:
                        serverUser.address || Cookies.get('u_address') || '',
                    gender:
                        serverUser.gender || Cookies.get('u_gender') || 'MALE'
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

    const logoutContext = () => {
        setIsAuthenticated(false);
        setUser({
            id: '',
            email: '',
            name: '',
            age: '',
            address: '',
            gender: '',
            role_id: null
        }); // Xóa sạch dữ liệu
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
