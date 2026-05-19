import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useFileParser } from '@/hooks/useFileParser'
import { useToast } from '@/context/ToastContext'
import { ROUTES } from '@/constants/routes'
import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'
import DropZone from '@/components/upload/DropZone'
import FilePreview from '@/components/upload/FilePreview'
import ParseProgress from '@/components/upload/ParseProgress'
import TransactionReview from '@/components/upload/TransactionReview'
import Button from '@/components/ui/Button'

export default function UploadPage() {
  const { status, progress, parseStep, transactions, error, fileName, parseFile, reset } = useFileParser()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [selectedFile,  setSelectedFile]  = useState(null)
  const [isConfirming,  setIsConfirming]  = useState(false)

  function handleFileAccepted(file) {
    setSelectedFile(file)
  }

  function handleRemoveFile() {
    setSelectedFile(null)
    reset()
  }

  async function handleStartParsing() {
    if (!selectedFile) return
    await parseFile(selectedFile)
  }

  async function handleConfirm() {
    setIsConfirming(true)
    // Saving to Supabase is wired in Phase 6.
    // For now, store in sessionStorage so the dashboard can preview them.
    try {
      sessionStorage.setItem('pendingTransactions', JSON.stringify(transactions))
      toast.success(`${transactions.length} transactions ready — saving coming in the next phase!`)
      navigate(ROUTES.DASHBOARD)
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <AppShell>
      <PageWrapper className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Upload statement</h1>
          <p className="text-white/40 text-sm mt-1">
            Import your bank statement to track your spending
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* IDLE — choose file */}
          {status === 'idle' && (
            <div key="idle" className="flex flex-col gap-4">
              <DropZone onFileAccepted={handleFileAccepted} />

              {selectedFile && (
                <>
                  <FilePreview file={selectedFile} onRemove={handleRemoveFile} />
                  <Button size="lg" className="w-full" onClick={handleStartParsing}>
                    Extract transactions
                  </Button>
                </>
              )}
            </div>
          )}

          {/* PARSING */}
          {status === 'parsing' && (
            <div key="parsing">
              <ParseProgress progress={progress} parseStep={parseStep} />
            </div>
          )}

          {/* REVIEW */}
          {status === 'review' && (
            <div key="review">
              <TransactionReview
                transactions={transactions}
                fileName={fileName}
                onConfirm={handleConfirm}
                onCancel={reset}
                isConfirming={isConfirming}
              />
            </div>
          )}

          {/* ERROR */}
          {status === 'error' && (
            <div key="error" className="flex flex-col items-center gap-6 py-10 text-center">
              <div className="text-5xl">😕</div>
              <div>
                <h2 className="text-lg font-semibold mb-2">Couldn't read this file</h2>
                <p className="text-white/50 text-sm max-w-sm leading-relaxed">{error}</p>
              </div>
              <Button onClick={reset}>Try a different file</Button>
            </div>
          )}
        </AnimatePresence>
      </PageWrapper>
    </AppShell>
  )
}
