import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Container, Alert } from 'react-bootstrap';
import './AdvancedMusicNoteGame.css'; // Assurez-vous que le chemin est correct pour votre fichier CSS
import DoImage from './images/Do.png'; // Importez chaque image comme cela
import FaImage from './images/Fa.png';
import LaImage from './images/La.png';
import MiImage from './images/Mi.png';
import ReImage from './images/Re.png';
import SiImage from './images/Si.png';
import SolImage from './images/Sol.png';
import DoAudio from './audio/Do.mp3'; // Importez chaque fichier audio comme cela
import FaAudio from './audio/Fa.mp3';
import LaAudio from './audio/La.mp3';
import MiAudio from './audio/Mi.mp3';
import ReAudio from './audio/Re.mp3';
import SiAudio from './audio/Si.mp3';
import SolAudio from './audio/Sol.mp3';

const notes = [
  { name: 'Do', image: DoImage, audio: DoAudio },
  { name: 'Fa', image: FaImage, audio: FaAudio },
  { name: 'La', image: LaImage, audio: LaAudio },
  { name: 'Mi', image: MiImage, audio: MiAudio },
  { name: 'Re', image: ReImage, audio: ReAudio },
  { name: 'Si', image: SiImage, audio: SiAudio },
  { name: 'Sol', image: SolImage, audio: SolAudio },
  // Ajoutez ici les nouvelles notes avec leurs images et fichiers audio
];

const AdvancedMusicNoteGame = () => {
  const [currentNote, setCurrentNote] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [selectedButton, setSelectedButton] = useState(null);

  useEffect(() => {
    if (currentNote) {
      generateOptions();
    }
  }, [currentNote]);

  const selectNote = () => {
    setMessage('');
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    setCurrentNote(randomNote);
    playAudio(randomNote.audio);
    setSelectedButton(null); // Réinitialiser l'état du bouton sélectionné
  };

  const generateOptions = () => {
    const shuffledNotes = [...notes].sort(() => 0.5 - Math.random());
    const selectedOptions = shuffledNotes.slice(0, 3);
    if (!selectedOptions.includes(currentNote)) {
      selectedOptions.pop();
      selectedOptions.push(currentNote);
    }
    setOptions(selectedOptions.sort(() => 0.5 - Math.random()));
  };

  const handleOptionClick = (note) => {
    if (note.name === currentNote.name) {
      setScore(score + 1);
      setMessage('Correct! Well done.');
      setShowAlert(true);
    } else {
      setMessage('Incorrect. Try again!');
      setShowAlert(true);
    }
    setSelectedButton(note.name); // Mettre à jour l'état du bouton sélectionné
    setTimeout(() => {
      setShowAlert(false);
      selectNote();
      setSelectedButton(null); // Réinitialiser l'état du bouton sélectionné après un délai
    }, 1000);
  };

  const playAudio = (audio) => {
    const sound = new Audio(audio);
    sound.play();
  };

  return (
    <Container className="music-note-recognition-game mt-5" >
      <h2 className="text-center">Music Note Recognition Game</h2>
      <p className="text-center">Score: {score}</p>
      {currentNote ? (
        <div className="text-center">
          <img src={currentNote.image} alt={currentNote.name} className="note-image my-4" />
          <Row className="justify-content-center">
            {options.map((note, index) => (
              <Col xs={12} sm={6} md={4} lg={3} key={index} className="my-2">
                <Button
                  variant="primary"
                  className={`note-button ${selectedButton === note.name ? 'active' : ''}`}
                  onClick={() => handleOptionClick(note)}
                >
                  <strong style={{ fontSize: '1.8em' }}>{note.name}</strong>
                </Button>
              </Col>
            ))}
          </Row>
          {showAlert && <Alert variant={message === 'Correct! Well done.' ? 'success' : 'danger'} className="mt-4">{message}</Alert>}
        </div>
      ) : (
        <div className="text-center mt-5">
          <Button variant="success" size="lg" onClick={selectNote}>Start Game</Button>
        </div>
      )}
    </Container>
  );
};

export default AdvancedMusicNoteGame;
