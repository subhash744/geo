"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getLeaderboard, addUpvote, canUpvote } from "@/lib/storage"
import type { LeaderboardEntry } from "@/lib/storage"
import confetti from "canvas-confetti"

export function LandingLeaderboardPreview() {
  const router = useRouter()
  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>([])
  const [upvotedUsers, setUpvotedUsers] = useState<Set<string>>(new Set())
  const [animatingUpvotes, setAnimatingUpvotes] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const leaderboard = await getLeaderboard("all-time")
      setTopUsers(leaderboard.slice(0, 5))
    }
    fetchLeaderboard()
  }, [])

  const handleUpvote = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    const visitorId = "visitor_" + Math.random().toString(36).substr(2, 9)

    if (await canUpvote(userId, visitorId)) {
      await addUpvote(userId, visitorId)
      setUpvotedUsers(new Set([...upvotedUsers, userId]))

      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x: 0.5, y: 0.5 },
      })

      setAnimatingUpvotes(new Set([...animatingUpvotes, userId]))
      setTimeout(() => {
        setAnimatingUpvotes((prev: Set<string>) => {
          const next = new Set(prev)
          next.delete(userId)
          return next
        })
      }, 600)

      const leaderboard = await getLeaderboard("all-time")
      setTopUsers(leaderboard.slice(0, 5))
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-[#37322F] mb-4 font-bold">Live Leaderboard</h2>
          <p className="text-lg text-[#605A57]">See who's climbing the ranks right now</p>
        </motion.div>

        {topUsers.length > 0 ? (
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {topUsers.map((user, idx) => (
              <motion.div
                key={user.userId}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#F7F5F3] to-white rounded-lg border border-[#E0DEDB] hover:shadow-md transition cursor-pointer backdrop-blur-sm group"
                variants={itemVariants}
                onClick={() => router.push(`/profile/${user.userId}`)}
                whileHover={{ x: 4, backgroundColor: "rgba(247, 245, 243, 0.8)" }}
              >
                <div className="text-2xl font-bold text-[#37322F] w-8">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : user.rank}
                </div>
                <img src={user.avatar || "/placeholder.svg"} alt={user.displayName} className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <h3 className="font-semibold text-[#37322F]">{user.displayName}</h3>
                  <p className="text-sm text-[#605A57]">@{user.username}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#37322F]">{user.score.toFixed(0)}</div>
                  <div className="text-xs text-[#605A57]">{user.upvotes} upvotes</div>
                </div>

                <motion.button
                  onClick={(e: React.MouseEvent) => handleUpvote(user.userId, e)}
                  disabled={upvotedUsers.has(user.userId)}
                  className="ml-2 p-2 rounded-lg hover:bg-[#F7F5F3] transition disabled:opacity-50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={animatingUpvotes.has(user.userId) ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-xl">{upvotedUsers.has(user.userId) ? "❤️" : "🤍"}</span>
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center py-12"
          >
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-2xl font-semibold text-[#37322F] mb-2">No profiles yet</h3>
            <p className="text-[#605A57] mb-6">Be the first to create a profile and appear on the leaderboard!</p>
            <motion.button
              onClick={() => router.push("/profile-creation")}
              className="px-6 py-3 bg-[#37322F] text-white rounded-full font-medium hover:bg-[#2a2520] transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Your Profile
            </motion.button>
          </motion.div>
        )}

        <motion.button
          onClick={() => router.push("/leaderboard")}
          className="w-full mt-8 py-3 border border-[#E0DEDB] text-[#37322F] rounded-lg font-medium hover:bg-[#F7F5F3] transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          View Full Leaderboard
        </motion.button>
      </div>
    </section>
  )
}