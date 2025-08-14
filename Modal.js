import React from "react";

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="um-modal-backdrop">
      <div className="um-modal">
        <div className="um-modal-header">
          <h3>{title}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="um-modal-body">{children}</div>
      </div>
    </div>
  );
}
