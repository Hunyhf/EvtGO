// src/components/ProtectedRoute/index.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, isLoading, user } = useContext(AuthContext);
    const location = useLocation();

    if (isLoading) return null;

    if (!isAuthenticated) {
        return <Navigate to='/' state={{ from: location }} replace />;
    }

    const hasPermission = allowedRoles?.some(
        role => String(role) === String(user.role_id)
    );

    if (allowedRoles && !hasPermission) {
        console.error(
            'Quyền truy cập bị từ chối. Role hiện tại:',
            user.role_id
        );
        return <Navigate to='/' replace />;
    }

    return children;
};

export default ProtectedRoute;
