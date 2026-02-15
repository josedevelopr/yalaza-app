import React from 'react';
import Review from './Review';


const OrganizerReviews = () => {
  const reviews = [
    { initial: 'A', name: 'Ana Rodríguez', role: 'Organizadora de talleres', text: 'Con YALAZA validé mi idea antes de invertir en el local. Logré asegurar público y vender entradas sin estrés.' },
    { initial: 'C', name: 'Carlos Méndez', role: 'Productor musical', text: 'La gestión de entradas es súper intuitiva. Pude organizar mi primer concierto sin complicarme con herramientas complejas.' },
    { initial: 'M', name: 'María Quispe', role: 'Gestora cultural', text: 'Lo mejor es la pre-reserva. Me dio seguridad para seguir adelante con mi evento y optimizar costos.' }
  ];

  return (
    <section className="wrap testimonials-section">
      <h2 className="section-title">Lo que dicen nuestros organizadores</h2>
      <div className="testimonials-grid">
        {reviews.map((rev, index) => (
          <Review key={index} {...rev} />
        ))}
      </div>
    </section>
  );
};

export default OrganizerReviews;