import {
    createContext,
    useState,
    useEffect,
    useCallback,
    useMemo
} from 'react';
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
        avatar: '',
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

    // XỬ LÝ ĐĂNG NHẬP: Loại bỏ việc lưu personal info vào Cookie
    const loginContext = useCallback(
        async (userData, accessToken) => {
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

            // Cập nhật state trực tiếp, không qua trung gian Cookie
            setUser({ ...actualUser, role_id: roleId });
            setIsAuthenticated(true);

            redirectByRole(roleId);
        },
        [redirectByRole]
    );

    // LẤY THÔNG TIN TÀI KHOẢN: Dùng API làm nguồn dữ liệu duy nhất
    const fetchAccount = useCallback(async () => {
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

                // Dữ liệu lấy hoàn toàn từ serverUser trả về
                setUser({
                    ...serverUser,
                    role_id: roleId
                });

                setIsAuthenticated(true);

                // Logic điều hướng giữ nguyên
                if (
                    window.location.pathname === '/' &&
                    roleId !== ROLE_ID.CUSTOMER
                ) {
                    const targetPath = ROLE_REDIRECT_MAP[roleId];
                    if (targetPath && targetPath !== '/') {
                        navigate(targetPath, { replace: true });
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
    }, [navigate, redirectByRole]);

    const logoutContext = useCallback(() => {
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

        // Chỉ xóa các cookie thực sự cần thiết
        Cookies.remove('access_token', { path: '/' });
        Cookies.remove('backup_role_id', { path: '/' });

        navigate('/');
    }, [navigate]);

    const updateUserContext = useCallback(updatedData => {
        const actualUser = extractUserData(updatedData);
        setUser(prev => ({
            ...prev,
            ...actualUser,
            role_id: getRoleId(actualUser) || prev.role_id
        }));
    }, []);

    useEffect(() => {
        fetchAccount();
    }, [fetchAccount]);

    // Tối ưu hiệu năng: Dùng useMemo để tránh re-render khi không cần thiết
    const value = useMemo(
        () => ({
            isAuthenticated,
            user,
            loginContext,
            logoutContext,
            updateUserContext,
            isLoading
        }),
        [
            isAuthenticated,
            user,
            loginContext,
            logoutContext,
            updateUserContext,
            isLoading
        ]
    );

    return (
        <AuthContext.Provider value={value}>
            {!isLoading ? (
                children
            ) : (
                <div
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
