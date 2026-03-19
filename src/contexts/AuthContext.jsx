import {
    createContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef
} from 'react';
import { useNavigate } from 'react-router-dom';
import { callFetchAccount } from '@apis/authApi.js';
import { ROLE_REDIRECT_MAP, ROLE_ID } from '@constants/roles.js';
import Cookies from 'js-cookie';

export const AuthContext = createContext({});

const extractUserData = data =>
    data?.result || data?.data || data?.user || data || null;

const getRoleId = userData => {
    if (!userData) return null;
    return (
        userData?.role?.id ||
        (Array.isArray(userData?.roles) && userData.roles[0]?.id) ||
        userData?.role_id ||
        userData?.roleId ||
        null
    );
};

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Use a ref to prevent infinite loops during logout
    const isLoggingOut = useRef(false);

    const logoutContext = useCallback(() => {
        if (isLoggingOut.current) return;
        isLoggingOut.current = true;

        setIsAuthenticated(false);
        setUser(null);
        Cookies.remove('access_token', { path: '/' });
        Cookies.remove('backup_role_id', { path: '/' });

        navigate('/', { replace: true });
        isLoggingOut.current = false;
    }, [navigate]);

    const redirectByRole = useCallback(
        (roleId, isReplace = true) => {
            const path = ROLE_REDIRECT_MAP[roleId] || '/';
            navigate(path, { replace: isReplace });
        },
        [navigate]
    );

    const loginContext = useCallback(
        async (userData, accessToken) => {
            try {
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

                setUser({ ...actualUser, role_id: roleId });
                setIsAuthenticated(true);
                redirectByRole(roleId);
            } catch (error) {
                console.error('Login Context Error:', error);
            }
        },
        [redirectByRole]
    );

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
                setUser({ ...serverUser, role_id: roleId });
                setIsAuthenticated(true);

                // Auto-redirect from root if not a customer
                if (
                    window.location.pathname === '/' &&
                    roleId !== ROLE_ID.CUSTOMER
                ) {
                    redirectByRole(roleId);
                }
            }
        } catch (error) {
            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                logoutContext();
            }
        } finally {
            setIsLoading(false);
        }
    }, [logoutContext, redirectByRole]);

    const updateUserContext = useCallback(updatedData => {
        const actualUser = extractUserData(updatedData);
        setUser(prev => ({
            ...prev,
            ...actualUser,
            role_id: getRoleId(actualUser) || prev?.role_id
        }));
    }, []);

    useEffect(() => {
        fetchAccount();
    }, [fetchAccount]);

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
                    Loading system...
                </div>
            )}
        </AuthContext.Provider>
    );
};
