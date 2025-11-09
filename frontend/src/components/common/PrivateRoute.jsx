import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from './Loading';

export const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!isAuthenticated) {
    // Save the intended destination before redirecting to login
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  // Super admin can access all routes
  if (isSuperAdmin) {
    return children;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};
