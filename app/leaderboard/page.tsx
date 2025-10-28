"use client"

import { useEffect } from "react"
import Navigation from "@/components/navigation"
import { updateStreaks } from "@/lib/storage"
import { ImprovedLeaderboard } from "@/components/improved-leaderboard"

export default function LeaderboardPage() {
  useEffect(() => {
    updateStreaks()
  }, [])

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3] flex flex-col">
      <Navigation />
      <ImprovedLeaderboard />
    </div>
  )
}
