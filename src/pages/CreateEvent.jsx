import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../assets/styles/create.css';

// Configuración de iconos de Leaflet para evitar que desaparezcan en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BUCKET_BANNERS = "event-banners";

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Estados para el Banner
  const [bannerFile, setBannerFile] = useState(null);
  const [previewBanner, setPreviewBanner] = useState("");

  // Estado para el Mapa
  const [coords, setCoords] = useState({ lat: -12.046, lng: -77.042 });

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

  // Componente para capturar clicks en el mapa
  function MapEvents() {
    useMapEvents({
      click(e) {
        setCoords(e.latlng);
        const osmUrl = `https://www.openstreetmap.org/?mlat=${e.latlng.lat}&mlon=${e.latlng.lng}#map=16/${e.latlng.lat}/${e.latlng.lng}`;
        setFormData(prev => ({ ...prev, ubicacion_url: osmUrl }));
      },
    });
    return <Marker position={coords} />;
  }

  const uploadBanner = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_BANNERS)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET_BANNERS).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let publicBannerUrl = "";
      if (bannerFile) {
        publicBannerUrl = await uploadBanner(bannerFile);
      }

      const dataToSubmit = {
        ...formData,
        organizador_id: user.id,
        banner_url: publicBannerUrl,
        min_quorum: formData.tipo === 'POR_META' ? parseInt(formData.min_quorum) : 0,
        max_aforo: parseInt(formData.max_aforo),
        precio: parseFloat(formData.precio)
      };

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
          <h1 className="page-title">Configurar Nuevo Evento</h1>
          <p className="page-subtitle">Define el quórum necesario para validar tu demanda.</p>
        </div>

        <div className="glass form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              
              <div className="field full">
                <label>Banner del Evento</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setBannerFile(file);
                      setPreviewBanner(URL.createObjectURL(file));
                    }
                  }} 
                />
                {previewBanner && (
                  <div style={{ marginTop: 10 }}>
                    <img src={previewBanner} alt="Vista previa" style={{ width: '100%', borderRadius: '12px', maxHeight: '200px', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              <div className="field full">
                <label>Ubicación: Selecciona un punto en el mapa</label>
                <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginTop: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <MapContainer center={[coords.lat, coords.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapEvents />
                  </MapContainer>
                </div>
                <input 
                  className="input" 
                  type="text" 
                  placeholder="Nombre del lugar (ej. Local Miraflores)"
                  style={{ marginTop: '10px' }}
                  onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                  required 
                />
              </div>
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
                <label>Modalidad</label>
                <select className="select select-custom" value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})}>
                  <option value="POR_META">Por Meta (Validar demanda)</option>
                  <option value="DIRECTO">Venta Directa</option>
                </select>
              </div>

              <div className="field">
                <label>Precio (S/.)</label>
                <input className="input" type="number" step="0.10" onChange={(e) => setFormData({...formData, precio: e.target.value})} required />
              </div>

              <div className="field">
                <label>Aforo Máximo</label>
                <input className="input" type="number" onChange={(e) => setFormData({...formData, max_aforo: e.target.value})} required />
              </div>

              {formData.tipo === 'POR_META' && (
                <div className="field">
                  <label>Quórum Mínimo</label>
                  <input className="input" type="number" value={formData.min_quorum} onChange={(e) => setFormData({...formData, min_quorum: e.target.value})} />
                </div>
              )}

              <div className="field">
                <label>Fecha y Hora</label>
                <input className="input" type="datetime-local" step="60" onChange={(e) => setFormData({...formData, fecha_evento: e.target.value})} required />
              </div>

              <div className="field full">
                <label>Descripción</label>
                <textarea className="textarea" placeholder="Detalles del evento..." onChange={(e) => setFormData({...formData, descripcion: e.target.value})}></textarea>
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