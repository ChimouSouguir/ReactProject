import React from 'react';
import './MusicButton.css';

const MusicButton = ({ onClick, label }) => {
  return (
    <button className="music-button" onClick={onClick}>
      {label}
    </button>
  );
};

export default MusicButton;
