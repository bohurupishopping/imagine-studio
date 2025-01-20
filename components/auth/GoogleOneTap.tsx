"use client"

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            prompt_parent_id: string
            auto_select: boolean
            cancel_on_tap_outside: boolean
          }) => void
          prompt: (callback: (notification: {
            isNotDisplayed: () => boolean
            isSkippedMoment: () => boolean
          }) => void) => void
        }
      }
    }
  }
}

export const GoogleOneTap = () => {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const initializeGoogleOneTap = async () => {
      // Load Google One-Tap script
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.body.appendChild(script)

      script.onload = () => {
        // Initialize Google One-Tap
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!clientId) {
          console.error('Google Client ID is not configured')
          return
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            const { credential } = response
            
            // Sign in with Supabase
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: credential,
            })

            if (error) {
              console.error('Google One-Tap login error:', error)
              return
            }

            // Redirect after successful login
            router.refresh()
          },
          prompt_parent_id: 'google-one-tap',
          auto_select: true,
          cancel_on_tap_outside: false,
        })

        // Display the One-Tap prompt
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Handle cases where prompt isn't shown
            console.log('Google One-Tap prompt not shown')
          }
        })
      }
    }

    initializeGoogleOneTap()

    return () => {
      // Cleanup
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (script) {
        document.body.removeChild(script)
      }
    }
  }, [supabase, router])

  return (
    <div id="google-one-tap" className="w-full">
      <div className="flex justify-center">
        <div id="g_id_onload" className="w-full"></div>
      </div>
    </div>
  )
}
