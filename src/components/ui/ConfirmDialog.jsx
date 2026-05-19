import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  isDangerous   = false,
  isLoading     = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-white/60 text-sm leading-relaxed mb-6">{message}</p>
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant={isDangerous ? 'danger' : 'primary'}
          onClick={onConfirm}
          isLoading={isLoading}
          className="flex-1"
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
