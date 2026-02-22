import React, { useEffect, useState, useRef, useCallback } from 'react';
import Event from '../components/Event';
import { supabase } from '../lib/supabase';
import MainLayout from '../layouts/MainLayout';
import '../assets/styles/watch-all-events.css';

const WatchAllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchEvents = useCallback(async (isNewCategory = false) => {
    try {
      setLoading(true);
      const currentPage = isNewCategory ? 0 : page;
      const from = currentPage * ITEMS_PER_PAGE;
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('flag_estado', 1)
        .in('estado', ['ACTIVO', 'CONFIRMADO'])
        .order('fecha_evento', { ascending: true })
        .range(from, from + ITEMS_PER_PAGE - 1);

      if (error) throw error;
      setEvents(prev => isNewCategory ? data : [...prev, ...data]);
      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory]);

  useEffect(() => { fetchEvents(); }, [page]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setEvents([]); setPage(0); setHasMore(true);
    fetchEvents(true);
  };

  return (
    <MainLayout>
      <main className="page-container">
        {/* Navegación de Categorías Minimalista (Reemplazo de Breadcrumbs) */}
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

        {/* Sección de Grilla de Eventos */}
        <section className="wrap" style={{ padding: '0px 0px 40px 0px' }}>
          <header style={{ marginBottom: '40px' }}>
            <h1 className="section-title">Explorar Eventos</h1>
            {/* El subtítulo ahora es opcional o puede eliminarse para más limpieza */}
          </header>

          <div className="events-catalog-grid">
            {events.map((item, index) => (
              <div ref={events.length === index + 1 ? lastEventRef : null} key={item.id}>
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

        {/* SECCIÓN INDEPENDIENTE: Fin de Catálogo */}
        {!hasMore && events.length > 0 && (
          <section className="footer glass wrap">
            <div className="footer-wrap">
                <h3>¡Es todo por ahora!</h3>
                <p>Ya viste todos los eventos activos. ¿No encontraste lo que buscabas? ¡Crea tu propio evento!</p>
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