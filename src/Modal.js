import React from 'react';
import "./Modal.css"

const Modal = ({ onClose, children, hideContent }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {!hideContent && (
          <button className="close-button" onClick={onClose}>
            X
          </button>
        )}
        {children}
      </div>
    </div>
  )
}

export default Modal
