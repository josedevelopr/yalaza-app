import React from 'react';
import Event from './Event';
import eventImg01 from '../assets/img/evento1/banner.jpg';
import eventImg02 from '../assets/img/evento2/banner.jpg';

const EnabledEvents = () => {
  const eventList = [
    {
      id: 1,
      title: "Festival Nocturno Luz & Sonido",
      image: eventImg01,
      description: "Una experiencia inmersiva con música electrónica, visuales en 3D y espacios interactivos.",
      btnClass: "primary"
    },
    {
      id: 2,
      title: "Concierto Acústico al Atardecer",
      image: eventImg02,
      description: "Una velada íntima con artistas emergentes en formato acústico, rodeada de naturaleza.",
      btnClass: "success"
    }
  ];

  return (
    <div className="wrap events-grid">
      {eventList.map(item => (
        <Event 
          key={item.id}
          title={item.title}
          image={item.image}
          description={item.description}
          btnClass={item.btnClass}
        />
      ))}
    </div>
  );
};

export default EnabledEvents;