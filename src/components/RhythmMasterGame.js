// RhythmMasterGame.js

import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import * as Tone from 'tone'; // Assurez-vous d'importer Tone.js

const RhythmMasterGame = ({ show, onClose }) => {
  const [level, setLevel] = useState(1);
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    // Charger le motif initial lorsque le composant est monté
    loadPattern(level);
  }, [level]);

  const loadPattern = (currentLevel) => {
    // Simuler le chargement de motif - remplacer par la logique de chargement réelle
    const patternData = generatePattern(currentLevel);
    setPattern(patternData);
  };

  const generatePattern = (currentLevel) => {
    // Générer un motif rythmique en fonction du niveau actuel
    // Exemple simplifié: Génère un motif de longueur variable pour chaque niveau
    const length = currentLevel * 4; // Augmente la longueur du motif avec le niveau
    const newPattern = Array.from({ length }, () => Math.random() < 0.5 ? 'X' : 'O'); // Exemple simple de motif binaire
    return newPattern;
  };

  const handleStartGame = () => {
    setIsPlaying(true);
    playPattern();
  };

  const playPattern = () => {
    // Lecture du motif avec Tone.js ou une autre bibliothèque de musique
    const synth = new Tone.Synth().toDestination();
    const notes = ['C4', 'D4', 'E4', 'G4']; // Exemple de notes pour le motif (à remplacer par un vrai motif)
    pattern.forEach((beat, index) => {
      setTimeout(() => {
        if (beat === 'X') {
          synth.triggerAttackRelease(notes[index % notes.length], '8n');
        }
      }, index * 500); // Tempo de lecture - ajustez selon vos besoins
    });
  };

  const handleUserClick = (beat) => {
    if (isPlaying) {
      setUserPattern([...userPattern, beat]);
    }
  };

  const handleCheckPattern = () => {
    if (userPattern.join('') === pattern.join('')) {
      setIsCorrect(true);
      setTimeout(() => {
        setIsCorrect(null);
        setUserPattern([]);
        setLevel(level + 1);
        loadPattern(level + 1);
      }, 1000); // Temps de pause avant de passer au niveau suivant
    } else {
      setIsCorrect(false);
    }
  };

  const handleClose = () => {
    setIsPlaying(false);
    setIsCorrect(null);
    setUserPattern([]);
    setLevel(1); // Réinitialisation du niveau
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Rhythm Master - Level {level}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="game-container">
          {pattern.map((beat, index) => (
            <button
              key={index}
              className={`beat-button ${userPattern[index] === beat ? 'selected' : ''}`}
              onClick={() => handleUserClick(beat)}
              disabled={!isPlaying}
            >
              {beat}
            </button>
          ))}
        </div>
        {isCorrect !== null && (
          <p className={`feedback-message ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? 'Correct!' : 'Incorrect! Try again.'}
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        {!isPlaying ? (
          <Button variant="primary" onClick={handleStartGame}>
            Start Game
          </Button>
        ) : (
          <Button variant="primary" onClick={handleCheckPattern}>
            Check Pattern
          </Button>
        )}
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RhythmMasterGame;
