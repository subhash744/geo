"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getFeaturedBuilders } from "@/lib/storage"
import type { UserProfile } from "@/lib/storage"

export function LandingShowcase() {
  const router = useRouter()
  const [featured, setFeatured] = useState<UserProfile[]>([])

  useEffect(() => {
    const builders = getFeaturedBuilders()
    setFeatured(builders)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-[#F7F5F3]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-[#37322F] mb-4 font-bold">Featured Profiles</h2>
          <p className="text-lg text-[#605A57]">Discover amazing creators in our community</p>
        </motion.div>

        {featured.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {featured.map((user: UserProfile) => (
              <motion.div
                key={user.id}
                className="p-6 bg-white rounded-lg border border-[#E0DEDB] hover:shadow-lg transition cursor-pointer backdrop-blur-sm group"
                variants={itemVariants}
                onClick={() => router.push(`/profile/${user.id}`)}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.displayName}
                  className="w-16 h-16 rounded-full mb-4 group-hover:ring-2 ring-[#37322F] transition"
                />
                <h3 className="font-semibold text-[#37322F] mb-1">{user.displayName}</h3>
                <p className="text-sm text-[#605A57] mb-3">@{user.username}</p>
                <p className="text-sm text-[#605A57] mb-4 line-clamp-2">{user.bio}</p>

                {user.location && (
                  <div className="text-xs text-[#605A57] mb-3 flex items-center gap-1">
                    <span>📍</span>
                    <span>
                      {user.location.city}, {user.location.country}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 mb-3 text-xs">
                  <div className="flex-1 bg-[#F7F5F3] p-2 rounded">
                    <p className="text-[#605A57]">Views</p>
                    <p className="font-semibold text-[#37322F]">{user.views}</p>
                  </div>
                  <div className="flex-1 bg-[#F7F5F3] p-2 rounded">
                    <p className="text-[#605A57]">Upvotes</p>
                    <p className="font-semibold text-[#37322F]">{user.upvotes}</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {user.badges.slice(0, 3).map((badge: string) => (
                    <span key={badge} className="text-xs bg-[#F7F5F3] text-[#37322F] px-2 py-1 rounded-full">
                      {badge}
                    </span>
                  ))}
                </div>
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
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-2xl font-semibold text-[#37322F] mb-2">No featured profiles yet</h3>
            <p className="text-[#605A57] mb-6">Create your profile to be featured in our community!</p>
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

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.button
            onClick={() => router.push("/leaderboard")}
            className="px-6 py-3 border border-[#37322F] text-[#37322F] rounded-full font-medium hover:bg-[#37322F] hover:text-white transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All Profiles
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}