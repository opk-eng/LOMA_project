'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  id?: string
  [key: string]: unknown
}

export function FadeIn({ children, className = '', delay = 0, id, ...props }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      id={id}
      className={className}
      initial="initial"
      animate={isInView ? 'animate' : 'initial'}
      variants={fadeInUp}
      style={{ transitionDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface StaggerFadeInProps {
  children: React.ReactNode
  className?: string
  [key: string]: unknown
}

export function StaggerFadeIn({ children, className = '', ...props }: StaggerFadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="initial"
      animate={isInView ? 'animate' : 'initial'}
      variants={staggerContainer}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export { fadeInUp, staggerContainer }
