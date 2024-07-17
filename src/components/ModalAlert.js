import React from "react";
import { BsExclamationCircle } from "react-icons/bs"; // Icône pour les alertes négatives
import { FaCheckCircle } from "react-icons/fa"; // Icône pour les alertes positives
import "./ModalAlert.css";

const ModalAlert = ({ type, message, onClose }) => {
  return (
    <div className="modal">
      <div className={`modal-content ${type}`}>
        <div className="modal-header">
          {type === "negative" && <BsExclamationCircle className="icon" />}
          {type === "positive" && <FaCheckCircle className="icon" />}
          <h2>{type === "negative" ? "Alerte négative" : "Alerte positive"}</h2>
          <span className="close" onClick={onClose}>&times;</span>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ModalAlert;
