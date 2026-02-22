import React from 'react';
import defaultMetaImg from '../assets/img/event-venta-por-meta.png';
import defaultDirectImg from '../assets/img/event-venta-directa.png';
import { useNavigate } from "react-router-dom";

const Event = ({ 
  id = '11111-11111-11111',
  titulo = "Evento sin título", 
  descripcion = "", 
  banner_url, 
  tipo = "DIRECTO", 
  precio = 0, 
  ubicacion = "Ubicación por confirmar", 
  fecha_evento 
}) => {
  
  const tipoSeguro = tipo || "DIRECTO";
  const displayImage = banner_url || (tipoSeguro === 'POR_META' ? defaultMetaImg : defaultDirectImg);
  
  const getPurchaseButton = () => {
    const link = `/evento/${id}`;

    if (tipoSeguro === 'POR_META') {
      return {
        className: 'btn-warning',
        text: 'Prerreservar',
        link
      };
    }

    const tituloLower = titulo.toLowerCase();

    if (tituloLower.includes('festival')) {
      return {
        className: 'btn-primary',
        text: 'Comprar Entrada',
        link
      };
    }

    if (
      tituloLower.includes('concierto') ||
      tituloLower.includes('acústico')
    ) {
      return {
        className: 'btn-success',
        text: 'Comprar Entrada',
        link
      };
    }

    return {
      className: 'btn-primary',
      text: 'Comprar Entrada',
      link
    };
  };

  const { className: btnClass, text: btnText, link: btnLink  } = getPurchaseButton();
  const tagText = tipoSeguro === 'POR_META' ? 'Validando Demanda' : 'Venta Directa';
  const navigate = useNavigate();

  const fechaFormateada = fecha_evento 
    ? new Date(fecha_evento).toLocaleDateString('es-PE', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
      })
    : "Fecha pendiente";

  return (
    <div className="card glass">
      <div className="card-image">
        <img src={displayImage} alt={titulo} />
        <div className={`event-tag ${tipoSeguro.toLowerCase()}`}>{tagText}</div>
      </div>
      
      <div className="card-content">
        <div className="event-info-top">
          <span className="event-date">{fechaFormateada}</span>
          <span className="event-price">S/. {precio}</span>
        </div>
        
        <h3 className="event-title">{titulo}</h3>
      
        <div className="description-container">
          <p className="event-description">
            {descripcion?.length > 200 ? `${descripcion.substring(0, 200)}...` : descripcion}
          </p>
        </div>
        
        <div className="event-location">
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="icon-location"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="location-text">{ubicacion}</span>
        </div>

        <button className={`btn ${btnClass} full-width`} onClick={() => navigate(btnLink)}>
          {btnText}
        </button>
      </div>
    </div>
  );
};

export default Event;