import React, { useState, useEffect } from "react";
import "./Alert.css"; // Styles pour les alertes

const Alert = ({ type, message }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Fonction pour masquer l'alerte après un délai
  const hideAlert = () => {
    setTimeout(() => {
      setIsVisible(false);
    }, 5000); // Masque l'alerte après 5 secondes
  };

  // Effectuer l'action de masquage après le rendu initial
  useEffect(() => {
    hideAlert();
  }, []);

  return (
    <div className={`alert ${isVisible ? "show" : "hide"} ${type}`}>
      <span className="icon">{type === "positive" ? "🎉" : "⚠️"}</span>
      <p>{message}</p>
    </div>
  );
};

export default Alert;
