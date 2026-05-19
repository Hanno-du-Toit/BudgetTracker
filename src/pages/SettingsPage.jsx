import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/context/ToastContext'
import { ROUTES, SLIDE_UP, STAGGER_CONTAINER, AVATAR_COLORS, CURRENCY_OPTIONS, DATE_FORMAT_OPTIONS, DEFAULT_CURRENCY, DEFAULT_DATE_FORMAT } from '@/constants'
import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

// ── Section card ───────────────────────────────────────────────────────────────

function SettingsSection({ title, description, children }) {
  return (
    <motion.div variants={SLIDE_UP} className="card flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
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
  const name      = profile?.display_name ?? user?.email ?? ''
  const initials  = (profile?.display_name ?? user?.email ?? '?').charAt(0).toUpperCase()

  const [displayName, setDisplayName] = useState(name)
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color ?? AVATAR_COLORS[0].value)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')

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

  const isDirty = displayName.trim() !== name || avatarColor !== (profile?.avatar_color ?? AVATAR_COLORS[0].value)

  return (
    <SettingsSection
      title="Profile"
      description="How you appear in the app."
    >
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* Avatar preview + color picker */}
        <div className="flex items-start gap-4">
          <AvatarPreview color={avatarColor} initial={initials} />
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

// ── Danger zone ────────────────────────────────────────────────────────────────

function DangerZone({ onSignOut }) {
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await onSignOut()
  }

  return (
    <SettingsSection
      title="Danger zone"
      description="Irreversible actions — please be careful."
    >
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
    </SettingsSection>
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
            <DangerZone
              onSignOut={handleSignOut}
            />
          </motion.div>
        )}
      </PageWrapper>
    </AppShell>
  )
}
