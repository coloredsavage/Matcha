"use client"

import { useState, useEffect } from "react"
import { format, subDays } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface DailyScore {
  time: number
  moves: number
}

interface DailyScores {
  [date: string]: DailyScore
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}

export default function DailyStats() {
  const [dailyScores, setDailyScores] = useState<DailyScores>({})
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    // Check if localStorage is available
    if (typeof localStorage !== "undefined") {
      try {
        // Load scores from localStorage
        const scores = JSON.parse(localStorage.getItem("dailyScores") || "{}")
        setDailyScores(scores)

        // Load streak
        const currentStreak = Number.parseInt(localStorage.getItem("dailyStreak") || "0")
        setStreak(currentStreak)
      } catch (error) {
        console.error("Error loading data from localStorage", error)
      }
    }
  }, [])

  // Add a function to check if a date has a completed challenge
  const isDateCompleted = (date: string) => {
    return dailyScores[date] !== undefined
  }

  // Generate last 7 days for the chart
  const generateChartData = () => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd")
      const displayDate = format(subDays(new Date(), i), "MMM d")
      const score = dailyScores[date]

      data.push({
        date: displayDate,
        fullDate: date,
        moves: score?.moves || 0,
        time: score?.time || 0,
        completed: isDateCompleted(date),
      })
    }
    return data
  }

  const chartData = generateChartData()

  // Get recent scores for the table
  const recentScores = Object.entries(dailyScores)
    .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
    .slice(0, 5)
    .map(([date, score]) => ({
      date: format(new Date(date), "MMM d, yyyy"),
      moves: score.moves,
      time: score.time,
    }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {streak} {streak === 1 ? "day" : "days"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Challenges Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Object.keys(dailyScores).length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Best Time</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.values(dailyScores).length > 0 ? (
              <p className="text-3xl font-bold">
                {formatTime(Math.min(...Object.values(dailyScores).map((score) => score.time)))}
              </p>
            ) : (
              <p className="text-3xl font-bold">--:--</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Last 7 Days Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={({ x, y, payload }) => {
                    const isCompleted = chartData.find((item) => item.date === payload.value)?.completed
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={0}
                          dy={16}
                          textAnchor="middle"
                          fill={isCompleted ? "#8884d8" : "#666"}
                          fontWeight={isCompleted ? "bold" : "normal"}
                        >
                          {payload.value}
                        </text>
                      </g>
                    )
                  }}
                />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip
                  formatter={(value, name, props) => {
                    if (props.payload.completed) {
                      return [value, name]
                    }
                    return ["Not completed", name]
                  }}
                />
                <Bar yAxisId="left" dataKey="moves" name="Moves" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="time" name="Time (s)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          {recentScores.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Moves</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentScores.map((score, index) => (
                  <TableRow key={index}>
                    <TableCell>{score.date}</TableCell>
                    <TableCell>{score.moves}</TableCell>
                    <TableCell>{formatTime(score.time)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-4 text-muted-foreground">No challenges completed yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

