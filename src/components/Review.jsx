import React from 'react';

const Review = ({ text, name, role, initial }) => {
  return (
  <div className="glass testimonial-card">
    <div className="quote">“</div>
    <p className="testimonial-text">{text}</p>
    <div className="testimonial-footer">
      <div className="avatar">{initial}</div>
      <div>
        <div className="testimonial-name">{name}</div>
        <div className="testimonial-role">{role}</div>
      </div>
    </div>
  </div>
  );
};

export default Review;