import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, isLoading, user } = useContext(AuthContext);
    const location = useLocation();

    if (isLoading) return <div>Loading...</div>;

    // 1. Chưa đăng nhập -> đá về trang chủ (hoặc trang login)
    if (!isAuthenticated) {
        return <Navigate to='/' state={{ from: location }} replace />;
    }

    // 2. Đã đăng nhập nhưng SAI ROLE -> đá về trang chủ hoặc trang 403
    // allowedRoles là mảng chứa các ID hợp lệ (VD: [1] chỉ cho Admin)
    if (allowedRoles && !allowedRoles.includes(user.role_id)) {
        return <Navigate to='/' replace />;
    }

    return children;
};

export default ProtectedRoute;
