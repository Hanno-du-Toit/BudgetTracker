import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'
import EmptyState from '@/components/ui/EmptyState'

export default function DashboardPage() {
  const navigate = useNavigate()
  return (
    <AppShell>
      <PageWrapper className="max-w-6xl mx-auto px-4 py-10">
        <EmptyState
          icon="📊"
          heading="Dashboard coming soon"
          subtext="Charts and spending insights will appear here once we connect the data layer."
          action={{ label: 'Upload a statement', onClick: () => navigate(ROUTES.UPLOAD) }}
        />
      </PageWrapper>
    </AppShell>
  )
}
