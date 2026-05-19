import PageWrapper from '@/components/layout/PageWrapper'

export default function LandingPage() {
  return (
    <PageWrapper className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-5xl mb-6">💰</div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent">
          BudgetTracker
        </h1>
        <p className="text-white/60 text-lg mb-8">
          AI-powered spending insights. Your bank data never leaves your device.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="/signup"
            className="px-6 py-3 bg-brand hover:bg-brand-dark rounded-xl font-medium transition-colors"
          >
            Get started
          </a>
          <a
            href="/login"
            className="px-6 py-3 bg-surface-100 hover:bg-surface-200 rounded-xl font-medium transition-colors"
          >
            Sign in
          </a>
        </div>
      </div>
    </PageWrapper>
  )
}
