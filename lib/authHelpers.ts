import { User } from '@supabase/supabase-js'
import { UserProfile, saveUserProfile, getAllUsers } from '@/lib/storage'

/**
 * Maps a Supabase user to a UserProfile
 * @param supabaseUser The Supabase user object
 * @returns A UserProfile object
 */
export function mapSupabaseUserToProfile(supabaseUser: User): UserProfile {
  // Check if user already exists in localStorage
  const existingUsers = getAllUsers()
  const existingUser = existingUsers.find(u => u.id === supabaseUser.id)
  
  if (existingUser) {
    return existingUser
  }
  
  // Extract email username part or use a default
  const emailUsername = supabaseUser.email?.split('@')[0] || `user_${supabaseUser.id.substring(0, 8)}`
  
  // Create a new profile for the user
  const newProfile: UserProfile = {
    id: supabaseUser.id,
    username: emailUsername,
    displayName: emailUsername,
    bio: "I'm a new Rigeo user!",
    quote: "",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${supabaseUser.id}`,
    social: {
      x: "",
      github: "",
      website: "",
      linkedin: ""
    },
    projects: [],
    links: [],
    interests: [],
    views: 0,
    upvotes: 0,
    rank: 0,
    createdAt: Date.now(),
    badges: [],
    streak: 0,
    lastActiveDate: Date.now(),
    lastSeenDate: new Date().toISOString().split('T')[0],
    dailyViews: [],
    dailyUpvotes: [],
    schemaVersion: 4,
    followers: [],
    following: [],
    xp: 0,
    level: 1,
    referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    referralCount: 0,
    hideLocation: false,
    themePreference: "light",
    dailyStats: [],
    achievements: [],
    streakFreezes: 0,
    featuredCount: 0,
    firstUpvoteReceived: false,
    linkMasterUnlocked: false,
    earlyAdopter: true, // First time users get this badge
    hallOfFamer: false,
    creativeUnlocked: false,
    connectedUnlocked: false,
    quickRiseUnlocked: false,
    hotStreakUnlocked: false,
    rareBadges: []
  }
  
  // Save the new profile
  saveUserProfile(newProfile, true)
  
  return newProfile
}