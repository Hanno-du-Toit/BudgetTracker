import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Upload, LayoutDashboard, Receipt } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export default function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const options = [
    {
      label: 'Upload statement',
      icon: <Upload className="w-4 h-4" />,
      onClick: () => { navigate(ROUTES.UPLOAD); setIsOpen(false) },
    },
    {
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      onClick: () => { navigate(ROUTES.DASHBOARD); setIsOpen(false) },
    },
    {
      label: 'Transactions',
      icon: <Receipt className="w-4 h-4" />,
      onClick: () => { navigate(ROUTES.TRANSACTIONS); setIsOpen(false) },
    },
  ]

  return (
    <div className="hidden md:block fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 10, y: 10, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="absolute bottom-12 right-0 mb-2"
          >
            <div className="flex flex-col items-end gap-2">
              {options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <button
                    onClick={option.onClick}
                    className="flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-xl text-white/80 hover:text-white text-sm shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-colors duration-150"
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.7)] flex items-center justify-center transition-colors duration-150"
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.div>
      </motion.button>
    </div>
  )
}
