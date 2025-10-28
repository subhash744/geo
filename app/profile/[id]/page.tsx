"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Navigation from "@/components/navigation"
import { ImprovedProfile } from "@/components/improved-profile"

export default function ProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3] flex flex-col">
      <Navigation />
      <ImprovedProfile userId={userId} />
    </div>
  )
}
