import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { callFetchAccount } from '@apis/authApi.js';
import { ROLE_REDIRECT_MAP, ROLE_ID } from '@constants/roles.js';
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
        (roleId, isReplace = true) => {
            const path = ROLE_REDIRECT_MAP[roleId] || '/';
            navigate(path, { replace: isReplace });
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

    const loginContext = async (userData, accessToken) => {
        if (accessToken) {
            Cookies.set('access_token', accessToken, { expires: 1, path: '/' });
        }
        const roleId = getRoleId(userData);
        if (roleId) {
            Cookies.set('backup_role_id', roleId, { expires: 1, path: '/' });
        }
        saveExtraInfoToCookies(userData);
        setUser({ ...userData, role_id: roleId });
        setIsAuthenticated(true);
        redirectByRole(roleId);
    };

    const updateUserContext = updatedData => {
        setUser(prev => {
            const newRoleId = getRoleId(updatedData) || prev.role_id;
            const newUser = { ...prev, ...updatedData, role_id: newRoleId };
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
            if (res && res.user) {
                const serverUser = res.user;
                const roleId =
                    getRoleId(serverUser) || Cookies.get('backup_role_id');

                setUser({
                    ...serverUser,
                    role_id: roleId,
                    age: serverUser.age || Cookies.get('u_age') || '',
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
