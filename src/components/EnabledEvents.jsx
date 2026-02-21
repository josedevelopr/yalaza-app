import React, { useEffect, useState, useMemo } from 'react';
import Event from './Event';
import { supabase } from '../lib/supabase';

const EnabledEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Configuración de visualización por dispositivo
  const config = useMemo(() => {
    if (windowWidth >= 1024) return { visibleItems: 3, step: 33.333 }; // Desktop
    if (windowWidth >= 640) return { visibleItems: 2, step: 50 };      // Tablet
    return { visibleItems: 1, step: 100 };                            // Mobile (iPhone/Safari)
  }, [windowWidth]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('eventos')
          .select('*')
          .eq('flag_estado', 1)
          .in('estado', ['ACTIVO', 'CONFIRMADO'])
          .order('fecha_evento', { ascending: true })
          .limit(6);

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error al obtener eventos:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    if (currentIndex < events.length - config.visibleItems) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;

  return (
    <div className="wrap carousel-section" style={{ overflow: 'hidden', padding: '20px 0' }}>
      <div className="carousel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 className="section-title">Eventos Destacados</h2>
          <p className="section-subtitle">Descubre experiencias únicas cerca de ti</p>
        </div>
        
        {events.length > config.visibleItems && (
          <div className="carousel-controls">
            <button 
              onClick={prevSlide} 
              className={`btn-nav ${currentIndex === 0 ? 'disabled' : ''}`}
              disabled={currentIndex === 0}
            >‹</button>
            <button 
              onClick={nextSlide} 
              className={`btn-nav ${currentIndex >= events.length - config.visibleItems ? 'disabled' : ''}`}
              disabled={currentIndex >= events.length - config.visibleItems}
            >›</button>
          </div>
        )}
      </div>

      <div className="carousel-viewport" style={{ width: '100%', overflow: 'hidden' }}>
        <div 
          className="carousel-rail" 
          style={{ 
            display: 'flex',
            transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)', // Deslizamiento ultra suave
            transform: `translateX(-${currentIndex * config.step}%)`,
            width: '100%'
          }}
        >
          {events.map((item) => (
            <div 
              key={item.id} 
              style={{ 
                flex: `0 0 ${config.step}%`, 
                padding: '0 12px', 
                boxSizing: 'border-box'
              }}
            >
              <Event {...item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnabledEvents;