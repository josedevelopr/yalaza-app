import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import '../assets/styles/create.css';

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'POR_META', 
    min_quorum: 30, 
    max_aforo: '',
    precio: '',
    fecha_evento: '',
    ubicacion: '',
    ubicacion_url: '',
    estado: 'BORRADOR'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const dataToSubmit = {
      ...formData,
      organizador_id: user.id, // Ya validado arriba
      min_quorum: formData.tipo === 'POR_META' ? parseInt(formData.min_quorum) : null
    };

    try {
      const { error } = await supabase.from('eventos').insert([dataToSubmit]);
      if (error) throw error;
      
      alert('¡Evento creado con éxito!');
      navigate('/');
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="content">
        <div className="glass page-head">
          <h1 className="page-title">
            Configurar Nuevo Evento 
          </h1>
          <p className="page-subtitle">Define el quórum necesario para validar tu demanda antes de invertir.</p>
        </div>

        <div className="glass form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              
              <div className="field full">
                <label>Título del Evento</label>
                <input 
                  className="input" 
                  type="text" 
                  placeholder="Ej. Torneo de Pádel Nivel Inicial"
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  required 
                />
              </div>

              <div className="field">
                <label>Modalidad de Gestión</label>
                <div className="control">
                    <select 
                    className="select select-custom" 
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    >
                    <option value="POR_META">Evento por Meta (Validar demanda)</option>
                    <option value="DIRECTO">Venta Directa</option>
                    </select>
                </div>
              </div>

              <div className="field">
                <label>Precio de Entrada (S/.)</label>
                <input 
                  className="input" 
                  type="number" 
                  step="0.10"
                  placeholder="0.00"
                  onChange={(e) => setFormData({...formData, precio: e.target.value})}
                  required 
                />
              </div>

              <div className="field">
                <label>Aforo Máximo</label>
                <input 
                  className="input" 
                  type="number" 
                  placeholder="Capacidad del local"
                  onChange={(e) => setFormData({...formData, max_aforo: e.target.value})}
                  required 
                />
              </div>

              {formData.tipo === 'POR_META' && (
                <div className="field">
                  <label>Quórum Mínimo (Asistentes)</label>
                  <input 
                    className="input" 
                    type="number" 
                    placeholder="Mínimo de personas para confirmar"
                    value={formData.min_quorum}
                    onChange={(e) => setFormData({...formData, min_quorum: e.target.value})}
                    required={formData.tipo === 'POR_META'}
                  />
                  <div className="hint">Cantidad de pre-reservas para mitigar el riesgo financiero. [cite: 108, 189]</div>
                </div>
              )}

              <div className="field">
                <label>Nombre del Lugar</label>
                <input 
                  className="input" 
                  type="text" 
                  placeholder="Ej. Rooftop Miraflores"
                  onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                  required 
                />
              </div>

              <div className="field">
                <label>Ubicación (Google Maps)</label>
                <input 
                  className="input" 
                  type="url" 
                  placeholder="https://goo.gl/maps/..."
                  onChange={(e) => setFormData({...formData, ubicacion_url: e.target.value})}
                  required 
                />
              </div>

              <div className="field">
                <label>Fecha y Hora</label>
                <input 
                  className="input" 
                  type="datetime-local" 
                  onChange={(e) => setFormData({...formData, fecha_evento: e.target.value})}
                  required 
                />
              </div>

              <div className="field full">
                <label>Descripción del Evento</label>
                <textarea 
                  className="textarea" 
                  placeholder="Detalla la experiencia de tu evento..."
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                ></textarea>
              </div>

            </div>

            <div className="row">
              <div className="actions">
                <button type="button" className="btn ghost" onClick={() => navigate('/')}>Cancelar</button>
                <button type="submit" className="btn success" disabled={loading || !user}>
                  {loading ? 'Publicando...' : 'Crear Evento'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateEvent;