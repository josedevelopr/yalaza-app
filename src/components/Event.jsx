import React from 'react';

const Event = ({ image, title, description, btnClass, btnText = "Ver evento" }) => {
  return (
    <div className="card">
      <div className="card-image">
        <img src={image} alt={title} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <a href="#" className={`btn ${btnClass}`}>{btnText}</a>
    </div>
  );
};

export default Event;