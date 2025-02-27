import React from 'react';

function Card({ value, isFlipped, onClick }) {
  return (
    <div 
      className={`card ${isFlipped ? 'flipped' : ''}`} 
      onClick={onClick}
    >
      <div className="front">?</div>
      <div className="back">{value}</div>
    </div>
  );
}

export default Card;