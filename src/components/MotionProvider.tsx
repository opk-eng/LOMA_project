'use client'

import { MotionConfig } from 'framer-motion'

/**
 * Wraps the site in MotionConfig so every framer-motion animation
 * automatically falls back to instant state changes for users who
 * prefer reduced motion (`reducedMotion="user"`).
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}