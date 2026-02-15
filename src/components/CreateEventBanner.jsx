import React from 'react';
import { Link } from 'react-router-dom';

const CreateEventBanner = () => {
  return (
    <div className="wrap">
      <div className="footer-cta glass">
        <h2>¿Quieres crear tu propio evento?</h2>
        <Link to="/organizador/crear" className="btn primary">Crea tu Evento ahora</Link>
      </div>
    </div>
  );
};

export default CreateEventBanner;