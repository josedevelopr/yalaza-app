import React, { useEffect, useState } from 'react';
import Event from './Event';
import { supabase } from '../lib/supabase';

const EnabledEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Consultamos eventos en estado ACTIVO o CONFIRMADO
        const { data, error } = await supabase
          .from('eventos')
          .select('*')
          .order('fecha_evento', { ascending: true });

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error al obtener eventos:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="wrap" style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="spinner"></div>
        <p className="page-subtitle">Cargando experiencias en Yalaza...</p>
      </div>
    );
  }

  return (
    <div className="wrap events-grid">
      {events.length > 0 ? (
        events.map((item) => (
          <Event 
            key={item.id}
           {...item} 
          />
        ))
      ) : (
        <div className="glass" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
          <p className="page-subtitle">No hay eventos activos en este momento.</p>
          <p className="small">¡Vuelve pronto para descubrir nuevas metas!</p>
        </div>
      )}
    </div>
  );
};

export default EnabledEvents;