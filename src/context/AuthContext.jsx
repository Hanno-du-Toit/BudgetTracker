import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '@/services/supabase'
import { mapErrorToFriendly } from '@/utils/errorMessages'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,           setUser]           = useState(null)
  const [profile,        setProfile]        = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  const fetchProfile = useCallback(async (userId) => {
    setProfileLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
    setProfileLoading(false)
  }, [])

  useEffect(() => {
    // Resolve the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: mapErrorToFriendly(error) }
    return {}
  }

  async function signUp(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) return { error: mapErrorToFriendly(error) }

    // If email confirmation is disabled, session is available immediately.
    // The trigger in Supabase creates the profile row automatically.
    // If confirmation is required, data.session is null and the user sees
    // a "check your email" screen.
    return { requiresConfirmation: !data.session }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function sendPasswordReset(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) return { error: mapErrorToFriendly(error) }
    return {}
  }

  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { error: mapErrorToFriendly(error) }
    return {}
  }

  async function updateProfile(updates) {
    if (!user) return { error: 'Not authenticated.' }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (error) return { error: mapErrorToFriendly(error) }
    setProfile(data)
    return {}
  }

  async function reauthenticate(password) {
    if (!user) return { error: 'Not authenticated.' }
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    })
    if (error) return { error: mapErrorToFriendly(error) }
    return {}
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      profileLoading,
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
      updatePassword,
      updateProfile,
      reauthenticate,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
