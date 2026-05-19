import { createPortal } from 'react-dom'
import { AnimatePresence } from 'framer-motion'
import { useToast } from '@/context/ToastContext'
import Toast from './Toast'

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}
