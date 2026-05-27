import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/context/ToastContext'
import { ROUTES, SLIDE_UP, STAGGER_CONTAINER, AVATAR_COLORS, CURRENCY_OPTIONS, DATE_FORMAT_OPTIONS, DEFAULT_CURRENCY, DEFAULT_DATE_FORMAT } from '@/constants'
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/constants/categories'
import { supabase } from '@/services/supabase'
import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const ADMIN_EMAIL = 'hanno.shark@gmail.com'

// ── Section card ───────────────────────────────────────────────────────────────

function SettingsSection({ title, description, children, badge }) {
  return (
    <motion.div variants={SLIDE_UP} className="card flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">{title}</h2>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-white/40 mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </motion.div>
  )
}

// ── Avatar preview ─────────────────────────────────────────────────────────────

function AvatarPreview({ color, initial }) {
  return (
    <motion.div
      animate={{ backgroundColor: color }}
      transition={{ duration: 0.2 }}
      className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
    >
      {initial}
    </motion.div>
  )
}

// ── Color swatch ───────────────────────────────────────────────────────────────

function ColorSwatch({ color, label, selected, onSelect }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => onSelect(color)}
      className="relative w-8 h-8 rounded-full transition-transform duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-surface-50"
      style={{ backgroundColor: color }}
    >
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold"
        >
          ✓
        </motion.span>
      )}
    </button>
  )
}

// ── Select field ───────────────────────────────────────────────────────────────

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-white/70">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-base w-full appearance-none pr-9 cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface-100">
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">
          ▾
        </span>
      </div>
    </div>
  )
}

// ── Profile section ────────────────────────────────────────────────────────────

function ProfileSection({ profile, user, onSave }) {
  // Show name from profile if available, otherwise empty so the user types it in.
  // Never fall back to the email address inside the input field.
  const savedName  = profile?.display_name ?? ''
  const savedColor = profile?.avatar_color  ?? AVATAR_COLORS[0].value
  const initial    = (profile?.display_name || user?.email || '?').charAt(0).toUpperCase()

  const [displayName, setDisplayName] = useState(savedName)
  const [avatarColor, setAvatarColor] = useState(savedColor)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')

  // Sync form fields when profile data arrives after the skeleton clears.
  useEffect(() => {
    setDisplayName(profile?.display_name ?? '')
    setAvatarColor(profile?.avatar_color  ?? AVATAR_COLORS[0].value)
  }, [profile])

  async function handleSave(e) {
    e.preventDefault()
    const trimmed = displayName.trim()
    if (!trimmed) { setError('Display name cannot be empty.'); return }
    if (trimmed.length > 50) { setError('Display name must be 50 characters or fewer.'); return }
    setError('')
    setSaving(true)
    const result = await onSave({ display_name: trimmed, avatar_color: avatarColor })
    setSaving(false)
    if (result?.error) setError(result.error)
  }

  const isDirty = displayName.trim() !== savedName || avatarColor !== savedColor

  return (
    <SettingsSection
      title="Profile"
      description="How you appear in the app."
    >
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* Avatar preview + color picker */}
        <div className="flex items-start gap-4">
          <AvatarPreview color={avatarColor} initial={initial} />
          <div className="flex flex-col gap-2">
            <span className="text-xs text-white/40">Avatar colour</span>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((c) => (
                <ColorSwatch
                  key={c.value}
                  color={c.value}
                  label={c.label}
                  selected={avatarColor === c.value}
                  onSelect={setAvatarColor}
                />
              ))}
            </div>
          </div>
        </div>

        <Input
          label="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          error={error}
          maxLength={50}
        />

        <div>
          <Button type="submit" isLoading={saving} disabled={!isDirty}>
            Save profile
          </Button>
        </div>
      </form>
    </SettingsSection>
  )
}

// ── Security section ───────────────────────────────────────────────────────────

function SecuritySection({ onChangePassword }) {
  const [currentPw, setCurrentPw] = useState('')
  const [newPw,     setNewPw]     = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [saving,    setSaving]    = useState(false)
  const [errors,    setErrors]    = useState({})

  function validate() {
    const e = {}
    if (!currentPw)          e.currentPw = 'Enter your current password.'
    if (newPw.length < 6)    e.newPw     = 'New password must be at least 6 characters.'
    if (newPw !== confirmPw) e.confirmPw = 'Passwords do not match.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setErrors({})
    setSaving(true)
    const result = await onChangePassword(currentPw, newPw)
    setSaving(false)
    if (result?.error) {
      setErrors({ currentPw: result.error })
    } else {
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    }
  }

  return (
    <SettingsSection
      title="Security"
      description="Update your password. You'll need your current password to confirm the change."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Current password"
          type="password"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
          placeholder="••••••••"
          error={errors.currentPw}
          autoComplete="current-password"
        />
        <Input
          label="New password"
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          placeholder="••••••••"
          error={errors.newPw}
          helperText="At least 6 characters."
          autoComplete="new-password"
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          placeholder="••••••••"
          error={errors.confirmPw}
          autoComplete="new-password"
        />
        <div>
          <Button type="submit" isLoading={saving}>
            Update password
          </Button>
        </div>
      </form>
    </SettingsSection>
  )
}

// ── Preferences section ────────────────────────────────────────────────────────

function PreferencesSection({ profile, onSave }) {
  const [currency,   setCurrency]   = useState(profile?.preferred_currency   ?? DEFAULT_CURRENCY)
  const [dateFormat, setDateFormat] = useState(profile?.preferred_date_format ?? DEFAULT_DATE_FORMAT)
  const [saving, setSaving]         = useState(false)
  const [error,  setError]          = useState('')

  // Sync when profile loads or changes (mirrors the same pattern in ProfileSection).
  useEffect(() => {
    setCurrency(profile?.preferred_currency   ?? DEFAULT_CURRENCY)
    setDateFormat(profile?.preferred_date_format ?? DEFAULT_DATE_FORMAT)
  }, [profile])

  const origCurrency   = profile?.preferred_currency   ?? DEFAULT_CURRENCY
  const origDateFormat = profile?.preferred_date_format ?? DEFAULT_DATE_FORMAT
  const isDirty        = currency !== origCurrency || dateFormat !== origDateFormat

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const result = await onSave({ preferred_currency: currency, preferred_date_format: dateFormat })
    setSaving(false)
    if (result?.error) setError(result.error)
  }

  return (
    <SettingsSection
      title="Preferences"
      description="Customise how amounts and dates are displayed."
    >
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <SelectField
          label="Currency"
          value={currency}
          onChange={setCurrency}
          options={CURRENCY_OPTIONS}
        />
        <SelectField
          label="Date format"
          value={dateFormat}
          onChange={setDateFormat}
          options={DATE_FORMAT_OPTIONS}
        />
        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        <div>
          <Button type="submit" isLoading={saving} disabled={!isDirty}>
            Save preferences
          </Button>
        </div>
      </form>
    </SettingsSection>
  )
}

// ── My Accounts section ────────────────────────────────────────────────────────

function MyAccountsSection() {
  const { toast }                     = useToast()
  const [accounts, setAccounts]       = useState([])
  const [nickname, setNickname]       = useState('')
  const [accNumber, setAccNumber]     = useState('')
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    supabase
      .from('user_accounts')
      .select('id, account_number, account_name')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setAccounts(data ?? [])
        setLoading(false)
      })
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    const trimName = nickname.trim()
    const rawNum   = accNumber.replace(/\s/g, '')
    if (!trimName) { setError('Enter an account nickname.'); return }
    if (!rawNum)   { setError('Enter an account number.'); return }
    setError('')
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSaving(false); setError('Not signed in — please refresh and try again.'); return }
    const { data, error: err } = await supabase
      .from('user_accounts')
      .insert({ user_id: session.user.id, account_number: rawNum, account_name: trimName })
      .select('id, account_number, account_name')
      .single()
    setSaving(false)
    if (err) {
      setError(err.message.includes('unique') ? 'That account number is already saved.' : err.message)
    } else {
      setAccounts((prev) => [...prev, data])
      setNickname('')
      setAccNumber('')
      toast.success('Account added.')
    }
  }

  async function handleDelete(id) {
    const { error: err } = await supabase.from('user_accounts').delete().eq('id', id)
    if (!err) {
      setAccounts((prev) => prev.filter((a) => a.id !== id))
      toast.success('Account removed.')
    }
  }

  return (
    <SettingsSection
      title="My Accounts"
      description="Transfers to/from these accounts will be categorized as Internal Transfer and excluded from your spending totals."
    >
      {!loading && accounts.length > 0 && (
        <ul className="flex flex-col gap-2">
          {accounts.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 bg-white/[0.04] rounded-xl px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-white">{a.account_name}</p>
                <p className="text-xs text-white/40 font-mono mt-0.5">{a.account_number}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(a.id)}
                className="text-xs text-white/30 hover:text-red-400 transition-colors shrink-0"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {!loading && accounts.length === 0 && (
        <p className="text-sm text-white/30">No accounts saved yet.</p>
      )}

      <form onSubmit={handleAdd} className="flex flex-col gap-3">
        <Input
          label="Account nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="e.g. ABSA Cheque"
          maxLength={60}
        />
        <Input
          label="Account number"
          value={accNumber}
          onChange={(e) => {
            const digits    = e.target.value.replace(/\D/g, '')
            const formatted = digits.match(/.{1,4}/g)?.join(' ') ?? ''
            setAccNumber(formatted)
          }}
          placeholder="e.g. 9218 1278 11"
          maxLength={24}
        />
        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        <div>
          <Button type="submit" isLoading={saving}>
            Add account
          </Button>
        </div>
      </form>
    </SettingsSection>
  )
}

// ── Keyword Approvals (admin only) ────────────────────────────────────────────

function KeywordApprovalsSection() {
  const { toast }                       = useToast()
  const [pending,    setPending]        = useState([])
  const [loading,    setLoading]        = useState(true)
  const [actingOn,   setActingOn]       = useState(null)  // pattern being acted on

  useEffect(() => {
    supabase
      .from('pending_keywords')
      .select('description_pattern, category, suggestion_count')
      .order('suggestion_count', { ascending: false })
      .then(({ data }) => {
        setPending(data ?? [])
        setLoading(false)
      })
  }, [])

  async function handleApprove(item) {
    setActingOn(item.description_pattern)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setActingOn(null); return }

    await supabase.from('global_keywords').upsert({
      description_pattern: item.description_pattern,
      category:            item.category,
      approved_by:         session.user.id,
      suggestion_count:    item.suggestion_count,
    }, { onConflict: 'description_pattern' })

    await supabase.from('pending_keywords').delete().eq('description_pattern', item.description_pattern)

    setPending((prev) => prev.filter((p) => p.description_pattern !== item.description_pattern))
    setActingOn(null)
    toast.success(`"${item.description_pattern}" approved and added to global keywords.`)
  }

  async function handleReject(item) {
    setActingOn(item.description_pattern)

    await supabase.from('pending_keywords').delete().eq('description_pattern', item.description_pattern)
    await supabase.from('keyword_suggestions').delete().eq('description_pattern', item.description_pattern)

    setPending((prev) => prev.filter((p) => p.description_pattern !== item.description_pattern))
    setActingOn(null)
    toast.success(`"${item.description_pattern}" rejected and removed.`)
  }

  const badge = !loading && pending.length > 0 ? (
    <span className="text-[10px] bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded-full font-semibold tabular-nums">
      {pending.length} pending
    </span>
  ) : null

  return (
    <SettingsSection
      title="Keyword Approvals"
      description="Community-suggested merchant patterns waiting for approval before being applied globally."
      badge={badge}
    >
      {loading ? (
        <div className="flex flex-col gap-2 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-white/[0.04] rounded-xl" />
          ))}
        </div>
      ) : pending.length === 0 ? (
        <p className="text-sm text-white/30">No pending keywords — the system is up to date ✅</p>
      ) : (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {pending.map((item) => {
              const isActing = actingOn === item.description_pattern
              const icon     = CATEGORY_ICONS[item.category] ?? '📦'
              const label    = CATEGORY_LABELS[item.category] ?? item.category

              return (
                <motion.li
                  key={item.description_pattern}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between gap-3 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-mono text-white/90 truncate">
                      {item.description_pattern}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/40">
                        {icon} {label}
                      </span>
                      <span className="text-[10px] text-white/25">·</span>
                      <span className="text-[10px] text-amber-400/70">
                        {item.suggestion_count} user{item.suggestion_count !== 1 ? 's' : ''} agreed
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => handleApprove(item)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ✅ Approve
                    </button>
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => handleReject(item)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
    </SettingsSection>
  )
}

// ── Danger zone ────────────────────────────────────────────────────────────────

function DangerZone({ onSignOut }) {
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await onSignOut()
  }

  return (
    <motion.div
      variants={SLIDE_UP}
      className="card flex flex-col gap-5 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.06)]"
    >
      <div>
        <h2 className="text-[10px] font-semibold text-red-400/70 uppercase tracking-widest">Danger zone</h2>
        <p className="text-sm text-white/40 mt-0.5">Irreversible actions — please be careful.</p>
      </div>
      <div className="flex items-center justify-between gap-4 py-1">
        <div>
          <p className="text-sm font-medium text-white/80">Sign out</p>
          <p className="text-xs text-white/40 mt-0.5">
            End your current session on this device.
          </p>
        </div>
        <Button variant="danger" size="sm" onClick={handleSignOut} isLoading={signingOut}>
          Sign out
        </Button>
      </div>
    </motion.div>
  )
}

// ── Page skeleton ──────────────────────────────────────────────────────────────

function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {[130, 200, 110, 80].map((h, i) => (
        <div key={i} className="card">
          <div className="h-3.5 w-24 bg-white/[0.06] rounded-full mb-3" />
          <div className="h-2.5 w-44 bg-white/[0.04] rounded-full mb-5" />
          <div className="h-10 bg-white/[0.03] rounded-xl mb-3" />
          {i < 2 && <div className="h-10 bg-white/[0.03] rounded-xl mb-3" />}
          <div className="h-8 w-28 bg-white/[0.04] rounded-xl mt-1" />
        </div>
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, profile, profileLoading, updateProfile, updatePassword, reauthenticate, signOut } = useAuth()
  const { toast } = useToast()
  const navigate  = useNavigate()

  async function handleProfileSave(updates) {
    const result = await updateProfile(updates)
    if (!result?.error) toast.success('Profile updated.')
    return result
  }

  async function handleChangePassword(currentPassword, newPassword) {
    const authResult = await reauthenticate(currentPassword)
    if (authResult?.error) return authResult

    const result = await updatePassword(newPassword)
    if (!result?.error) toast.success('Password updated.')
    return result
  }

  async function handlePreferencesSave(updates) {
    const result = await updateProfile(updates)
    if (!result?.error) toast.success('Preferences saved.')
    return result
  }

  async function handleSignOut() {
    await signOut()
    navigate(ROUTES.LOGIN)
  }

  return (
    <AppShell>
      <PageWrapper className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-white/40 text-sm mt-1">
            {user?.email}
          </p>
        </div>

        {/* Sections — skeleton while profile is first fetching */}
        {profileLoading ? (
          <SettingsSkeleton />
        ) : (
          <motion.div
            variants={STAGGER_CONTAINER}
            initial="initial"
            animate="animate"
            className="flex flex-col gap-4"
          >
            <ProfileSection
              profile={profile}
              user={user}
              onSave={handleProfileSave}
            />
            <SecuritySection
              onChangePassword={handleChangePassword}
            />
            <PreferencesSection
              profile={profile}
              onSave={handlePreferencesSave}
            />
            <MyAccountsSection />
            {user?.email === ADMIN_EMAIL && <KeywordApprovalsSection />}
            <DangerZone
              onSignOut={handleSignOut}
            />
          </motion.div>
        )}
      </PageWrapper>
    </AppShell>
  )
}
