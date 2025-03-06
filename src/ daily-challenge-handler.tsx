"use client"

import { useState, useEffect } from "react"
import { format, isYesterday, parseISO } from "date-fns"

interface DailyScore {
  time: number
  moves: number
}

interface DailyScores {
  [date: string]: DailyScore
}

export function useDailyChallenge() {
  const [dailyScores, setDailyScores] = useState<DailyScores>({})
  const [dailyStreak, setDailyStreak] = useState(0)
  const [isTodayCompleted, setIsTodayCompleted] = useState(false)

  // Load data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedScores = JSON.parse(localStorage.getItem("dailyScores") || "{}")
        setDailyScores(storedScores)

        const storedStreak = Number(localStorage.getItem("dailyStreak") || "0")
        setDailyStreak(storedStreak)

        // Check if today's challenge is already completed
        const today = format(new Date(), "yyyy-MM-dd")
        setIsTodayCompleted(!!storedScores[today])
      } catch (error) {
        console.error("Error loading daily challenge data:", error)
      }
    }
  }, [])

  // Function to save a completed daily challenge
  const saveDailyChallenge = (time: number, moves: number) => {
    const today = format(new Date(), "yyyy-MM-dd")

    // Update scores
    const newScores = {
      ...dailyScores,
      [today]: { time, moves },
    }
    setDailyScores(newScores)
    localStorage.setItem("dailyScores", JSON.stringify(newScores))

    // Update streak
    let newStreak = dailyStreak

    // Check if there was a previous completion
    const dates = Object.keys(dailyScores).sort()
    const lastCompletionDate = dates.length > 0 ? dates[dates.length - 1] : null

    if (lastCompletionDate) {
      // If yesterday's challenge was completed, increment streak
      if (isYesterday(parseISO(lastCompletionDate))) {
        newStreak += 1
      }
      // If today's challenge was already completed, keep streak the same
      else if (lastCompletionDate === today) {
        // Streak stays the same
      }
      // Otherwise (gap in days), reset streak to 1
      else {
        newStreak = 1
      }
    } else {
      // First ever completion
      newStreak = 1
    }

    setDailyStreak(newStreak)
    localStorage.setItem("dailyStreak", newStreak.toString())
    setIsTodayCompleted(true)

    return newStreak
  }

  return {
    dailyScores,
    dailyStreak,
    isTodayCompleted,
    saveDailyChallenge,
  }
}

