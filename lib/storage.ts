import { 
  saveProfileToSupabase, 
  getProfileFromSupabase, 
  saveLeaderboardEntryToSupabase, 
  saveUpvoteToSupabase, 
  canUpvoteInSupabase, 
  saveDailyStatsToSupabase,
  getAllProfilesFromSupabase
} from '@/lib/supabaseDb'
import { User } from '@supabase/supabase-js'

export interface Project {
  id: string
  title: string
  description: string
  bannerUrl?: string
  link?: string
  upvotes: number
  views: number
  createdAt: number
}

export interface Goal {
  title: string
  description: string
  startedAt: number
  progressPercent: number
}

export interface Social {
  x?: string
  github?: string
  website?: string
  linkedin?: string
}

export interface UserProfile {
  id: string
  username: string
  displayName: string
  quote?: string
  bio: string
  avatar: string
  social: Social
  goal?: Goal
  projects: Project[]
  links: { title: string; url: string }[]
  interests: string[]
  views: number
  upvotes: number
  rank: number
  createdAt: number
  badges: string[]
  streak: number
  lastActiveDate: number
  lastSeenDate: string
  dailyViews: { date: string; count: number }[]
  dailyUpvotes: { date: string; count: number }[]
  schemaVersion: number
  location?: {
    lat: number
    lng: number
    city: string
    country: string
  }
  metrics?: {
    mapClicks: number
  }
  dailyChallenge?: {
    date: string
    completed: boolean
    prompt: string
  }
  followers: string[]
  following: string[]
  xp: number
  level: number
  referralCode: string
  referralCount: number
  hideLocation: boolean
  themePreference: "light" | "dark" | "gradient"
  dailyStats: { date: string; xp: number }[]
  achievements: string[]
  // New gamification fields
  streakFreezes: number
  featuredCount: number
  firstUpvoteReceived: boolean
  linkMasterUnlocked: boolean
  earlyAdopter: boolean
  hallOfFamer: boolean
  creativeUnlocked: boolean
  connectedUnlocked: boolean
  quickRiseUnlocked: boolean
  hotStreakUnlocked: boolean
  rareBadges: string[]
}

export interface DailyChallenge {
  id: string
  date: string
  prompt: string
  reward: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: number
}

export interface LeaderboardEntry {
  userId: string
  username: string
  displayName: string
  avatar: string
  rank: number
  score: number
  views: number
  upvotes: number
  streak: number
  badges: string[]
  projectCount: number
}

export interface AnalyticsData {
  totalViews: number
  totalUpvotes: number
  weeklyViews: number
  weeklyUpvotes: number
  streak: number
  badges: string[]
  dailyData: { date: string; views: number; upvotes: number }[]
  projectStats: { projectId: string; title: string; views: number; upvotes: number; ctr: number }[]
  // New analytics metrics
  engagementRate: number
  growthRate: number
  rankHistory: { date: string; rank: number }[]
  visitorRetention: number
  peakTimes: { hour: number; views: number }[]
  referralSources: { source: string; count: number }[]
  bestPerformingDay: string
  peakHour: string
  averageSession: string
}

const SCHEMA_VERSION = 4
export const getTodayDate = () => new Date().toISOString().split("T")[0]

// Cache for current user to avoid repeated fetches
let currentUserCache: UserProfile | null = null
let currentUserCacheTime: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const migrateUserSchema = (user: any): UserProfile => {
  if (user.schemaVersion === SCHEMA_VERSION) return user

  return {
    ...user,
    quote: user.quote || "",
    social: user.social || { x: "", github: "", website: "", linkedin: "" },
    goal: user.goal || undefined,
    projects: user.projects || [],
    dailyUpvotes: user.dailyUpvotes || user.dailyVotes || [],
    lastSeenDate: user.lastSeenDate || getTodayDate(),
    dailyViews: user.dailyViews || [],
    location: user.location || { lat: 0, lng: 0, city: "", country: "" },
    metrics: user.metrics || { mapClicks: 0 },
    dailyChallenge: user.dailyChallenge || undefined,
    followers: user.followers || [],
    following: user.following || [],
    xp: user.xp || 0,
    level: user.level || 1,
    referralCode: user.referralCode || generateReferralCode(),
    referralCount: user.referralCount || 0,
    hideLocation: user.hideLocation || false,
    themePreference: user.themePreference || "light",
    dailyStats: user.dailyStats || [],
    achievements: user.achievements || [],
    // New gamification fields
    streakFreezes: user.streakFreezes || 0,
    featuredCount: user.featuredCount || 0,
    firstUpvoteReceived: user.firstUpvoteReceived || false,
    linkMasterUnlocked: user.linkMasterUnlocked || false,
    earlyAdopter: user.earlyAdopter || false,
    hallOfFamer: user.hallOfFamer || false,
    creativeUnlocked: user.creativeUnlocked || false,
    connectedUnlocked: user.connectedUnlocked || false,
    quickRiseUnlocked: user.quickRiseUnlocked || false,
    hotStreakUnlocked: user.hotStreakUnlocked || false,
    rareBadges: user.rareBadges || [],
    schemaVersion: SCHEMA_VERSION,
  }
}

export const generateReferralCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const getDailyChallenge = (): DailyChallenge => {
  const today = getTodayDate()
  const challenges = [
    { prompt: "Add a new project today", reward: 50 },
    { prompt: "Update your goal", reward: 30 },
    { prompt: "Share your profile", reward: 40 },
    { prompt: "Engage with 3 profiles", reward: 60 },
    { prompt: "Complete your bio", reward: 25 },
  ]

  const seed = today.split("-").reduce((acc, part) => acc + Number.parseInt(part), 0)
  const challenge = challenges[seed % challenges.length]

  return {
    id: `challenge_${today}`,
    date: today,
    prompt: challenge.prompt,
    reward: challenge.reward,
  }
}

export const getAllUsers = (): UserProfile[] => {
  // This will be replaced with a proper implementation that fetches from Supabase
  // For now, we'll return an empty array since we're moving to pure cloud storage
  return []
}

export const getCurrentUser = (): UserProfile | null => {
  // This will be replaced with a proper implementation that fetches from Supabase
  // For now, we'll return null since we're moving to pure cloud storage
  return null
}

export const saveUserProfile = (user: UserProfile, setAsCurrent: boolean = false) => {
  // This will be replaced with a proper implementation that saves to Supabase
  // For now, we'll do nothing since we're moving to pure cloud storage
  return { success: true, data: null }
}

export const canUpvote = (userId: string, visitorId: string): boolean => {
  // This will be replaced with a proper implementation that checks Supabase
  // For now, we'll return true since we're moving to pure cloud storage
  return true
}

export const addUpvote = (userId: string, visitorId: string) => {
  // This will be replaced with a proper implementation that saves to Supabase
  // For now, we'll do nothing since we're moving to pure cloud storage
}

export const incrementViewCount = (userId: string) => {
  // This will be replaced with a proper implementation that saves to Supabase
  // For now, we'll do nothing since we're moving to pure cloud storage
}

export const getLeaderboard = (sortBy: "today" | "yesterday" | "all-time" | "newcomers"): LeaderboardEntry[] => {
  // This will be replaced with a proper implementation that fetches from Supabase
  // For now, we'll return an empty array since we're moving to pure cloud storage
  return []
}

export const addFollower = (userId: string, followerId: string): boolean => {
  // This will be replaced with a proper implementation that saves to Supabase
  // For now, we'll return true since we're moving to pure cloud storage
  return true
}

export const removeFollower = (userId: string, followerId: string): boolean => {
  // This will be replaced with a proper implementation that removes from Supabase
  // For now, we'll return true since we're moving to pure cloud storage
  return true
}

export const unlockAchievement = (userId: string, achievementId: string): boolean => {
  // This will be replaced with a proper implementation that saves to Supabase
  // For now, we'll return true since we're moving to pure cloud storage
  return true
}

export const addXP = (userId: string, amount: number): void => {
  // This will be replaced with a proper implementation that saves to Supabase
  // For now, we'll do nothing since we're moving to pure cloud storage
}

export const getAchievements = (): Achievement[] => {
  return [
    { id: "builder", name: "Builder", description: "Create your first project", icon: "🏗️" },
    { id: "consistent", name: "Consistent", description: "Maintain a 5-day streak", icon: "🔥" },
    { id: "top10", name: "Top 10", description: "Reach top 10 on leaderboard", icon: "🏆" },
    { id: "popular", name: "Popular", description: "Get 100 views", icon: "👥" },
    { id: "influencer", name: "Influencer", description: "Get 10 followers", icon: "⭐" },
    { id: "level5", name: "Level 5", description: "Reach level 5", icon: "📈" },
    { id: "referrer", name: "Referrer", description: "Refer 5 friends", icon: "🎁" },
  ]
}

export const calculateScore = (
  user: UserProfile,
  timeframe: "today" | "yesterday" | "all-time" | "newcomers" = "all-time",
): number => {
  let views = user.views
  let upvotes = user.upvotes
  const streak = user.streak
  const projectCount = user.projects.length

  if (timeframe === "today") {
    const today = getTodayDate()
    views = user.dailyViews.find((d) => d.date === today)?.count || 0
    upvotes = user.dailyUpvotes.find((d) => d.date === today)?.count || 0
  } else if (timeframe === "yesterday") {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    views = user.dailyViews.find((d) => d.date === yesterday)?.count || 0
    upvotes = user.dailyUpvotes.find((d) => d.date === yesterday)?.count || 0
  }

  const score = upvotes * 40 + views * 30 + streak * 20 + projectCount * 10
  return score
}

const normalizeScores = (scores: number[]): number[] => {
  if (scores.length === 0) return []
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  const range = max - min

  if (range === 0) {
    return scores.map(() => 0.5)
  }

  return scores.map((score) => (score - min) / range)
}

export const updateStreaks = () => {
  // This will be replaced with a proper implementation that updates Supabase
  // For now, we'll do nothing since we're moving to pure cloud storage
}

export const completeDailyChallenge = (userId: string): boolean => {
  // This will be replaced with a proper implementation that saves to Supabase
  // For now, we'll return false since we're moving to pure cloud storage
  return false
}

export const generateBadges = (user: UserProfile): string[] => {
  const badges: string[] = []

  // Tier badges based on upvotes
  if (user.upvotes >= 10) badges.push("Bronze")
  if (user.upvotes >= 50) badges.push("Silver")
  if (user.upvotes >= 200) badges.push("Gold")
  if (user.upvotes >= 10000) badges.push("Diamond")

  // View-based badges
  if (user.views >= 100) badges.push("Popular")
  if (user.views >= 500) badges.push("Trending")
  if (user.views >= 2000) badges.push("Viral")

  // Streak-based badges
  if (user.streak >= 3) badges.push("Consistent")
  if (user.streak >= 7) badges.push("Dedicated")
  if (user.streak >= 30) badges.push("Unstoppable")

  // Project-based badges
  if (user.projects.length >= 3) badges.push("Builder")
  if (user.projects.length >= 10) badges.push("Prolific")

  // New badges
  if (user.firstUpvoteReceived) badges.push("First Blood")
  if (user.links.length >= 5) {
    badges.push("Link Master")
    user.linkMasterUnlocked = true
  }
  if (user.earlyAdopter) badges.push("Early Adopter")
  if (user.featuredCount >= 3) badges.push("Hall of Famer")
  if (user.creativeUnlocked) badges.push("Creative")
  if (user.social && Object.values(user.social).filter(Boolean).length >= 4) {
    badges.push("Connected")
    user.connectedUnlocked = true
  }
  if (user.quickRiseUnlocked) badges.push("Quick Rise")
  if (user.hotStreakUnlocked) badges.push("Hot Streak")
  if (user.rareBadges && user.rareBadges.length > 0) {
    badges.push("Rare")
  }

  return [...new Set(badges)]
}

export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const getFeaturedBuilders = (): UserProfile[] => {
  // This will be replaced with a proper implementation that fetches from Supabase
  // For now, we'll return an empty array since we're moving to pure cloud storage
  return []
}

export const getUserAnalytics = (userId: string) => {
  // This will be replaced with a proper implementation that fetches from Supabase
  // For now, we'll return null since we're moving to pure cloud storage
  return null
}

export const resetAllData = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem("allUsers")
  localStorage.removeItem("currentUser")
  localStorage.removeItem("upvotes")
}

export const getStorageSchema = () => {
  if (typeof window === "undefined") return null
  const allUsers = getAllUsers()
  return {
    schemaVersion: SCHEMA_VERSION,
    totalUsers: allUsers.length,
    sampleUser: allUsers[0] || null,
    storageSize: new Blob([JSON.stringify(localStorage)]).size,
  }
}

export const incrementMapClicks = (userId: string) => {
  if (typeof window === "undefined") return
  const allUsers = getAllUsers()
  const user = allUsers.find((u) => u.id === userId)

  if (user) {
    if (!user.metrics) user.metrics = { mapClicks: 0 }
    user.metrics.mapClicks += 1
    saveUserProfile(user, user.id === getCurrentUser()?.id)
  }
}

export const updateUserLocation = (
  userId: string,
  location: { lat: number; lng: number; city: string; country: string },
) => {
  if (typeof window === "undefined") return false
  const allUsers = getAllUsers()
  const user = allUsers.find((u) => u.id === userId)

  if (user) {
    user.location = location
    saveUserProfile(user, true)
    return true
  }
  return false
}

export const getDisplayUsers = (): UserProfile[] => {
  const currentUser = getCurrentUser()
  const allUsers = getAllUsers()

  // If logged in, show real users
  if (currentUser) {
    return allUsers
  }

  // If logged out, show all mock users (they're already in allUsers from initialization)
  return allUsers
}

export const isUserLoggedIn = (): boolean => {
  return getCurrentUser() !== null
}

export const useStreakFreeze = (userId: string): boolean => {
  if (typeof window === "undefined") return false
  const allUsers = getAllUsers()
  const user = allUsers.find((u) => u.id === userId)

  if (user && user.streakFreezes > 0) {
    user.streakFreezes -= 1
    saveUserProfile(user, user.id === getCurrentUser()?.id)
    return true
  }
  return false
}

export const addStreakFreeze = (userId: string): void => {
  if (typeof window === "undefined") return
  const allUsers = getAllUsers()
  const user = allUsers.find((u) => u.id === userId)

  if (user && user.streak >= 7) {
    user.streakFreezes = (user.streakFreezes || 0) + 1
    saveUserProfile(user, user.id === getCurrentUser()?.id)
  }
}
