import React from 'react';
import '../assets/styles/footer.css';

const Footer = () => {
  return (
    <footer className="footer glass">
      <div className="footer-wrap">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-brand">YALAZA</div>
            <p className="footer-text">
              Plataforma para crear, validar y gestionar eventos de forma simple y efectiva.
            </p>
          </div>

          <div className="footer-col">
            <div className="footer-title">Producto</div>
            <a href="#" className="footer-link">Crear evento</a>
            <a href="#" className="footer-link">Validar demanda</a>
            <a href="#" className="footer-link">Pre-reservas</a>
          </div>

          <div className="footer-col">
            <div className="footer-title">Empresa</div>
            <a href="#" className="footer-link">Sobre YALAZA</a>
            <a href="#" className="footer-link">Contacto</a>
            <a href="#" className="footer-link">Términos y condiciones</a>
          </div>

          <div className="footer-col">
            <div className="footer-title">Soporte</div>
            <a href="#" className="footer-link">Centro de ayuda</a>
            <a href="#" className="footer-link">Preguntas frecuentes</a>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <div>© 2025 YALAZA. Todos los derechos reservados.</div>
          <div className="footer-social">
            <a href="#" className="social-dot"></a>
            <a href="#" className="social-dot"></a>
            <a href="#" className="social-dot"></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;