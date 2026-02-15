import React from 'react';
import { Link } from 'react-router-dom';
import bannerImg from '../assets/img/banner.png';

import EnabledEvents from '../components/EnabledEvents';
import CreateEventBanner from '../components/CreateEventBanner';
import OrganizerReviews from '../components/OrganizerReviews';
import FrequentAnswerAndQuestions from '../components/FrequentAnswerAndQuestions';


const Home = () => {
  return (
    <div className="wrap">
      <div className="glass">
        <header>
          <div className="brand">YALAZA</div>
          <div className="header-actions">
            <Link to="/organizador/crear" className="btn primary">Crea un Evento</Link>
            <Link to="/login" className="btn success">Ingresar</Link>
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
        <div class="steps">
        <div class="step">
            <div class="step-number">1</div>
            <div>Crea tu evento</div>
        </div>
        <div class="step">
            <div class="step-number">2</div>
            <div>Activa presereservas</div>
        </div>
        <div class="step">
            <div class="step-number">3</div>
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