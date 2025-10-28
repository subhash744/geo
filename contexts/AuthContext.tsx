'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { mapSupabaseUserToProfile } from '@/lib/authHelpers'
import { setCurrentUser } from '@/lib/storage'
import { useRouter } from 'next/navigation'

type AuthContextType = {
  user: User | null
  signUp: (email: string, password: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        // Map Supabase user to profile and set as current user
        const profile = mapSupabaseUserToProfile(session.user)
        setCurrentUser(profile)
        
        // Check if user needs to complete profile (new user with default profile)
        const emailUsername = session.user.email?.split('@')[0] || ''
        const isNewUser = !profile.displayName || profile.displayName === emailUsername || profile.displayName.startsWith('User ')
        if (isNewUser) {
          // Small delay to ensure state is properly set
          setTimeout(() => {
            router.push('/profile-creation')
          }, 100)
        }
      }
      setLoading(false)
      
      // Listen for auth changes
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session?.user) {
            setUser(session.user)
            // Map Supabase user to profile and set as current user
            const profile = mapSupabaseUserToProfile(session.user)
            setCurrentUser(profile)
            
            // Check if user needs to complete profile (new user with default profile)
            const emailUsername = session.user.email?.split('@')[0] || ''
            const isNewUser = !profile.displayName || profile.displayName === emailUsername || profile.displayName.startsWith('User ')
            if (isNewUser) {
              // Small delay to ensure state is properly set
              setTimeout(() => {
                router.push('/profile-creation')
              }, 100)
            }
          } else {
            setUser(null)
          }
          setLoading(false)
        }
      )
      
      return () => {
        subscription.unsubscribe()
      }
    }
    
    checkSession()
    
    // Also check URL parameters for confirmation token
    const checkUrlParams = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      const type = urlParams.get('type')
      
      if (token && type === 'signup') {
        // Verify the token
        const { data, error } = await supabase.auth.verifyOtp({
          type: 'signup',
          token_hash: token,
        })
        
        if (!error && data?.user) {
          setUser(data.user)
          const profile = mapSupabaseUserToProfile(data.user)
          setCurrentUser(profile)
          router.push('/profile-creation')
        }
      }
    }
    
    // Check for confirmation parameters when component mounts
    checkUrlParams()
  }, [router])

  const signUp = async (email: string, password: string) => {
    // Check email domain restriction
    if (!email.endsWith('@gmail.com') && !email.endsWith('@icloud.com')) {
      return { error: { message: 'Only @gmail.com and @icloud.com email addresses are allowed.' } }
    }
    
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    return result
  }

  const signIn = async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    // If signin is successful, map the user to a profile
    if (result.data?.user) {
      const profile = mapSupabaseUserToProfile(result.data.user)
      setCurrentUser(profile)
    }
    
    return result
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}