'use server'

import { getSession } from '@/lib/auth'

export async function getAdminSession() {
  return getSession()
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}