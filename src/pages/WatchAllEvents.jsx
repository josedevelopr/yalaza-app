import React, { useEffect, useState, useRef, useCallback } from 'react';
import Event from '../components/Event';
import { supabase } from '../lib/supabase';
import MainLayout from '../layouts/MainLayout';
import '../assets/styles/watch-all-events.css';

const WatchAllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  
  const observer = useRef();
  const ITEMS_PER_PAGE = 9;
  const categories = ['TODOS', 'CONCIERTOS', 'FESTIVALES', 'WORKSHOPS', 'TEATRO'];

  const lastEventRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // 1. Unificamos la lógica de carga en un solo useEffect
  const fetchEvents = useCallback(async (pageToFetch, category, isReset = false) => {
    try {
      setLoading(true);
      const from = pageToFetch * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('eventos')
        .select('*')
        .eq('flag_estado', 1)
        .in('estado', ['ACTIVO', 'CONFIRMADO'])
        .order('fecha_evento', { ascending: true })
        .range(from, to);

      // Filtro de categoría (opcional, si planeas implementarlo en la DB)
      if (category !== 'TODOS') {
        query = query.ilike('titulo', `%${category}%`); 
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setEvents(prev => {
          const newEvents = isReset ? data : [...prev, ...data];
          // 2. Filtro de seguridad para evitar duplicados por ID en el estado
          const uniqueIds = new Set();
          return newEvents.filter(event => {
            if (uniqueIds.has(event.id)) return false;
            uniqueIds.add(event.id);
            return true;
          });
        });
        setHasMore(data.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Este useEffect maneja tanto el inicio como la paginación de forma limpia
  useEffect(() => {
    fetchEvents(page, selectedCategory, page === 0);
  }, [page, selectedCategory, fetchEvents]);

  const handleCategoryChange = (cat) => {
    if (cat === selectedCategory) return;
    // Solo reseteamos estados; el useEffect de arriba se encargará de la carga
    setSelectedCategory(cat);
    setEvents([]); 
    setPage(0); 
    setHasMore(true);
  };

  return (
    <MainLayout>
      <main className="page-container">
        <nav className="categories-bar-sticky">
          <div className="wrap category-inner">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`category-item ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </nav>

        <section className="wrap" style={{ padding: '0px 0px 40px 0px' }}>
          <header style={{ marginBottom: '40px' }}>
            <h1 className="section-title">
              {selectedCategory === 'TODOS' ? 'Explorar Eventos' : `Eventos: ${selectedCategory}`}
            </h1>
          </header>

          <div className="events-catalog-grid">
            {events.map((item, index) => (
              <div 
                ref={events.length === index + 1 ? lastEventRef : null} 
                key={`${item.id}-${index}`} // Key única combinada para mayor seguridad
              >
                <Event {...item} />
              </div>
            ))}
          </div>

          {loading && (
            <div className="loading-trigger" style={{ marginTop: '40px' }}>
              <div className="spinner"></div>
            </div>
          )}
        </section>

        {!hasMore && events.length > 0 && (
          <section className="footer glass wrap">
            <div className="footer-wrap">
                <h3>¡Es todo por ahora!</h3>
                <p>Ya viste todos los eventos disponibles en esta categoría.</p>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                  className="btn warning"
                  style={{ marginTop: '15px' }}
                >
                  Volver arriba
                </button>
            </div>
          </section>
        )}
      </main>
    </MainLayout>
  );
};

export default WatchAllEvents;