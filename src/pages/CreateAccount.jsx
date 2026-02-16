import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth'; // Asegúrate de que la ruta sea correcta

import '../assets/styles/login.css';

const CreateAccount = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  // 1. Estado para manejar el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    pass: '',
    pass2: '',
    rol: 'ORGANIZADOR',
    activo: true
  });

  // 2. Manejador de cambios en los inputs
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  // 3. Manejador del envío (Submit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.pass !== formData.pass2) {
      alert("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      // Llamamos a la lógica de Supabase
      await signUp({
        email: formData.email,
        password: formData.pass,
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        rol: formData.rol
      });

      alert('Usuario creado. Se ha enviado un correo de confirmación.');
      navigate('/'); // Redirigir tras éxito
    } catch (error) {
      console.error(error);
      alert('Error al crear usuario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="content">
        <div className="glass form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">

              <div className="field">
                <label htmlFor="nombre">Nombre</label>
                <div className="control">
                  <UserIcon />
                  <input 
                    id="nombre" 
                    className="input" 
                    type="text" 
                    placeholder="Ej. Juan"
                    value={formData.nombre}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="apellidos">Apellidos</label>
                <div className="control">
                  <UserIcon />
                  <input 
                    id="apellidos" 
                    className="input" 
                    type="text" 
                    placeholder="Ej. Tenorio"
                    value={formData.apellidos}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="email">Correo</label>
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
                <label htmlFor="telefono">Teléfono</label>
                <div className="control">
                  <PhoneIcon />
                  <input 
                    id="telefono" 
                    className="input" 
                    type="tel" 
                    placeholder="+51 999 999 999"
                    value={formData.telefono}
                    onChange={handleChange} 
                  />
                </div>
                <div className="hint">Opcional, pero ayuda para soporte y recuperación.</div>
              </div>

              <div className="field">
                <label htmlFor="pass">Contraseña</label>
                <div className="control">
                  <LockIcon />
                  <input 
                    id="pass" 
                    className="input" 
                    type="password" 
                    placeholder="Mínimo 8 caracteres"
                    value={formData.pass}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="pass2">Confirmar contraseña</label>
                <div className="control">
                  <LockIcon />
                  <input 
                    id="pass2" 
                    className="input" 
                    type="password" 
                    placeholder="Repite la contraseña"
                    value={formData.pass2}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="field full">
              <label htmlFor="rol">Rol</label>
              <div className="control">
                <StarIcon />
                <select 
                  id="rol" 
                  className="select"
                  /* El 'value' está ligado a formData.rol. 
                    Al cambiar, 'handleChange' actualiza el estado. 
                  */
                  value={formData.rol}
                  onChange={handleChange}
                >
                  <option value="ADMIN">Administrador</option>
                  <option value="ORGANIZADOR">Organizador</option>
                  <option value="SOPORTE">Soporte</option>
                </select>
              </div>
              <div className="hint">Define qué pantallas podrá ver y qué acciones podrá realizar.</div>
            </div>

            </div>

            <div className="row">
              <label className="checkbox">
                <input 
                  id="activo"
                  type="checkbox" 
                  checked={formData.activo}
                  onChange={handleChange} 
                />
                Usuario activo
              </label>

              <div className="actions">
                <button type="button" className="btn ghost" onClick={() => navigate(-1)}>
                  Cancelar
                </button>
                <button type="submit" className="btn success" disabled={loading}>
                  {loading ? 'Procesando...' : 'Crear usuario'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

// --- ICONOS (Para mantener el JSX limpio) ---
const UserIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21a8 8 0 0 0-16 0"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const MailIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16v16H4z" opacity=".12"></path>
    <path d="M4 8l8 5 8-5"></path>
    <path d="M4 8v12h16V8"></path>
  </svg>
);

const PhoneIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.09 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.57 2.5a2 2 0 0 1-.45 2.11L9 10.91a16 16 0 0 0 6.09 6.09l1.58-1.23a2 2 0 0 1 2.11-.45c.8.27 1.64.45 2.5.57A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const LockIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const StarIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4.5L5.5 20l2-7L2 9h7z"></path>
  </svg>
);

export default CreateAccount;