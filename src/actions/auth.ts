'use server'

import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'
import {
  createSession,
  setSessionCookie,
  clearSessionCookie,
  getSession,
} from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import { redirect } from 'next/navigation'

// Simple in-memory rate limiter for login attempts.
// Limits are configurable per environment via env vars so that automated
// E2E tests (which perform many logins against one process) can relax them
// without weakening the production defaults.
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = Number(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS ?? 5)
const WINDOW_MS = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000) // 15 minutes

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const record = loginAttempts.get(key)

  if (!record || now > record.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (record.count >= MAX_ATTEMPTS) {
    return false
  }

  record.count++
  return true
}

export type AuthResult = {
  success: boolean
  error?: string
}

export async function loginAction(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: 'Dados inválidos.' }
  }

  const { email, password } = parsed.data

  // Rate limit by email
  if (!checkRateLimit(email)) {
    return {
      success: false,
      error: 'Muitas tentativas. Aguarde 15 minutos.',
    }
  }

  const user = await prisma.adminUser.findUnique({ where: { email } })
  if (!user || !user.active) {
    return { success: false, error: 'E-mail ou senha inválidos.' }
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash)
  if (!passwordValid) {
    return { success: false, error: 'E-mail ou senha inválidos.' }
  }

  const token = await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  await setSessionCookie(token)

  // Audit log
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      actorEmail: user.email,
      action: 'LOGIN',
      entityType: 'AdminUser',
      entityId: user.id,
    },
  })

  redirect('/admin')
}

export async function logoutAction(): Promise<void> {
  const session = await getSession()

  if (session) {
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        actorEmail: session.email,
        action: 'LOGOUT',
        entityType: 'AdminUser',
        entityId: session.userId,
      },
    })
  }

  await clearSessionCookie()
  redirect('/admin/login')
}
