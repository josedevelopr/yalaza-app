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

          {session ? (
            <>
              {/* Avatar con inicial (sin dropdown) */}
              <div 
                className="profile-avatar" 
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#7d5fff',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '15px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                {userInitial}
              </div>

              {/* Botón directo de logout */}
              <button 
                className="btn danger" 
                onClick={handleLogout}
                style={{
                  backgroundColor: 'rgba(255, 71, 87, 0.2)',
                  color: '#ff4757',
                  border: '1px solid rgba(255, 71, 87, 0.4)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  marginLeft: '12px'
                }}
              >
                Cerrar Sesión
              </button>
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