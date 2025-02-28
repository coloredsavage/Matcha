import { useRef, useState, useEffect, useCallback } from "react"
import Card from "./Card"
import Modal from "./Modal"
import NavBar from "./NavBar"
import confetti from "canvas-confetti";

const handleWin = () => {
  confetti(); // Simple confetti burst
};
import "./App.css"
import logo from "./MATCHA.svg"

// Moved ConfettiEffect component outside main App component
const ConfettiEffect = ({ confettiRunning }) => {
  const confettiAnchorRef = useRef(null)
  const [anchorPosition, setAnchorPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (confettiAnchorRef.current) {
      const rect = confettiAnchorRef.current.getBoundingClientRect()
      setAnchorPosition({
        x: rect.left,
        y: rect.top,
      })
    }
  }, []) // Empty dependency array for one-time calculation

  return (
    <>
      <div ref={confettiAnchorRef} style={{ 
        position: "absolute", 
        top: 0, 
        left: 0, 
        width: "100vw", 
        height: "1px" 
      }} />
      {confettiRunning && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={1000}
          gravity={0.05}
          wind={0}
          initialVelocityX={{ min: -5, max: 5 }}
          initialVelocityY={{ min: 3, max: 10 }}
          recycle={false}
          confettiSource={{
            x: anchorPosition.x,
            y: anchorPosition.y,
            w: window.innerWidth,
            h: 0,
          }}
        />
      )}
    </>
  )
}

function App() {
  // Game State (keep all existing state variables)
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [startTime, setStartTime] = useState(null)
  const [completionTime, setCompletionTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [bestTime, setBestTime] = useState(null)
  const [difficulty, setDifficulty] = useState("medium")
  const [memoryMode, setMemoryMode] = useState(false)
  const [memoryGrid, setMemoryGrid] = useState("4x4")
  const [hardModeTimeLimit, setHardModeTimeLimit] = useState(30)
  const [timeRemaining, setTimeRemaining] = useState(hardModeTimeLimit * 1000)
  const [gameLost, setGameLost] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showMemoryModal, setShowMemoryModal] = useState(false)
  const [confettiRunning, setConfettiRunning] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false) // New state variable for instructions modal

  // Create cards on start/reset
  const initializeGame = useCallback(() => {
    let symbols
    let gridSize
    if (memoryMode) {
      switch (memoryGrid) {
        case "4x4":
          gridSize = 8
          break
        case "4x5":
          gridSize = 10
          break
        case "4x6":
          gridSize = 12
          break
        case "4x7":
          gridSize = 14
          break
        default:
          gridSize = 8
      }
      symbols = Array.from({ length: gridSize }, (_, i) => String.fromCodePoint(0x1f3a8 + i))
    } else {
      switch (difficulty) {
        case "easy":
          symbols = ["🎨", "🖌️", "🎭", "🖼️", "📐", "✏️"] // 6 unique symbols for Easy mode (12 cards total)
          break
        case "medium":
          symbols = ["🎨", "🖌️", "🎭", "🖼️", "📐", "✏️", "🖋️", "📏"]
          break
        case "hard":
          symbols = ["🎨", "🖌️", "🎭", "🖼️", "📐", "✏️", "🖋️", "📏"]
          break
        default:
          symbols = ["🎨", "🖌️", "🎭", "🖼️", "📐", "✏️", "🖋️", "📏"]
      }
    }
    const pairs = [...symbols, ...symbols]
    const shuffled = pairs.sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setFlipped(memoryMode || difficulty === "easy" ? [...Array(shuffled.length).keys()] : []) // Flip all cards initially for Easy and Memory modes
    setMatched([])
    setCompletionTime(null)
    setElapsedTime(0)
    setGameStarted(true)
    setGameLost(false)
    setTimeRemaining(hardModeTimeLimit * 1000)
    setStartTime(null) // Reset startTime to null

    if (memoryMode || difficulty === "easy") {
      setTimeout(() => {
        setFlipped([])
        setStartTime(new Date()) // Start the timer after flipping back
      }, 1000) // Change this value to your desired duration in milliseconds
    } else {
      setStartTime(new Date())
    }
  }, [difficulty, memoryMode, memoryGrid, hardModeTimeLimit])

  // Initial game setup
  useEffect(() => {
    if (gameStarted) {
      initializeGame()
    }
  }, [gameStarted, initializeGame])

  // Update elapsed time every 10 milliseconds
  useEffect(() => {
    let timer
    if (startTime && matched.length < cards.length) {
      timer = setInterval(() => {
        const currentTime = new Date()
        const elapsed = currentTime - startTime
        setElapsedTime(elapsed)

        if (difficulty === "hard") {
          const remainingTime = hardModeTimeLimit * 1000 - elapsed
          setTimeRemaining(Math.max(remainingTime, 0))
          if (remainingTime <= 0) {
            clearInterval(timer)
            setGameLost(true)
            setGameStarted(false)
          }
        }
      }, 10)
    }
    return () => clearInterval(timer)
  }, [startTime, matched.length, cards.length, difficulty, hardModeTimeLimit])

  // Handle card click
  const handleClick = (index) => {
    if (flipped.length < 2 && !flipped.includes(index)) {
      setFlipped([...flipped, index])
    }
  }

  // Check matches
  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped
      if (cards[first] === cards[second]) {
        setMatched([...matched, first, second])
      }
      setTimeout(() => setFlipped([]), 500)
    }
  }, [flipped, cards])

  // Check win condition
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      const endTime = new Date()
      const timeTaken = (endTime - startTime) / 1000 // Time in seconds
      setCompletionTime(timeTaken)
      const roundedTimeTaken = Math.ceil(timeTaken) // Round up to the nearest second
      if (bestTime === null || roundedTimeTaken < bestTime) {
        setBestTime(roundedTimeTaken)
      }
      setConfettiRunning(true) // Start confetti
      setTimeout(() => setConfettiRunning(false), 4000) // Stop confetti after 3 seconds
    }
  }, [matched, cards.length, startTime, bestTime])

  // Format elapsed time
  const formatElapsedTime = (time) => {
    const minutes = Math.floor(time / 60000)
    const seconds = Math.floor((time % 60000) / 1000)
    const milliseconds = time % 1000
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.<span class="milliseconds">${milliseconds.toString().padStart(3, "0")}</span>`
  }

  return (
    <div className="App">
      {/* Confetti at root level */}
      <ConfettiEffect confettiRunning={confettiRunning} />
      
      {gameStarted && <NavBar />}
      {!gameStarted && <img src={logo || "/placeholder.svg"} alt="Matcha Logo" className="logo" />}
      {!gameStarted && <h2 className="landing-subheader">A Pretty Simple Matching Game</h2>}
      {/* Conditionally render the subheader */}
      {!gameStarted && !gameLost && (
        <>
          <button
            onClick={() => setShowModal(true)} // Open the modal
            className="start-game-btn"
          >
            Play
          </button>
        </>
      )}
      {gameStarted && !completionTime && (
        <>
          <div className="game-container">
            <div className={`grid ${memoryMode ? `memory-grid-${memoryGrid}` : `${difficulty}-grid`}`}>
              {cards.map((value, index) => {
                // Determine card status
                let status = ""

                // If card is matched
                if (matched.includes(index)) {
                  status = "matched"
                }
                // If card is part of current flipped pair and they don't match
                else if (flipped.includes(index) && flipped.length === 2) {
                  const [first, second] = flipped
                  if (cards[first] !== cards[second]) {
                    status = "unmatched"
                  }
                }

                return (
                  <Card
                    key={index}
                    value={value}
                    isFlipped={flipped.includes(index) || matched.includes(index)}
                    onClick={() => !matched.includes(index) && !flipped.includes(index) && handleClick(index)}
                    status={status}
                  />
                )
              })}
            </div>
            <div className="timer">
              <h2>
                <span className="main-time" dangerouslySetInnerHTML={{ __html: formatElapsedTime(elapsedTime) }} />
              </h2>
              {bestTime !== null && (
                <h2>
                  <span
                    className="best-time"
                    dangerouslySetInnerHTML={{ __html: formatElapsedTime(Math.ceil(bestTime * 1000)) }}
                  />
                </h2>
              )}
            </div>
          </div>
        </>
      )}
      {completionTime !== null && (
        <div className="completion-time">
          <h2 className="time-container">
            <span className="time-value">{completionTime.toFixed(2)}s</span>
            <span className="time-label">Completion Time</span>
          </h2>
        </div>
      )}
      {matched.length === cards.length && cards.length > 0 && (
        <div className="win-message-container">
          <div className="fire-emoji">🔥</div>
          <h2>You're on Fire!</h2>
          <div className="subheader">
            <p className="time-container">
              <span className="time-value">{completionTime !== null ? completionTime.toFixed(2) : "N/A"}s</span>
              <span className="time-label">Completion Time</span>
            </p>
            <p className="time-container">
              <span className="time-value-best">{bestTime !== null ? bestTime.toFixed(2) : "N/A"}s</span>
              <span className="time-label-best">Best Time</span>
            </p>
          </div>
          <button onClick={initializeGame} className="play-again-btn">
            Play Again
          </button>
        </div>
      )}
      {gameLost && (
        <div className="lose-message">
          <h2>😢 You Lost! 😢</h2>
          <button
            onClick={initializeGame}
            style={{
              padding: "10px 25px",
              fontSize: "1.1rem",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "15px",
            }}
          >
            Try Again
          </button>
        </div>
      )}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div>
            <img src={logo || "/placeholder.svg"} alt="Matcha Logo" className="logo" />
            <h2 style={{ fontFamily: "Groteska-Book, sans-serif", fontWeight: "400" }}>Select Your Difficulty</h2>
            <div className="difficulty-buttons">
              <button
                className="difficulty-btn"
                onClick={() => {
                  setDifficulty("easy")
                  setShowModal(false)
                  setShowInstructions(true) // Show instructions modal
                }}
              >
                Easy
              </button>
              <button
                className="difficulty-btn"
                onClick={() => {
                  setDifficulty("medium")
                  setShowModal(false)
                  setShowInstructions(true) // Show instructions modal
                }}
              >
                Medium
              </button>
              <button
                className="difficulty-btn"
                onClick={() => {
                  setDifficulty("hard")
                  setShowModal(false)
                  setShowInstructions(true) // Show instructions modal
                }}
              >
                Hard
              </button>
            </div>
            <hr className="divider" />
            <div className="memory-mode">
              <button
                className="memory-mode-btn"
                onClick={() => {
                  setShowModal(false)
                  setShowMemoryModal(true)
                }}
              >
                Memory Mode
              </button>
            </div>
          </div>
        </Modal>
      )}
      {showMemoryModal && (
        <Modal onClose={() => setShowMemoryModal(false)}>
          <div>
            <h2 style={{ fontFamily: "Groteska-Book, sans-serif", fontWeight: "400" }}>Select Your Difficulty</h2>
            <div className="memory-grid-selection">
              <button
                className="memory-grid-btn"
                onClick={() => {
                  setMemoryGrid("4x4")
                  setMemoryMode(true)
                  setShowMemoryModal(false)
                  setShowInstructions(true) // Show instructions modal
                }}
              >
                4x4
              </button>
              <button
                className="memory-grid-btn"
                onClick={() => {
                  setMemoryGrid("4x5")
                  setMemoryMode(true)
                  setShowMemoryModal(false)
                  setShowInstructions(true) // Show instructions modal
                }}
              >
                4x5
              </button>
              <button
                className="memory-grid-btn"
                onClick={() => {
                  setMemoryGrid("4x6")
                  setMemoryMode(true)
                  setShowMemoryModal(false)
                  setShowInstructions(true) // Show instructions modal
                }}
              >
                4x6
              </button>
              <button
                className="memory-grid-btn"
                onClick={() => {
                  setMemoryGrid("4x7")
                  setMemoryMode(true)
                  setShowMemoryModal(false)
                  setShowInstructions(true) // Show instructions modal
                }}
              >
                4x7
              </button>
            </div>
          </div>
        </Modal>
      )}
      {showInstructions && (
        <Modal onClose={() => setShowInstructions(false)}>
         <div className="instructions-container">
  <h2>How to Play</h2>
  <ul className="instructions-list">
    <li>Flip two cards to reveal their emojis.</li>
    <li>Match the pairs—if they match, they stay flipped!</li>
    <li>If they don’t match, they flip back after a second.</li>
    <li>Clear the board as fast as you can to win!</li>
  </ul>

  <h3>Game Modes:</h3>
  <ul className="game-modes-list">
    <li>🟢 <strong>Easy:</strong> Cards are briefly shown before the game starts.</li>
    <li>🟡 <strong>Medium:</strong> No preview—just pure memory skills!</li>
    <li>🔴 <strong>Hard:</strong> Timed mode—beat the clock!</li>
    <li>🔥 <strong>Insane Levels:</strong> Bigger grids, lesser time!</li>
  </ul>

  <button
    onClick={() => {
      setShowInstructions(false)
      setGameStarted(true)
    }}
    className="start-game-btn"
  >
    Start Game
  </button>
</div>
        </Modal>
      )}
      <footer>
        <p>© 2025 Matcha Game. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App