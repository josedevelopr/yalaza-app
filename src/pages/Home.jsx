import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bannerImg from '../assets/img/banner.png';

// Importación de servicios y hooks
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

import EnabledEvents from '../components/EnabledEvents';
import CreateEventBanner from '../components/CreateEventBanner';
import OrganizerReviews from '../components/OrganizerReviews';
import FrequentAnswerAndQuestions from '../components/FrequentAnswerAndQuestions';

const Home = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [session, setSession] = useState(null);

  // Sincronización de sesión al cargar el componente
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

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

  // Obtener inicial del usuario desde los metadatos (configurados en el registro)
  const userInitial = session?.user?.user_metadata?.first_name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="wrap">
      <div className="glass">
        <header>
          <div className="brand">YALAZA</div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/organizador/crear" className="btn primary">Crea un Evento</Link>
            
            {/* Renderizado condicional de acciones de usuario */}
            {session ? (
              <>
                <div 
                  className="profile-avatar" 
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#7d5fff',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  {userInitial}
                </div>
                <button 
                  onClick={handleLogout} 
                  className="btn danger"
                  style={{
                    backgroundColor: 'rgba(255, 71, 87, 0.15)',
                    color: '#ff4757',
                    border: '1px solid rgba(255, 71, 87, 0.3)',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link to="/login" className="btn success">Ingresar</Link>
            )}
          </div>
        </header>

        <div className="hero">
          <h1>¿Tu evento tendrá público o quedará vacío?</h1>
          <div className="hero-actions">
            <Link to="/organizador/crear" className="btn primary">Crea un Evento</Link>
            <Link to="/organizador/crear" className="btn warning">Valida la demanda</Link>
          </div>
          <div className="illustration">
            <img src={bannerImg} alt="Banner" />
          </div>
        </div>
        
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div>Crea tu evento</div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div>Activa prereservas</div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div>Confirma y vende entradas</div>
          </div>
        </div>
      </div>

      <h2 className="section-title">Eventos Disponibles</h2>
      <EnabledEvents />
      <CreateEventBanner />
      <OrganizerReviews />
      <FrequentAnswerAndQuestions />
    </div>
  );
};

export default Home;