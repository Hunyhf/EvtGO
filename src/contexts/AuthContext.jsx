import { createContext, useState, useEffect } from 'react';
import { callFetchAccount } from '@apis/authApi.js';

export const AuthContext = createContext({
    isAuthenticated: false,
    user: {
        email: '',
        name: ''
    },
    loginContext: () => {},
    logoutContext: () => {}
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({
        email: '',
        name: ''
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loginContext = userData => {
        setIsAuthenticated(true);
        setUser(userData);
    };

    const logoutContext = () => {
        setIsAuthenticated(false);
        setUser({ email: '', name: '' });
        localStorage.removeItem('access_token');
    };

    const fetchAccount = async () => {
        if (!localStorage.getItem('access_token')) {
            setIsLoading(false);
            return;
        }
        try {
            const res = await callFetchAccount();
            if (res && res.data) {
                loginContext(res.data.user);
            }
        } catch (error) {
            // Token không hợp lệ
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
            {/* Chờ check token xong mới render app để tránh flicker */}
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
