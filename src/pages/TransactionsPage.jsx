import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'
import EmptyState from '@/components/ui/EmptyState'

export default function TransactionsPage() {
  const navigate = useNavigate()
  return (
    <AppShell>
      <PageWrapper className="max-w-6xl mx-auto px-4 py-10">
        <EmptyState
          icon="📋"
          heading="No transactions yet"
          subtext="Upload a bank statement and your transactions will appear here."
          action={{ label: 'Upload a statement', onClick: () => navigate(ROUTES.UPLOAD) }}
        />
      </PageWrapper>
    </AppShell>
  )
}
