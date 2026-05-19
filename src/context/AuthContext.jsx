import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '@/services/supabase'
import { mapErrorToFriendly } from '@/utils/errorMessages'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,           setUser]           = useState(null)
  const [profile,        setProfile]        = useState(null)
  const [loading,        setLoading]        = useState(true)
  // Start true so protected pages always show a skeleton until the first fetch completes.
  const [profileLoading, setProfileLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    setProfileLoading(true)
    // maybeSingle() returns null data (not an error) when no row exists.
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (data) setProfile(data)
    setProfileLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        // No session — nothing to fetch, release the skeleton immediately.
        setProfileLoading(false)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setProfileLoading(false)
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
      // window.location.origin resolves to the current host automatically
      // (localhost in dev, the Vercel URL in production).
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      console.error('[sendPasswordReset]', error)
      return { error: mapErrorToFriendly(error) }
    }
    return {}
  }

  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { error: mapErrorToFriendly(error) }
    return {}
  }

  async function updateProfile(updates) {
    if (!user) return { error: 'Not authenticated.' }
    // upsert handles the case where the profile row doesn't exist yet.
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates }, { onConflict: 'id' })
      .select()
      .maybeSingle()
    if (error) {
      console.error('[updateProfile]', error)
      return { error: mapErrorToFriendly(error) }
    }
    // Merge returned fields into local state so unrelated columns aren't lost.
    if (data) setProfile((prev) => ({ ...prev, ...data }))
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
