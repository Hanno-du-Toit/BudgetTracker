import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'

export default function SettingsPage() {
  return (
    <AppShell>
      <PageWrapper className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-white/40 text-sm">Account management coming in Phase 9.</p>
      </PageWrapper>
    </AppShell>
  )
}
