import React, { useState, useRef } from 'react';
import './InstrumentsIdentification.css'; // Make sure to import your CSS file if necessary

// Import instrument images
import pianoImage from './images/piano.png';
import guitarImage from './images/guitar.png';
import trumpetImage from './images/trumpet.png';
import violinImage from './images/violon.png';
import drumsImage from './images/drumps.png';
import fluteImage from './images/flute.png';
import saxophoneImage from './images/saxophone.png';
import harmonicaImage from './images/harmonica.png';
import tambourineImage from './images/tambourine.png';
import accordionImage from './images/accordion.png';

// Import audio files
import correctSound from './Sounds/correct.mp3';
import incorrectSound from './Sounds/incorrect.mp3';

// Define instruments with their names and images
const instruments = [
  { id: 1, name: 'Piano', image: pianoImage },
  { id: 2, name: 'Guitar', image: guitarImage },
  { id: 3, name: 'Trumpet', image: trumpetImage },
  { id: 4, name: 'Violin', image: violinImage },
  { id: 5, name: 'Drumps', image: drumsImage },
  { id: 6, name: 'Flute', image: fluteImage },
  { id: 7, name: 'Saxophone', image: saxophoneImage },
  { id: 8, name: 'Harmonica', image: harmonicaImage },
  { id: 9, name: 'Tambourine', image: tambourineImage },
  { id: 10, name: 'Accordion', image: accordionImage }
];

const InstrumentsIdentification = () => {
  const [currentInstrument, setCurrentInstrument] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const correctSoundRef = useRef(null);
  const incorrectSoundRef = useRef(null);

  // Function to choose a random instrument
  const chooseRandomInstrument = () => {
    const randomIndex = Math.floor(Math.random() * instruments.length);
    setCurrentInstrument(instruments[randomIndex]);
    setFeedbackMessage('');
    setUserInput('');
    setIsCorrect(false);
  };

  // Function to handle user submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.toLowerCase() === currentInstrument.name.toLowerCase()) {
      setIsCorrect(true);
      setFeedbackMessage('Bravo! That\'s correct.');
      playCorrectSound();
    } else {
      setIsCorrect(false);
      setFeedbackMessage(`Sorry, that's incorrect. The correct answer was: ${currentInstrument.name}`);
      playIncorrectSound();
    }
  };

  // Function to play the correct sound
  const playCorrectSound = () => {
    if (correctSoundRef.current) {
      correctSoundRef.current.play();
    }
  };

  // Function to play the incorrect sound
  const playIncorrectSound = () => {
    if (incorrectSoundRef.current) {
      incorrectSoundRef.current.play();
    }
  };

  // Initialize an instrument on page load
  useState(() => {
    chooseRandomInstrument();
  }, []);

  return (
    <div>
      <h2>Guess the Instrument</h2>
      <div className="instrument-image">
        {currentInstrument && (
          <img src={currentInstrument.image} alt={currentInstrument.name} />
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="userGuess">What is this instrument?</label>
        <input
          type="text"
          id="userGuess"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
      <div className="feedback">
        {feedbackMessage && <p className={isCorrect ? 'correct' : 'incorrect'}>{feedbackMessage}</p>}
        {feedbackMessage && <button onClick={chooseRandomInstrument}>New instrument</button>}
      </div>
      {/* Add audio elements */}
      <audio ref={correctSoundRef} src={correctSound} />
      <audio ref={incorrectSoundRef} src={incorrectSound} />
    </div>
  );
};

export default InstrumentsIdentification;
