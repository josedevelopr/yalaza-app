import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Mientras Supabase verifica la sesión, mostramos un estado de carga
  // Esto evita que React intente renderizar CreateEvent antes de tiempo
  if (loading) {
    return <div className="glass" style={{padding: '20px'}}>Verificando sesión...</div>;
  }

  // Si después de cargar no hay usuario, redirigimos al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;