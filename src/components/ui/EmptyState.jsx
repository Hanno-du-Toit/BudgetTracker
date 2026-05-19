import { motion } from 'framer-motion'
import { FADE_IN } from '@/constants/animation'
import Button from './Button'

export default function EmptyState({ icon, heading, subtext, action }) {
  return (
    <motion.div
      {...FADE_IN}
      className="flex flex-col items-center justify-center text-center py-16 px-6"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{heading}</h3>
      <p className="text-white/40 text-sm max-w-xs leading-relaxed">{subtext}</p>
      {action && (
        <Button className="mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}
