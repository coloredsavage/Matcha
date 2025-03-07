"use client"
import { useRef, useState, useEffect, useCallback } from "react"
import Card from "./Card"
import Modal from "./Modal"
import NavBar from "./NavBar"
import Confetti from "react-confetti"
import "./App.css"
import logo from "./MATCHA.svg"
import flipSound from "./sounds/card-flip.mp3"
import matchSound from "./sounds/right-card.mp3"
import wrongMatchSound from "./sounds/wrong-card.mp3"
import winSound from "./sounds/game-win.mp3"
import loseSound from "./sounds/game-lost.mp3"
import seedrandom from "seedrandom"
import SharePanel from "./SharePanel"
import MailchimpModal from "./MailchimpModal"

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
          numberOfPieces={2000}
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

const flipAudio = new Audio(flipSound)
const matchAudio = new Audio(matchSound)
const wrongMatchAudio = new Audio(wrongMatchSound)
const winAudio = new Audio(winSound)
const loseAudio = new Audio(loseSound)

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
  const [isMuted, setIsMuted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [moveHistory, setMoveHistory] = useState([])

  // State variables for pausing
  const [gamePaused, setGamePaused] = useState(false)
  const [pauseStartTime, setPauseStartTime] = useState(null)
  const [totalPausedTime, setTotalPausedTime] = useState(0)

  const [isDailyChallenge, setIsDailyChallenge] = useState(false)
  const [showDailyResults, setShowDailyResults] = useState(false)
  const [moveCount, setMoveCount] = useState(0)
  const [dailyStreak, setDailyStreak] = useState(0)

  // Update the state variable for share panel
  const [showSharePanel, setShowSharePanel] = useState(false)

  // Add this state variable at the top of the App component
  const [showMailchimpModal, setShowMailchimpModal] = useState(false)
  const [hasPlayedGame, setHasPlayedGame] = useState(false)

  // Add this helper function inside the App component
  const isMobileDevice = () => {
    return window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  }

  // Add this function to handle the signup button click in the footer
  const handleSignupClick = (e) => {
    e.preventDefault()
    setShowMailchimpModal(true)
  }

  // Modify the initializeGame function to check if the user has played a game before
  const initializeGame = useCallback(() => {
    // If the user has already played a game, show the Mailchimp modal
    if (hasPlayedGame && !localStorage.getItem("mailchimpModalShown")) {
      setShowMailchimpModal(true)
      localStorage.setItem("mailchimpModalShown", "true")
      return
    }

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
          symbols = ["🎨", "🖌️", "🎭", "🖼️", "📐", "✏️", "💖", "📏"]
          break
        case "hard":
          symbols = ["🎨", "🖌️", "🎭", "🖼️", "📐", "✏️", "💖", "📏"]
          break
        default:
          symbols = ["🎨", "🖌️", "🎭", "🖼️", "📐", "✏️", "💖", "📏"]
      }
    }
    const pairs = [...symbols, ...symbols]

    // Use seedrandom for daily challenge
    let shuffled
    if (isDailyChallenge) {
      const today = new Date().toISOString().split("T")[0] // Get today's date in YYYY-MM-DD format
      const rng = seedrandom(today)
      shuffled = pairs.sort(() => rng() - 0.5)
    } else {
      shuffled = pairs.sort(() => Math.random() - 0.5)
    }

    setCards(shuffled)
    setFlipped(memoryMode || difficulty === "easy" || isDailyChallenge ? [...Array(shuffled.length).keys()] : [])
    setMatched([])
    setCompletionTime(null)
    setElapsedTime(0)
    setGameStarted(true)
    setGameLost(false)
    setTimeRemaining(hardModeTimeLimit * 1000)
    setStartTime(null)
    setMoveCount(0) // Reset move count

    if (memoryMode || difficulty === "easy" || isDailyChallenge) {
      setTimeout(() => {
        setFlipped([])
        setStartTime(new Date())
      }, 1000)
    } else {
      setStartTime(new Date())
    }
  }, [difficulty, memoryMode, memoryGrid, hardModeTimeLimit, isDailyChallenge, hasPlayedGame])

  useEffect(() => {
    if (gameStarted) {
      initializeGame()
    }
  }, [gameStarted, initializeGame])

  const formatTime = (time, isHardMode = false) => {
    // If game is completed, don't allow time to increase beyond completion time
    if (completionTime !== null && !isHardMode) {
      time = Math.min(time, completionTime * 1000)
    }

    const roundedTime = Math.round(time) // Remove rounding to the nearest second
    const hours = Math.floor(roundedTime / 3600000)
    const minutes = Math.floor((roundedTime % 3600000) / 60000)
    const seconds = Math.floor((roundedTime % 60000) / 1000)
    const milliseconds = roundedTime % 1000

    let timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.<span class="milliseconds">${milliseconds.toString().padStart(3, "0")}</span>`

    if (hours > 0) {
      timeString = `${hours.toString().padStart(2, "0")}:${timeString}`
    }

    if (isHardMode && Math.floor(roundedTime / 1000) <= 10) {
      return `<span class="text-red-500">${timeString}</span>`
    }
    return timeString
  }

  useEffect(() => {
    let timer
    if (
      startTime &&
      matched.length < cards.length &&
      !gamePaused &&
      !showDailyResults &&
      completionTime === null &&
      gameStarted
    ) {
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
  }, [
    startTime,
    matched.length,
    cards.length,
    difficulty,
    hardModeTimeLimit,
    gamePaused,
    totalPausedTime,
    showDailyResults,
    completionTime,
    gameStarted,
  ])
  // Update all audio playback instances to include mobile check
  const handleClick = (index) => {
    if (flipped.length < 2 && !flipped.includes(index)) {
      if (!isMobileDevice()) flipAudio.play() // Modified
      setFlipped([...flipped, index])
    }
  }

  // In the useEffect for flipped cards
  useEffect(() => {
    if (flipped.length === 2) {
      setMoveCount((prevCount) => prevCount + 1) // Increment move count
      const [first, second] = flipped

      if (cards[first] === cards[second]) {
        setMatched([...matched, first, second])
        setMoveHistory((prev) => [...prev, "✅"]) // Add success move
        if (!isMuted && !isMobileDevice()) matchAudio.play() // Play match sound
      } else {
        setMoveHistory((prev) => [...prev, "❌"]) // Add wrong move
        if (!isMuted && !isMobileDevice()) wrongMatchAudio.play() // Play wrong match sound
      }

      setTimeout(() => setFlipped([]), 500)
    }
  }, [flipped, cards, isMuted])

  // Modify the useEffect for matched cards to set hasPlayedGame to true when a game is completed
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      if (!isMuted && !isMobileDevice()) winAudio.play() // Modified
      const endTime = new Date()
      const timeTaken = (endTime - startTime - totalPausedTime) / 1000
      setCompletionTime(timeTaken)
      setHasPlayedGame(true) // Set hasPlayedGame to true when a game is completed

      if (isDailyChallenge) {
        // Save daily challenge completion
        try {
          const today = new Date().toISOString().split("T")[0]
          const dailyScores = JSON.parse(localStorage.getItem("dailyScores") || "{}")

          // Save today's score
          dailyScores[today] = { time: timeTaken, moves: moveCount }
          localStorage.setItem("dailyScores", JSON.stringify(dailyScores))

          // Save move history
          localStorage.setItem("dailyMoveHistory", JSON.stringify(moveHistory))

          // Update streak
          let streak = Number(localStorage.getItem("dailyStreak") || "0")

          // Check if yesterday's challenge was completed
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split("T")[0]

          if (dailyScores[yesterdayStr]) {
            streak += 1
          } else {
            streak = 1 // Reset streak if there was a gap
          }

          localStorage.setItem("dailyStreak", streak.toString())
          setDailyStreak(streak)
        } catch (error) {
          console.error("Error saving daily challenge completion:", error)
        }

        setShowDailyResults(true)
      } else {
        // Regular game logic
        const roundedTimeTaken = Math.ceil(timeTaken)
        if (bestTime === null || roundedTimeTaken < bestTime) {
          setBestTime(roundedTimeTaken)
        }
      }

      setConfettiRunning(true)
      setTimeout(() => setConfettiRunning(false), 8000)
    }
  }, [matched, cards.length, startTime, bestTime, isDailyChallenge, moveCount, totalPausedTime, isMuted])

  // In the useEffect for game lost
  useEffect(() => {
    if (gameLost) {
      if (!isMuted && !isMobileDevice()) loseAudio.play() // Modified
    }
  }, [gameLost, isMuted])

  const formatElapsedTime = (time) => {
    const minutes = Math.floor(time / 60000)
    const seconds = Math.floor((time % 60000) / 1000)
    const milliseconds = time % 1000
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(3, "0")}.<span class="milliseconds">${milliseconds.toString().padStart(3, "0")}</span>`
  }

  // Modify the toggleSound function to automatically mute on mobile
  const toggleSound = useCallback(() => {
    // Check if device is mobile
    const isMobile = window.innerWidth <= 768

    // If mobile, always set to muted
    const newMutedState = isMobile ? true : !isMuted
    setIsMuted(newMutedState)

    // Update audio volumes
    ;[flipAudio, matchAudio, wrongMatchAudio, winAudio, loseAudio].forEach((audio) => {
      audio.volume = newMutedState ? 0 : 1
    })

    // iOS audio priming (optional - only if needed)
    if (!newMutedState && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
      const primeAudio = () => {
        flipAudio
          .play()
          .then(() => {
            flipAudio.pause()
            flipAudio.currentTime = 0
          })
          .catch(console.error)
      }
      primeAudio()
    }
  }, [isMuted])

  // Modify the useEffect that checks for daily challenge data
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    const dailyScores = JSON.parse(localStorage.getItem("dailyScores") || "{}")
    const todayScore = dailyScores[today]

    // Check if the user was actively playing before the refresh
    const wasPlaying = localStorage.getItem("wasPlayingDailyChallenge") === "true"

    // Only show daily results if wasPlaying flag is true
    if (todayScore && wasPlaying) {
      setCompletionTime(todayScore.time)
      setMoveCount(todayScore.moves)

      // Load move history
      const savedMoveHistory = JSON.parse(localStorage.getItem("dailyMoveHistory") || "[]")
      setMoveHistory(savedMoveHistory)

      // Load streak
      const currentStreak = Number.parseInt(localStorage.getItem("dailyStreak") || "0")
      setDailyStreak(currentStreak)

      setShowDailyResults(true)
    } else {
      // Reset the "wasPlayingDailyChallenge" flag
      localStorage.removeItem("wasPlayingDailyChallenge")
    }
  }, [])

  // Also add a beforeunload event listener to clear the flag when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only keep the flag if the user completed the daily challenge
      if (!showDailyResults) {
        localStorage.removeItem("wasPlayingDailyChallenge")
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [showDailyResults])

  // Also add this effect to automatically mute on mobile when the component mounts
  useEffect(() => {
    const isMobile = window.innerWidth <= 768
    if (isMobile && !isMuted) {
      setIsMuted(true)

      // Set volume for all audio elements
      ;[flipAudio, matchAudio, wrongMatchAudio, winAudio, loseAudio].forEach((audio) => {
        audio.volume = 0
      })
    }
  }, [])

  const handleIcon1Click = () => {
    if (completionTime !== null || showDailyResults) {
      setShowInstructions(true)
    } else {
      setShowInstructions(true)
      setGamePaused(true)
      setPauseStartTime(new Date())
    }
  }

  const handleIcon2Click = () => {
    if (completionTime !== null || showDailyResults) {
      setShowModal(true)
    } else {
      setShowModal(true)
      setGamePaused(true)
      setPauseStartTime(new Date())
    }
  }

  useEffect(() => {
    // Set initial volume for all audio elements
    flipAudio.volume = isMuted ? 0 : 1
    matchAudio.volume = isMuted ? 0 : 1
    wrongMatchAudio.volume = isMuted ? 0 : 1
    winAudio.volume = isMuted ? 0 : 1
    loseAudio.volume = isMuted ? 0 : 1
  }, [isMuted])

  // Replace the isDailyChallengeAvailable function with this implementation
  const isDailyChallengeAvailable = () => {
    const today = new Date().toISOString().split("T")[0]
    try {
      const dailyScores = JSON.parse(localStorage.getItem("dailyScores") || "{}")
      return !dailyScores[today]
    } catch (error) {
      console.error("Error checking daily challenge availability:", error)
      return true
    }
  }

  // Update the handleShare function to toggle the share panel instead of just copying
  const handleShare = () => {
    if (completionTime === null) return
    setShowSharePanel(!showSharePanel)
  }

  // Add a function to close the share panel
  const closeSharePanel = () => {
    setShowSharePanel(false)
  }

  return (
    <div className={`App ${showDailyResults ? "daily-results-active" : ""}`}>
      <ConfettiEffect confettiRunning={confettiRunning} />

      {gameStarted && (
        <NavBar
          onIcon1Click={handleIcon1Click}
          onIcon2Click={handleIcon2Click}
          onIcon3Click={toggleSound}
          isMuted={isMuted}
        />
      )}
      {!gameStarted && <img src={logo || "/placeholder.svg"} alt="Matcha Logo" className="logo" />}
      {!gameStarted && <h2 className="landing-subheader">A Pretty Simple Matching Game</h2>}

      {!gameStarted && !gameLost && (
        <button onClick={() => setShowModal(true)} className="start-game-btn">
          Play
        </button>
      )}

      {gameStarted && !completionTime && (
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
          {isDailyChallenge && (
            <div className="move-counter">
              <h3>Moves: {moveCount}</h3>
            </div>
          )}
          <div
            className={`timer ${memoryMode ? "memory-mode-timer" : difficulty === "hard" ? "hard-mode-timer" : difficulty === "medium" ? "medium-mode-timer" : "easy-mode-timer"}`}
          >
            {difficulty === "hard" && <h3 className="time-remaining">TIME REMAINING</h3>}
            <h2
              dangerouslySetInnerHTML={{
                __html: difficulty === "hard" ? formatTime(timeRemaining, true) : formatTime(elapsedTime),
              }}
            />
            {bestTime !== null && (
              <h2 className="best-time" dangerouslySetInnerHTML={{ __html: formatTime(Math.ceil(bestTime * 1000)) }} />
            )}
          </div>
        </div>
      )}

      {gameLost && (
        <div className="lose-message-container">
          <div className="loser-emoji">😢</div>
          <h2>You Lost.</h2>
          <h3 style={{ fontFamily: "Groteska, sans-serif", fontSize: "12px" }}>Give it another shot!</h3>
          <button onClick={initializeGame} className="try-again-btn">
            Try Again
          </button>
          <button onClick={handleShare} className="share-btn">
            Share Results
          </button>
          {showSharePanel && (
            <SharePanel
              shareText={`MATCHA ❇️  
Moves: ${moveCount} | Time: ${Math.floor(completionTime / 60)}m ${Math.floor(completionTime % 60)}s | Mode: ${
                isDailyChallenge
                  ? "Daily Challenge"
                  : memoryMode
                    ? `Memory Mode (${memoryGrid})`
                    : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
              }  
${moveHistory.join(" ")} ⏳  
Can you beat my score? Play here: https://matcha-game.com`}
              url="https://matcha-game.com"
              onClose={closeSharePanel}
            />
          )}
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
                    setIsDailyChallenge(false)
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
                setIsDailyChallenge(false)
              }}
            >
              Memory Mode
            </button>
            <hr className="divider" />
            <button
              className="daily-challenge-btn"
              onClick={() => {
                // Check if player has already played today
                if (isDailyChallengeAvailable()) {
                  setDifficulty("medium")
                  setIsDailyChallenge(true)
                  localStorage.setItem("wasPlayingDailyChallenge", "true")
                  setShowModal(false)
                  setShowInstructions(true)
                } else {
                  // Show previous results instead of starting a new game
                  setShowModal(false)

                  // Load today's score data from localStorage
                  const today = new Date().toISOString().split("T")[0]
                  const dailyScores = JSON.parse(localStorage.getItem("dailyScores") || "{}")
                  const todayScore = dailyScores[today]

                  if (todayScore) {
                    setCompletionTime(todayScore.time)
                    setMoveCount(todayScore.moves)

                    // Load streak
                    const currentStreak = Number.parseInt(localStorage.getItem("dailyStreak") || "0")
                    setDailyStreak(currentStreak)

                    setShowDailyResults(true)
                  }
                }
              }}
            >
              {isDailyChallengeAvailable() ? "Daily Challenge" : "View Today's Results"}
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
            <div className="instructions-list">
              <p>Flip two cards to reveal their emojis.</p>
              <p>Match the pairs—if they match, they stay flipped!</p>
              <p>If they don't match, they flip back after a second.</p>
              <p>Clear the board as fast as you can to win!</p>
            </div>
            <h2>Game Modes:</h2>
            <div className="game-modes-list">
              <p>
                🟢 <strong>Easy:</strong> Cards preview before starting
              </p>
              <p>
                🟡 <strong>Medium:</strong> No preview
              </p>
              <p>
                🔴 <strong>Hard:</strong> Timed challenge
              </p>
              <p>
                🔥 <strong>Memory Mode:</strong> Larger grids
              </p>
            </div>
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

      {completionTime !== null && !isDailyChallenge && !showDailyResults && (
        <div className="completion-time">
          <h2 className="time-container">
            <span
              className="time-value"
              dangerouslySetInnerHTML={{ __html: formatTime(Math.ceil(completionTime * 1000)) }}
            />
            <span className="time-label">Completion Time</span>
          </h2>
          {bestTime !== null && (
            <h2 className="best-time" dangerouslySetInnerHTML={{ __html: formatTime(Math.ceil(bestTime * 1000)) }} />
          )}
          <button onClick={handleShare} className="share-btn">
            {showSharePanel ? "Hide Share Options" : "Share Results"}
          </button>
          {showSharePanel && (
            <SharePanel
              shareText={`MATCHA ❇️  
Moves: ${moveCount} | Time: ${Math.floor(completionTime / 60)}m ${Math.floor(completionTime % 60)}s | Mode: ${
                isDailyChallenge
                  ? "Daily Challenge"
                  : memoryMode
                    ? `Memory Mode (${memoryGrid})`
                    : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
              }  
${moveHistory.join(" ")}  
Can you beat my score? Play here: https://matcha-game.com`}
              url="https://matcha-game.com"
              onClose={closeSharePanel}
            />
          )}
        </div>
      )}

      {matched.length === cards.length && cards.length > 0 && !isDailyChallenge && (
        <div className="win-message-container">
          <div className="fire-emoji">🔥</div>
          <h2>{completionTime < bestTime ? "New Best!" : "You're on Fire!"}</h2>
          <div className="subheader">
            <p className="time-container">
              <span className="time-value" dangerouslySetInnerHTML={{ __html: formatTime(completionTime * 1000) }} />
              <span className="time-label">Completion Time</span>
            </p>
            <p className="time-container">
              <span className="time-value-best" dangerouslySetInnerHTML={{ __html: formatTime(bestTime * 1000) }} />
              <span className="time-label-best">Best Time</span>
            </p>
          </div>
          <button onClick={initializeGame} className="play-again-btn">
            Play Again
          </button>
          <button onClick={handleShare} className="share-btn">
            {showSharePanel ? "Hide Share Options" : "Share Results"}
          </button>
          {showSharePanel && (
            <SharePanel
              shareText={`MATCHA ❇️  
Moves: ${moveCount} | Time: ${Math.floor(completionTime / 60)}m ${Math.floor(completionTime % 60)}s | Mode: ${
                isDailyChallenge
                  ? "Daily Challenge"
                  : memoryMode
                    ? `Memory Mode (${memoryGrid})`
                    : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
              }  
${moveHistory.join(" ")}  
Can you beat my score? Play here: https://matcha-game.com`}
              url="https://matcha-game.com"
              onClose={closeSharePanel}
            />
          )}
        </div>
      )}

      {showDailyResults && (
        <Modal
          onClose={() => {
            setShowDailyResults(false)
          }}
          hideContent={true}
        >
          <div className="daily-results-container">
            <div className="fire-emoji">🏆</div>
            <h2>Daily Challenge Complete!</h2>
            <div className="subheader">
              <div className="time-container">
                <span className="time-value-moves">{moveCount}</span>
                <span className="time-label">Moves</span>
              </div>
              <div className="time-container">
                <span className="time-value" dangerouslySetInnerHTML={{ __html: formatTime(completionTime * 1000) }} />
                <span className="time-label">Time</span>
              </div>
              <div className="time-container">
                <span className="time-value-streak">{dailyStreak}🔥</span>
                <span className="time-label">Day Streak </span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowDailyResults(false)
                setGameStarted(false)
                setCompletionTime(null) // Reset the completion time
              }}
              className="play-again-btn"
            >
              Back to Menu
            </button>
            <button onClick={handleShare} className="share-btn">
              {showSharePanel ? "Hide Share Options" : "Share Results"}
            </button>
            {showSharePanel && (
              <SharePanel
                shareText={`MATCHA ❇️  
Moves: ${moveCount} | Time: ${Math.floor(completionTime / 60)}m ${Math.floor(completionTime % 60)}s | Mode: Daily Challenge  
${moveHistory.join(" ")}  
Can you beat my score? Play here: https://matcha-game.com`}
                url="https://matcha-game.com"
                onClose={closeSharePanel}
              />
            )}
          </div>
        </Modal>
      )}

      <footer>
        <p>
          © 2025 Matcha Game. All rights reserved. Made by{" "}
          <a href="https://www.x.com/colored_savage" target="_blank" rel="noopener noreferrer">
            Savage
          </a>{" "}
          |
          <a href="#" onClick={handleSignupClick}>
            {" "}
            Signup for Updates
          </a>
        </p>
      </footer>
      {showMailchimpModal && <MailchimpModal onClose={() => setShowMailchimpModal(false)} />}
    </div>
  )
}

export default App

