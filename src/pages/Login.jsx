import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/styles/login.css';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null); // Estado para el mensaje de error

  const [formData, setFormData] = useState({
    email: '',
    pass: ''
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    // Limpiamos el error cuando el usuario vuelve a escribir
    if (errorMsg) setErrorMsg(null);
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      await signIn(formData.email, formData.pass);
      navigate('/'); 
    } catch (error) {
      // Identificación del tipo de error
      if (error.message.includes('Invalid login credentials') || error.status === 400) {
        setErrorMsg('El correo o la contraseña son incorrectos. Por favor, verifica tus datos.');
      } else {
        setErrorMsg('Hubo un problema con la plataforma. Por favor, inténtalo de nuevo en unos momentos.');
      }
      console.error('Login Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="content">
        <div className="glass form-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="page-head" style={{ marginTop: 0, paddingBottom: '10px' }}>
            <h1 className="page-title">Iniciar Sesión</h1>
            <p className="page-subtitle">Bienvenido de nuevo a Yalaza.</p>
          </div>

          {/* Banner de error dinámico */}
          {errorMsg && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
              
              <div className="field">
                <label htmlFor="email">Correo Electrónico</label>
                <div className="control">
                  <MailIcon />
                  <input 
                    id="email" 
                    className={`input ${errorMsg ? 'input-error' : ''}`}
                    type="email" 
                    placeholder="ejemplo@correo.com" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="pass">Contraseña</label>
                <div className="control">
                  <LockIcon />
                  <input 
                    id="pass" 
                    className={`input ${errorMsg ? 'input-error' : ''}`}
                    type="password" 
                    placeholder="Ingresa tu contraseña" 
                    value={formData.pass}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="hint">
                  <Link to="/recovery" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

            </div>

            <div className="row" style={{ marginTop: '24px' }}>
              <label className="checkbox">
                <input type="checkbox" />
                Recordarme
              </label>

              <div className="actions">
                <Link to="/register" className="btn ghost">Crear cuenta</Link>
                <button type="submit" className="btn primary" disabled={loading}>
                  {loading ? 'Cargando...' : 'Ingresar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

// Iconos SVG para mantener el código limpio
const MailIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16v16H4z" opacity=".12"></path>
    <path d="M4 8l8 5 8-5"></path>
    <path d="M4 8v12h16V8"></path>
  </svg>
);

const LockIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

export default Login;