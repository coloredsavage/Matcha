import { useState, useEffect } from 'react';
import Card from './Card';
import './App.css';

function App() {
  // Game State
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [completionTime, setCompletionTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [bestTime, setBestTime] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [hardModeTimeLimit, setHardModeTimeLimit] = useState(30); // 30 seconds for Hard mode
  const [timeRemaining, setTimeRemaining] = useState(hardModeTimeLimit * 1000);
  const [gameLost, setGameLost] = useState(false);

  // Create cards on start/reset
  const initializeGame = () => {
    let symbols;
    switch (difficulty) {
      case 'easy':
        symbols = ['🎨', '🖌️', '🎭', '🖼️']; // Fewer symbols for Easy mode
        break;
      case 'medium':
        symbols = ['🎨', '🖌️', '🎭', '🖼️', '📐', '✏️', '🖋️', '📏'];
        break;
      case 'hard':
        symbols = ['🎨', '🖌️', '🎭', '🖼️', '📐', '✏️', '🖋️', '📏'];
        break;
      default:
        symbols = ['🎨', '🖌️', '🎭', '🖼️', '📐', '✏️', '🖋️', '📏'];
    }
    const pairs = [...symbols, ...symbols];
    const shuffled = pairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped(difficulty === 'easy' ? [...Array(shuffled.length).keys()] : []); // Flip all cards initially for Easy mode
    setMatched([]);
    setCompletionTime(null);
    setElapsedTime(0);
    setGameStarted(true);
    setGameLost(false);
    setTimeRemaining(hardModeTimeLimit * 1000);
    setStartTime(null); // Reset startTime to null
  
    if (difficulty === 'easy') {
      setTimeout(() => {
        setFlipped([]);
        setStartTime(new Date()); // Start the timer after flipping back
      }, 1000); // Change this value to your desired duration in milliseconds
    } else {
      setStartTime(new Date());
    }
  };

  // Initial game setup
  useEffect(() => {
    if (gameStarted) {
      initializeGame();
    }
  }, [gameStarted, difficulty]);

  // Update elapsed time every 10 milliseconds
  useEffect(() => {
    let timer;
    if (startTime && matched.length < cards.length) {
      timer = setInterval(() => {
        const currentTime = new Date();
        const elapsed = currentTime - startTime;
        setElapsedTime(elapsed);

        if (difficulty === 'hard') {
          const remainingTime = hardModeTimeLimit * 1000 - elapsed;
          setTimeRemaining(Math.max(remainingTime, 0));
          if (remainingTime <= 0) {
            clearInterval(timer);
            setGameLost(true);
            setGameStarted(false);
          }
        }
      }, 10);
    }
    return () => clearInterval(timer);
  }, [startTime, matched.length, cards.length, difficulty, hardModeTimeLimit]);

  // Handle card click
  const handleClick = (index) => {
    if (flipped.length < 2 && !flipped.includes(index)) {
      setFlipped([...flipped, index]);
    }
  };

  // Check matches
  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first] === cards[second]) {
        setMatched([...matched, first, second]);
      }
      setTimeout(() => setFlipped([]), 1000);
    }
  }, [flipped]);

  // Check win condition
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      const endTime = new Date();
      const timeTaken = (endTime - startTime) / 1000; // Time in seconds
      setCompletionTime(timeTaken);
      if (bestTime === null || timeTaken < bestTime) {
        setBestTime(timeTaken);
      }
    }
  }, [matched, cards.length, startTime, bestTime]);

  // Format elapsed time
  const formatElapsedTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = time % 1000;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  return (
    <div className="App">
      <h1>Designer Memory Game 🎮</h1>
      {gameStarted && difficulty === 'hard' && (
        <div className="timer">
          <h2>Time Remaining: 
            <span className="main-time">{formatElapsedTime(timeRemaining).split('.')[0]}</span>
            <span className="milliseconds">.{formatElapsedTime(timeRemaining).split('.')[1]}</span>
          </h2>
        </div>
      )}
      {gameStarted && difficulty !== 'hard' && (
        <div className="timer">
          <h2>
            <span className="main-time">{formatElapsedTime(elapsedTime).split('.')[0]}</span>
            <span className="milliseconds">.{formatElapsedTime(elapsedTime).split('.')[1]}</span>
          </h2>
        </div>
      )}
      {!gameStarted && !gameLost && (
        <>
          <div>
            <label>
              Select Difficulty:
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
          </div>
          <button 
            onClick={() => setGameStarted(true)}
            style={{
              padding: '10px 25px',
              fontSize: '1.1rem',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '15px'
            }}
          >
            Start Game
          </button>
        </>
      )}
      {gameStarted && (
        <>
          {bestTime !== null && (
            <div className="ghost-time">
              <h2>Best Time: {formatElapsedTime(bestTime * 1000)}</h2>
            </div>
          )}
          <div className="grid">
            {cards.map((value, index) => (
              <Card
                key={index}
                value={value}
                isFlipped={flipped.includes(index) || matched.includes(index)}
                onClick={() => handleClick(index)}
              />
            ))}
          </div>

          {completionTime !== null && (
            <div className="completion-time">
              <h2>Completion Time: {completionTime.toFixed(2)} seconds</h2>
            </div>
          )}

          {matched.length === cards.length && cards.length > 0 && (
            <div className="win-message">
              <h2>🎉 You Won! 🎉</h2>
              <button 
                onClick={initializeGame}
                style={{
                  padding: '10px 25px',
                  fontSize: '1.1rem',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginTop: '15px'
                }}
              >
                Play Again
              </button>
            </div>
          )}
        </>
      )}
      {gameLost && (
        <div className="lose-message">
          <h2>😢 You Lost! 😢</h2>
          <button 
            onClick={initializeGame}
            style={{
              padding: '10px 25px',
              fontSize: '1.1rem',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '15px'
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

export default App;