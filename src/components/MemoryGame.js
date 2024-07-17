import React, { useState, useEffect } from 'react';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import './MemoryGame.css'; // CSS file for animations
import congratulationsSound from './audio/congratulations.mp3'; // Path to congratulations audio file

const icons = ['🎵', '🎶', '🎼', '🎸', '🥁', '🎹', '🎻', '🎷', '🎺', '🎤', '🎧', '🎤', '🎺', '🎷', '🎻', '🎹', '🥁', '🎸', '🎼', '🎶']; // Game icons

const MemoryGame = ({ onClose }) => {
  const [cards, setCards] = useState([]);
  const [flippedCardIndex, setFlippedCardIndex] = useState(null);
  const [matchedIndexes, setMatchedIndexes] = useState([]);
  const [showCards, setShowCards] = useState(true); // Show or hide cards
  const [timer, setTimer] = useState(10); // 10-second timer
  const [pairsFound, setPairsFound] = useState(0); // Number of pairs found
  const [gameFinished, setGameFinished] = useState(false); // Game finished flag
  const [showReplayButton, setShowReplayButton] = useState(false); // Replay button visibility
  const [difficulty, setDifficulty] = useState(null); // Selected difficulty level

  useEffect(() => {
    let interval;
    if (difficulty) {
      const initialCards = generateCards();
      setCards(initialCards);

      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      setTimeout(() => {
        setShowCards(false);
        clearInterval(interval);
      }, 10000);
    }

    return () => {
      clearInterval(interval); // Clean up interval on component unmount
    };
  }, [difficulty]);

  const generateCards = () => {
    let numCards;
    if (difficulty === 'easy') {
      numCards = 10;
    } else if (difficulty === 'medium') {
      numCards = 14;
    } else if (difficulty === 'hard') {
      numCards = 20;
    }

    const iconsCopy = [...icons.slice(0, numCards / 2), ...icons.slice(0, numCards / 2)]; // Duplicate icons to form pairs
    const shuffledIcons = shuffleArray(iconsCopy);
    return shuffledIcons.map((icon, index) => ({
      icon,
      flipped: false,
      matched: false,
      index,
    }));
  };

  const shuffleArray = (array) => {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleClick = (index) => {
    if (cards[index].flipped || matchedIndexes.includes(index) || gameFinished) {
      return;
    }

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    if (flippedCardIndex !== null) {
      const matchIndex = flippedCardIndex;

      if (newCards[index].icon === newCards[matchIndex].icon) {
        newCards[index].matched = true;
        newCards[matchIndex].matched = true;
        setMatchedIndexes([...matchedIndexes, index, matchIndex]);
        setPairsFound(pairsFound + 1);

        if (pairsFound + 1 === newCards.length / 2) {
          setTimeout(() => {
            setGameFinished(true);
            setShowReplayButton(true);
          }, 500);
        }
      } else {
        setTimeout(() => {
          newCards[index].flipped = false;
          newCards[matchIndex].flipped = false;
          setCards(newCards);
        }, 1000);
      }

      setFlippedCardIndex(null);
    } else {
      setFlippedCardIndex(index);
    }
  };

  const handleCloseGame = () => {
    onClose();
  };

  const handleReplay = () => {
    setCards(generateCards());
    setFlippedCardIndex(null);
    setMatchedIndexes([]);
    setPairsFound(0);
    setGameFinished(false);
    setShowReplayButton(false);
    setTimer(10);
    setShowCards(true);
  };

  const changeDifficulty = (level) => {
    setDifficulty(level);
    handleReplay();
  };

  const handleBackToLevelSelection = () => {
    setDifficulty(null);
    setCards([]);
    setFlippedCardIndex(null);
    setMatchedIndexes([]);
    setPairsFound(0);
    setGameFinished(false);
    setShowReplayButton(false);
    setTimer(10);
    setShowCards(true);
  };

  const renderCard = (card) => (
    <Col xs={difficulty === 'easy' ? 4 : 3} key={card.index} className="my-2">
      <Card className={`text-center game-card ${card.flipped ? 'flipped' : ''}`} onClick={() => handleClick(card.index)}>
        <Card.Body>
          <Card.Text>{card.flipped || card.matched ? card.icon : showCards ? card.icon : '?'}</Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Container className="memory-game-container">
      {!difficulty ? (
        <div className="text-center mt-3">
          <h2 className="game-title">Select Difficulty</h2>
          <Button variant="info" onClick={() => changeDifficulty('easy')}>Easy</Button>{' '}
          <Button variant="warning" onClick={() => changeDifficulty('medium')}>Medium</Button>{' '}
          <Button variant="danger" onClick={() => changeDifficulty('hard')}>Hard</Button>
        </div>
      ) : (
        <>
          <Button variant="secondary" onClick={handleBackToLevelSelection} className="back-button">
            ← Back to Levels
          </Button>
          <h2 className="text-center mt-3 game-title">Memory Game</h2>
          <Row className="justify-content-center">
            {cards.map((card) => renderCard(card))}
          </Row>
          <div className="text-center mt-3 game-info">
            {pairsFound === cards.length / 2 && gameFinished ? (
              <div className="game-finished">
                <h3>Congratulations, you have found all the pairs!</h3>
                <audio autoPlay>
                  <source src={congratulationsSound} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                {showReplayButton && (
                  <Button variant="primary" onClick={handleReplay}>Replay</Button>
                )}
              </div>
            ) : (
              showCards ? (
                <p>Time remaining: {timer} seconds</p>
              ) : null
            )}
          </div>
        </>
      )}
    </Container>
  );
};

export default MemoryGame;
