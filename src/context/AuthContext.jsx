import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase }     from '../lib/supabase'
import { fetchProfile } from '../lib/queries'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined = loading, null = logged out, object = active session
  const [session,     setSession]     = useState(undefined)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // Resolve initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null)
      if (session?.user) loadProfile(session.user.id)
    })

    // Keep in sync with Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setCurrentUser(null)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    try {
      const profile = await fetchProfile(userId)
      setCurrentUser(profile)
    } catch {
      // DB trigger may still be creating the profile row — retry once
      setTimeout(async () => {
        try {
          const profile = await fetchProfile(userId)
          setCurrentUser(profile)
        } catch (err) {
          console.error('Profile load failed:', err.message)
          setCurrentUser(null)
        }
      }, 1500)
    }
  }

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signup = useCallback(async ({ email, password, fullName, state, batch }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, state, batch } },
    })
    if (error) throw error
    return data
  }, [])

  const loginWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options:  { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) throw error
    return data
  }, [])

  const loginWithMagicLink = useCallback(async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) throw error
    return data
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id)
  }, [session])

  return (
    <AuthContext.Provider value={{
      session,
      currentUser,
      isLoading: session === undefined,
      login,
      signup,
      loginWithGoogle,
      loginWithMagicLink,
      logout,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
