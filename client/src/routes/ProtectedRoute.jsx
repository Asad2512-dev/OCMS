// Lets a page through only if the user is logged in (and, if "roles" is given, has one of those roles).
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { PageLoader } from '../components/ui/Spinner.jsx';
import { ROUTES } from '../config/constants.js';

const ProtectedRoute = ({ roles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  return children || <Outlet />;
};
export default ProtectedRoute;
