import React from "react";
import "./Card.css"
import logo from './assets/matcha-logo.svg'; // Update the path to your logo image

function Card({ value, isFlipped, isMatched, onClick, status }) {
  // Determine the class based on status and isFlipped
  const cardClass = `card ${isFlipped ? "flipped" : ""} ${status || ""}`

  return (
    <div className={cardClass} onClick={onClick}>
      <div className="card-inner">
        <div className="card-front">
          <img src={logo} alt="Logo" className="card-logo" />
        </div>
        <div className="card-back">{value}</div>
      </div>
    </div>
  )
}

export default Card