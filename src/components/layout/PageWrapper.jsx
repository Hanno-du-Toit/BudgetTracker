import { motion } from 'framer-motion'
import { DURATION, EASING } from '@/constants/animation'

export default function PageWrapper({ children, className = '' }) {
  return (
    <motion.div
      className={`w-full ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { duration: DURATION.normal, ease: EASING.out } }}
      exit={{ opacity: 0, transition: { duration: 0 } }}
    >
      {children}
    </motion.div>
  )
}
