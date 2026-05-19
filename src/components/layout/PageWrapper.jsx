import { motion } from 'framer-motion'
import { PAGE_TRANSITION } from '@/constants/animation'

export default function PageWrapper({ children, className = '' }) {
  return (
    <motion.div
      className={`w-full ${className}`}
      initial={PAGE_TRANSITION.initial}
      animate={PAGE_TRANSITION.animate}
      exit={PAGE_TRANSITION.exit}
      transition={PAGE_TRANSITION.transition}
    >
      {children}
    </motion.div>
  )
}
