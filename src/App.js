"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import Card from "./Card"
import Modal from "./Modal"
import NavBar from "./NavBar"
import Confetti from "react-confetti"
import "./App.css"
import logo from "./MATCHA.svg"

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
  }, [])

  return (
    <>
      <div
        ref={confettiAnchorRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "1px",
        }}
      />
      {confettiRunning && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={1000}
          gravity={0.05}
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
  const [showInstructions, setShowInstructions] = useState(false)
  const [gamePaused, setGamePaused] = useState(false)
  const [pauseStartTime, setPauseStartTime] = useState(null)
  const [totalPausedTime, setTotalPausedTime] = useState(0)

  const initializeGame = useCallback(() => {
    setTotalPausedTime(0)
    setPauseStartTime(null)

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
          symbols = ["🎨", "🖌️", "🎭", "🖼️", "📐", "✏️"]
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
    setFlipped(memoryMode || difficulty === "easy" ? [...Array(shuffled.length).keys()] : [])
    setMatched([])
    setCompletionTime(null)
    setElapsedTime(0)
    setGameStarted(true)
    setGameLost(false)

    if (difficulty === "hard") {
      setTimeRemaining(hardModeTimeLimit * 1000)
    } else {
      setTimeRemaining(0)
    }

    setStartTime(null)

    if (memoryMode || difficulty === "easy") {
      setTimeout(() => {
        setFlipped([])
        setStartTime(new Date())
      }, 1000)
    } else {
      setStartTime(new Date())
    }
  }, [difficulty, memoryMode, memoryGrid, hardModeTimeLimit])

  useEffect(() => {
    if (gameStarted) {
      initializeGame()
    }
  }, [gameStarted, initializeGame])

  useEffect(() => {
    let timer
    if (startTime && matched.length < cards.length && !gamePaused) {
      timer = setInterval(() => {
        const currentTime = new Date()
        const elapsed = currentTime - startTime - totalPausedTime
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
  }, [startTime, matched.length, cards.length, difficulty, hardModeTimeLimit, gamePaused, totalPausedTime])

  const handleClick = (index) => {
    if (flipped.length < 2 && !flipped.includes(index) && !gamePaused) {
      setFlipped([...flipped, index])
    }
  }

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped
      if (cards[first] === cards[second]) {
        setMatched([...matched, first, second])
      }
      setTimeout(() => setFlipped([]), 500)
    }
  }, [flipped, cards, matched])

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      const endTime = new Date()
      let timeTaken
      if (difficulty === "hard") {
        timeTaken = (hardModeTimeLimit * 1000 - timeRemaining) / 1000
      } else {
        timeTaken = (endTime - startTime - totalPausedTime) / 1000
      }
      setCompletionTime(timeTaken)
      const roundedTimeTaken = Math.ceil(timeTaken)
      if (difficulty !== "hard" && (bestTime === null || roundedTimeTaken < bestTime)) {
        setBestTime(roundedTimeTaken)
      }
      setConfettiRunning(true)
      setTimeout(() => setConfettiRunning(false), 4000)
    }
  }, [matched, cards.length, startTime, bestTime, difficulty, hardModeTimeLimit, timeRemaining, totalPausedTime])

  const formatTime = (time, isHardMode = false) => {
    const totalSeconds = Math.floor(time / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const milliseconds = Math.floor((time % 1000) / 10)
    const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.<span class="milliseconds">${milliseconds.toString().padStart(2, "0")}</span>`

    if (isHardMode && totalSeconds <= 10) {
      return `<span class="text-red-500">${timeString}</span>`
    }
    return timeString
  }

  const handleIcon1Click = () => {
    setShowInstructions(true)
    setGamePaused(true)
    setPauseStartTime(new Date())
  }

  const handleIcon2Click = () => {
    setShowModal(true)
    setGamePaused(true)
    setPauseStartTime(new Date())
  }

  return (
    <div className="App">
      <ConfettiEffect confettiRunning={confettiRunning} />

      {gameStarted && <NavBar onIcon1Click={handleIcon1Click} onIcon2Click={handleIcon2Click} />}
      {!gameStarted && <img src={logo || "/placeholder.svg"} alt="Matcha Logo" className="logo" />}
      {!gameStarted && <h2 className="landing-subheader">A Pretty Simple Matching Game</h2>}

      {!gameStarted && !gameLost && (
        <button onClick={() => setShowModal(true)} className="start-game-btn">
          Play
        </button>
      )}

      {gameStarted && !completionTime && !gamePaused && (
        <div className="game-container">
          <div className={`grid ${memoryMode ? `memory-grid-${memoryGrid}` : `${difficulty}-grid`}`}>
            {cards.map((value, index) => (
              <Card
                key={index}
                value={value}
                isFlipped={flipped.includes(index) || matched.includes(index)}
                onClick={() => !matched.includes(index) && !flipped.includes(index) && handleClick(index)}
                status={
                  matched.includes(index)
                    ? "matched"
                    : flipped.includes(index) && flipped.length === 2 && cards[flipped[0]] !== cards[flipped[1]]
                      ? "unmatched"
                      : ""
                }
              />
            ))}
          </div>
          <div className="timer">
            <h2
              dangerouslySetInnerHTML={{
                __html: difficulty === "hard" ? formatTime(timeRemaining, true) : formatTime(elapsedTime),
              }}
            />
            {bestTime !== null && difficulty !== "hard" && (
              <h2 dangerouslySetInnerHTML={{ __html: formatTime(Math.ceil(bestTime * 1000)) }} />
            )}
          </div>
        </div>
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
              <span className="time-value">{completionTime?.toFixed(2) || "N/A"}s</span>
              <span className="time-label">Completion Time</span>
            </p>
            <p className="time-container">
              <span className="time-value-best">{bestTime?.toFixed(2) || "N/A"}s</span>
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
          <button onClick={initializeGame} className="try-again-btn">
            Try Again
          </button>
        </div>
      )}

      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false)
            if (gamePaused) {
              const pauseDuration = new Date() - pauseStartTime
              setTotalPausedTime((prev) => prev + pauseDuration)
              setGamePaused(false)
            }
          }}
        >
          <div>
            <img src={logo || "/placeholder.svg"} alt="Matcha Logo" className="logo" />
            <h2 className="difficulty-heading">Select Your Difficulty</h2>
            <div className="difficulty-buttons">
              {["easy", "medium", "hard"].map((level) => (
                <button
                  key={level}
                  className="difficulty-btn"
                  onClick={() => {
                    setDifficulty(level)
                    setShowModal(false)
                    setShowInstructions(true)
                  }}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
            <hr className="divider" />
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
        </Modal>
      )}

      {showMemoryModal && (
        <Modal
          onClose={() => {
            setShowMemoryModal(false)
            if (gamePaused) {
              const pauseDuration = new Date() - pauseStartTime
              setTotalPausedTime((prev) => prev + pauseDuration)
              setGamePaused(false)
            }
          }}
        >
          <div>
            <h2>Select Grid Size</h2>
            <div className="memory-grid-selection">
              {["4x4", "4x5", "4x6", "4x7"].map((size) => (
                <button
                  key={size}
                  className="memory-grid-btn"
                  onClick={() => {
                    setMemoryGrid(size)
                    setMemoryMode(true)
                    setShowMemoryModal(false)
                    setShowInstructions(true)
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {showInstructions && (
        <Modal
          onClose={() => {
            setShowInstructions(false)
            if (gamePaused) {
              const pauseDuration = new Date() - pauseStartTime
              setTotalPausedTime((prev) => prev + pauseDuration)
              setGamePaused(false)
            }
          }}
        >
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
              <li>
                🟢 <strong>Easy:</strong> Cards preview before starting
              </li>
              <li>
                🟡 <strong>Medium:</strong> No preview
              </li>
              <li>
                🔴 <strong>Hard:</strong> Timed challenge
              </li>
              <li>
                🔥 <strong>Memory Mode:</strong> Larger grids
              </li>
            </ul>
            <button
              onClick={() => {
                setShowInstructions(false)
                setGameStarted(true)
                setGamePaused(false)
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