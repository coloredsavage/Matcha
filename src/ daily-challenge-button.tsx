"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"

interface DailyChallengeButtonProps {
  onClick: () => void
  className?: string
}

export default function DailyChallengeButton({ onClick, className = "" }: DailyChallengeButtonProps) {
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const dailyScores = JSON.parse(localStorage.getItem("dailyScores") || "{}")
        const today = format(new Date(), "yyyy-MM-dd")
        setIsCompleted(!!dailyScores[today])
      } catch (error) {
        console.error("Error checking daily challenge status:", error)
      }
    }
  }, [])

  return (
    <button
      className={`daily-challenge-btn ${isCompleted ? "completed" : "available"} ${className}`}
      onClick={onClick}
      disabled={isCompleted}
    >
      {isCompleted ? "Daily Challenge Completed" : "Daily Challenge"}
    </button>
  )
}

