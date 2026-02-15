import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, isLoading, user } = useContext(AuthContext);
    const location = useLocation();

    if (isLoading) {
        return (
            <div className='loadingScreen'>Đang xác thực quyền truy cập...</div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to='/' state={{ from: location }} replace />;
    }

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
