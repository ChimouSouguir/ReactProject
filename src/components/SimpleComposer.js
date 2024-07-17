import React, { useState } from 'react';
import './SimpleComposer.css'; // Make sure to import your CSS file if necessary
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';

import noteC from './audio/Do.mp3'; // Import audio files for each note
import noteD from './audio/Re.mp3';
import noteE from './audio/Mi.mp3';
import noteF from './audio/Fa.mp3';
import noteG from './audio/Sol.mp3';
import noteA from './audio/La.mp3';
import noteB from './audio/Si.mp3';

const notes = [
  { name: 'Do', file: noteC, icon: '🎵' },
  { name: 'Ré', file: noteD, icon: '🎵' },
  { name: 'Mi', file: noteE, icon: '🎵' },
  { name: 'Fa', file: noteF, icon: '🎵' },
  { name: 'Sol', file: noteG, icon: '🎵' },
  { name: 'La', file: noteA, icon: '🎵' },
  { name: 'Si', file: noteB, icon: '🎵' },
];

const SimpleComposer = () => {
  const [composition, setComposition] = useState([]);

  const addNoteToComposition = (note) => {
    setComposition([...composition, note]);
  };

  const removeNoteFromComposition = (index) => {
    const newComposition = composition.slice();
    newComposition.splice(index, 1);
    setComposition(newComposition);
  };

  const playComposition = () => {
    composition.forEach((note, index) => {
      setTimeout(() => {
        const audio = new Audio(note.file);
        audio.play();
      }, index * 600);
    });
  };

  return (
    <div className="composer-container">
      <h2 className="composer-title">Music Explorers - Simple Music Composition</h2>
      <div className="notes">
        {notes.map((note) => (
          <button key={note.name} className="note-button" onClick={() => addNoteToComposition(note)}>
            <span className="note-icon">{note.icon}</span> {note.name}
          </button>
        ))}
      </div>
      <div className="composition">
        <h3 className="composition-title">Your Composition:</h3>
        <ul className="composition-list">
          {composition.map((note, index) => (
            <li key={index} className="composition-item">
              <span className="note-icon">{note.icon}</span> {note.name}
              <button className="delete-button" onClick={() => removeNoteFromComposition(index)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
      <button className="play-button" onClick={playComposition}>
        Play Composition <FontAwesomeIcon icon={faMusic} className="music-icon" />
      </button>
      <button className="clear-button" onClick={() => setComposition([])}>
        Clear
      </button>
    </div>
  );
};

export default SimpleComposer;
