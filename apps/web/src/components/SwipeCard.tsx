import { ReactNode, useEffect } from 'react'
import { useDrag } from '@use-gesture/react'
import { motion, useMotionValue, animate } from 'motion/react'
import { gradeFromSwipe } from '../lib/gesture'

type Props = {
  onGrade: (g: 0 | 3 | 4 | 5) => void
  children: ReactNode
}

export function SwipeCard({ onGrade, children }: Props) {
  const x = useMotionValue(0)

  const bind = useDrag(({ down, movement: [mx] }) => {
    if (down) {
      x.set(mx)
    } else {
      // Release
      const g = gradeFromSwipe(mx, 80)
      if (g !== null) {
        onGrade(g)
        x.set(0)
      } else {
        animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 })
      }
    }
  }, { filterTaps: true })

  useEffect(() => {
    // Reset position if child changes implicitly handled by x.set in handlers
  }, [x])

  return (
    <motion.div {...(bind() as any)} style={{ x, touchAction: 'none' as any }}>
      {children}
    </motion.div>
  )
}
