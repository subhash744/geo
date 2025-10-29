import { 
  saveProfileToSupabase, 
  getProfileFromSupabase, 
  saveLeaderboardEntryToSupabase, 
  saveUpvoteToSupabase, 
  canUpvoteInSupabase, 
  saveDailyStatsToSupabase,
  getAllProfilesFromSupabase,
  getUpvotesForUserFromSupabase,
  getDailyStatsFromSupabase,
  saveDailyViewsToSupabase,
  saveDailyUpvotesToSupabase,
  saveUserFollowerToSupabase,
  saveUserFollowingToSupabase,
  saveUserAchievementToSupabase,
  saveUserDailyStatsToSupabase
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

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const result = await getAllProfilesFromSupabase()
    if (result.success && result.data) {
      return result.data.map((profile: any) => migrateUserSchema(profile))
    }
    return []
  } catch (error) {
    console.error('Error fetching all users:', error)
    return []
  }
}

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    // In a real implementation, you would get the current user ID from the auth context
    // For now, we'll return null as this needs to be implemented properly
    return null
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

export const saveUserProfile = async (user: UserProfile, setAsCurrent: boolean = false) => {
  try {
    const result = await saveProfileToSupabase(user)
    return result
  } catch (error) {
    console.error('Error saving user profile:', error)
    return { success: false, error: 'Failed to save profile' }
  }
}

export const canUpvote = async (userId: string, visitorId: string): Promise<boolean> => {
  try {
    const result = await canUpvoteInSupabase(userId, visitorId)
    if (result.success) {
      return result.canUpvote ?? true
    }
    return true
  } catch (error) {
    console.error('Error checking upvote status:', error)
    return true
  }
}

export const addUpvote = async (userId: string, visitorId: string) => {
  try {
    await saveUpvoteToSupabase(userId, visitorId)
  } catch (error) {
    console.error('Error adding upvote:', error)
  }
}

export const incrementViewCount = async (userId: string) => {
  try {
    // This would need to be implemented with proper Supabase integration
    // For now, we'll just log that it should be implemented
    console.log(`Incrementing view count for user ${userId}`)
  } catch (error) {
    console.error('Error incrementing view count:', error)
  }
}

export const getLeaderboard = async (sortBy: "today" | "yesterday" | "all-time" | "newcomers"): Promise<LeaderboardEntry[]> => {
  try {
    // This would need to be implemented with proper Supabase integration
    // For now, we'll return an empty array
    return []
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }
}

export const addFollower = async (userId: string, followerId: string): Promise<boolean> => {
  try {
    const result = await saveUserFollowerToSupabase(userId, followerId)
    return result.success
  } catch (error) {
    console.error('Error adding follower:', error)
    return false
  }
}

export const removeFollower = async (userId: string, followerId: string): Promise<boolean> => {
  try {
    // This would need to be implemented with proper Supabase integration
    // For now, we'll return true
    return true
  } catch (error) {
    console.error('Error removing follower:', error)
    return false
  }
}

export const unlockAchievement = async (userId: string, achievementId: string): Promise<boolean> => {
  try {
    const result = await saveUserAchievementToSupabase(userId, achievementId)
    return result.success
  } catch (error) {
    console.error('Error unlocking achievement:', error)
    return false
  }
}

export const addXP = async (userId: string, amount: number): Promise<void> => {
  try {
    const today = getTodayDate()
    await saveUserDailyStatsToSupabase(userId, today, amount)
  } catch (error) {
    console.error('Error adding XP:', error)
  }
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

export const updateStreaks = async () => {
  try {
    // This would need to be implemented with proper Supabase integration
    // For now, we'll do nothing
  } catch (error) {
    console.error('Error updating streaks:', error)
  }
}

export const completeDailyChallenge = async (userId: string): Promise<boolean> => {
  try {
    // This would need to be implemented with proper Supabase integration
    // For now, we'll return false
    return false
  } catch (error) {
    console.error('Error completing daily challenge:', error)
    return false
  }
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

export const getFeaturedBuilders = async (): Promise<UserProfile[]> => {
  try {
    // This would need to be implemented with proper Supabase integration
    // For now, we'll return an empty array
    return []
  } catch (error) {
    console.error('Error fetching featured builders:', error)
    return []
  }
}

export const getUserAnalytics = async (userId: string) => {
  try {
    // This would need to be implemented with proper Supabase integration
    // For now, we'll return null
    return null
  } catch (error) {
    console.error('Error fetching user analytics:', error)
    return null
  }
}

export const resetAllData = async () => {
  // This would need to be implemented with proper Supabase integration
  // For now, we'll do nothing
}

export const getStorageSchema = async () => {
  // This would need to be implemented with proper Supabase integration
  // For now, we'll return null
  return null
}

export const incrementMapClicks = async (userId: string) => {
  // This would need to be implemented with proper Supabase integration
  // For now, we'll do nothing
}

export const updateUserLocation = async (
  userId: string,
  location: { lat: number; lng: number; city: string; country: string },
): Promise<boolean> => {
  // This would need to be implemented with proper Supabase integration
  // For now, we'll return false
  return false
}

export const getDisplayUsers = async (): Promise<UserProfile[]> => {
  try {
    const users = await getAllUsers()
    return users
  } catch (error) {
    console.error('Error fetching display users:', error)
    return []
  }
}

export const isUserLoggedIn = (): boolean => {
  // This would need to be implemented with proper auth integration
  // For now, we'll return false
  return false
}

export const useStreakFreeze = async (userId: string): Promise<boolean> => {
  // This would need to be implemented with proper Supabase integration
  // For now, we'll return false
  return false
}

export const addStreakFreeze = async (userId: string): Promise<void> => {
  // This would need to be implemented with proper Supabase integration
  // For now, we'll do nothing
}