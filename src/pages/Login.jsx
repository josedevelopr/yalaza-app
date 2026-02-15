import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/styles/login.css';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth'; // Usamos el hook que creamos

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  // 1. Estado para las credenciales
  const [formData, setFormData] = useState({
    email: '',
    pass: ''
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // 2. Lógica de inicio de sesión
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(formData.email, formData.pass);
      // Si el login es exitoso, redirigimos al dashboard o inicio
      navigate('/'); 
    } catch (error) {
      alert('Error al ingresar: ' + error.message);
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

          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
              
              <div className="field">
                <label htmlFor="email">Correo Electrónico</label>
                <div className="control">
                  <MailIcon />
                  <input 
                    id="email" 
                    className="input" 
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
                    className="input" 
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