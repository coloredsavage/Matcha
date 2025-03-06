"use client"

import { BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StatsButtonProps {
  onClick: () => void
  className?: string
}

export default function StatsButton({ onClick, className = "" }: StatsButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={`stats-button ${className}`}
      onClick={onClick}
      title="View Daily Stats"
    >
      <BarChart3 className="h-4 w-4" />
      <span className="sr-only">View Daily Stats</span>
    </Button>
  )
}

