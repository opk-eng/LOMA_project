'use client'

import { motion, type MotionProps } from 'framer-motion'

export interface AnimatedSectionProps extends MotionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

/**
 * Client-side animated section wrapper for use inside Server Components.
 * Pass props via `as="section"` or wrap children in a regular element.
 */
export function AnimatedSection({
  children,
  className,
  delay = 0,
  ...motionProps
}: AnimatedSectionProps) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      {...motionProps}
    >
      {children}
    </motion.section>
  )
}
