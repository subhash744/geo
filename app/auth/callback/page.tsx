'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthCallback() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // User is authenticated, redirect to profile creation
      router.push('/profile-creation')
    } else {
      // If for some reason user is not authenticated, redirect to home
      router.push('/')
    }
  }, [user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F3]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37322F] mx-auto mb-4"></div>
        <p className="text-[#37322F]">Confirming your email and redirecting...</p>
      </div>
    </div>
  )
}