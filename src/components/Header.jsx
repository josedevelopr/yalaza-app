import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <div className="glass">
      <div className="topbar">
        <div className="brand">
          <span className="brand-dot"></span>
          YALAZA
        </div>

        <div className="top-actions">
          {/* Usamos Link para navegación interna sin recarga */}
          <Link className="btn ghost" to="/">Volver</Link>
          <Link className="btn primary" to="/">Inicio</Link>
          <Link className="btn success" to="/login">Ingresar</Link>
        </div>
      </div>
    </div>
  );
};

export default Header;