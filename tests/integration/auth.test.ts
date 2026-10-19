/**
 * Integration tests for authentication using the live implementation.
 *
 * - Password hashing with real bcrypt (real DB).
 * - JWT session creation / verification (no cookie store needed).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'
import { createSession, verifySession } from '@/lib/auth'
import { cleanupAll } from './helpers'

describe('Password hashing (real bcrypt)', () => {
  beforeAll(async () => {
    await cleanupAll()
  })
  afterAll(async () => {
    await cleanupAll()
  })

  it('hashes a password to a 60-character bcrypt string', async () => {
    const hash = await bcrypt.hash('secret-password', 12)
    expect(hash).toHaveLength(60)
    expect(hash).not.toContain('secret-password')
  })

  it('verifies the correct password returns true', async () => {
    const hash = await bcrypt.hash('my-secret', 12)
    expect(await bcrypt.compare('my-secret', hash)).toBe(true)
  })

  it('rejects the wrong password', async () => {
    const hash = await bcrypt.hash('my-secret', 12)
    expect(await bcrypt.compare('wrong-password', hash)).toBe(false)
  })
})

describe('Admin user lifecycle (real DB)', () => {
  beforeAll(async () => {
    await cleanupAll()
  })
  afterAll(async () => {
    await cleanupAll()
  })

  it('creates an admin user and finds it by email', async () => {
    const hash = await bcrypt.hash('admin123', 12)
    const user = await prisma.adminUser.create({
      data: {
        email: `admin-int-${Date.now()}@test.com`,
        passwordHash: hash,
        name: 'Integration Admin',
        role: 'admin',
        active: true,
      },
    })
    expect(user.id).toBeDefined()
    expect(user.active).toBe(true)

    const found = await prisma.adminUser.findUnique({ where: { email: user.email } })
    expect(found).toBeTruthy()
    expect(found?.passwordHash).toBe(hash)
  })
})

describe('JWT session round-trip', () => {
  it('creates a token that verifies back to the same payload', async () => {
    const token = await createSession({ userId: 'u-abc', email: 'a@b.com', role: 'admin' })
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(20)

    const payload = await verifySession(token)
    expect(payload).toBeTruthy()
    expect(payload!.userId).toBe('u-abc')
    expect(payload!.email).toBe('a@b.com')
    expect(payload!.role).toBe('admin')
  })

  it('rejects a tampered token', async () => {
    const token = await createSession({ userId: 'u-abc', email: 'a@b.com', role: 'admin' })
    const tampered = token.slice(0, -5) + 'XXXXX'
    const payload = await verifySession(tampered)
    expect(payload).toBeNull()
  })
})
