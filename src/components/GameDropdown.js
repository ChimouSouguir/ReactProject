import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGamepad, faMusic, faMicrophoneAlt, faPalette } from '@fortawesome/free-solid-svg-icons';
import AdvancedMusicNoteGame from './AdvancedMusicNoteGame';
import MemoryGame from './MemoryGame';
import InstrumentsIdentification from './InstrumentsIdentification';
import SimpleComposer from './SimpleComposer';

const GameDropdown = () => {
  const [show, setShow] = useState(false);

  const handleToggle = () => setShow(!show);

  return (
    <Dropdown show={show} onToggle={handleToggle}>
      <Dropdown.Toggle variant="secondary" id="dropdown-games">
        <FontAwesomeIcon icon={faGamepad} className="mr-2" /> Jeux
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={() => setShow(false)}>
          <FontAwesomeIcon icon={faMusic} className="mr-2" /> Advanced Music Note Game
          <AdvancedMusicNoteGame />
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setShow(false)}>
          <FontAwesomeIcon icon={faGamepad} className="mr-2" /> Memory Game
          <MemoryGame />
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setShow(false)}>
          <FontAwesomeIcon icon={faMicrophoneAlt} className="mr-2" /> Instruments Identification
          <InstrumentsIdentification />
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setShow(false)}>
          <FontAwesomeIcon icon={faPalette} className="mr-2" /> Simple Composer
          <SimpleComposer />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default GameDropdown;
