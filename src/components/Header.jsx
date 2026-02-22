import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Sincronización inicial de la sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Escuchar cambios de estado (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message);
    }
  };

  // Extraer inicial del nombre guardado en los metadatos
  const userInitial = session?.user?.user_metadata?.first_name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="glass">
      <div className="topbar">
        <div className="brand">
          <span className="brand-dot"></span>
          YALAZA
        </div>

        <div className="top-actions" style={{ display: 'flex', alignItems: 'center' }}>
          <Link className="btn ghost" to="/">Inicio</Link>
          <Link className="btn ghost" to="/eventos">Ver eventos</Link>

          {session ? (
            <>
              <button onClick={handleLogout} className="btn danger">
                Cerrar Sesión
              </button>
              <div className="profile-avatar">
                {userInitial}
              </div>
            </>
          ) : (
            <Link className="btn success" to="/login">Ingresar</Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;