import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '@contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated) {
        // Chưa đăng nhập thì đá về trang chủ hoặc trang login
        return <Navigate to='/' replace />;
    }
    return children;
};

export default ProtectedRoute;
