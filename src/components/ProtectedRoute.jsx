import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLES } from '../constants/roles';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, profile } = useAuth(); // Asumiendo que useAuth devuelve el perfil con el rol
  const location = useLocation();

  if (loading) {
    return (
      <div className="wrap" style={{ padding: '20px', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p className="page-subtitle">Verificando permisos...</p>
      </div>
    );
  }

  // 1. Verificar si está autenticado
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Verificar si la ruta requiere roles específicos
  // Comparamos el rol del perfil obtenido de la tabla public.perfiles
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.user_metadata?.role)) {
    return <Navigate to="/" replace />; // Redirigir al home si no tiene permiso
  }

  return children;
};

export default ProtectedRoute;