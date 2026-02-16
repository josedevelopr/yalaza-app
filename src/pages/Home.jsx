import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bannerImg from '../assets/img/banner.png';

import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

import EnabledEvents from '../components/EnabledEvents';
import CreateEventBanner from '../components/CreateEventBanner';
import OrganizerReviews from '../components/OrganizerReviews';
import FrequentAnswerAndQuestions from '../components/FrequentAnswerAndQuestions';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [session, setSession] = useState(null);

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

  const userInitial = session?.user?.user_metadata?.first_name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="wrap">
      <div className="glass">
        <header>
          <div className="brand">YALAZA</div>
          <div className="header-actions">
            <Link to="/organizador/crear" className="btn primary">Crea un Evento</Link>
            
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
              <Link to="/login" className="btn success">Ingresar</Link>
            )}
          </div>
        </header>

        <div className="hero">
          <h1>¿Tu evento tendrá público o quedará vacío?</h1>
          <div className="hero-actions">
            <Link to="/organizador/crear" className="btn primary">Crea un Evento</Link>
            <Link to="/viabilidad" className="btn warning">Valida la demanda</Link>
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
      <Footer />
    </div>
  );
};

export default Home;