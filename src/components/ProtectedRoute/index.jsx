// src/components/ProtectedRoute/index.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, isLoading, user } = useContext(AuthContext);
    const location = useLocation();

    if (isLoading) {
        return (
            <div className='loading-screen'>
                Đang xác thực quyền truy cập...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to='/' state={{ from: location }} replace />;
    }

    // TƯ DUY SENIOR: Kiểm tra quyền dựa trên việc ép kiểu String
    // Điều này ngăn lỗi khi allowedRoles là [2] (Number) nhưng user.role_id là "2" (String)
    const hasPermission = allowedRoles?.some(
        role => String(role) === String(user.role_id)
    );

    if (allowedRoles && !hasPermission) {
        console.warn(
            '>>> Access Denied! User Role:',
            user.role_id,
            'Required:',
            allowedRoles
        );
        return <Navigate to='/' replace />;
    }

    return children;
};

export default ProtectedRoute;
