// src/lib/auth/session.ts
// Server-side session management using signed JWTs (jose)
// Sessions are stored in the DB for revocation support.

import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/db/client";
import { cookies } from "next/headers";

const SESSION_COOKIE = "loma_session";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set and at least 32 characters long"
    );
  }
  return new TextEncoder().encode(secret);
}

// ── Create & store session ────────────────────────────────────────────────────

export async function createSession(userId: string): Promise<string> {
  const key = getSecretKey();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(key);

  await prisma.session.create({
    data: { userId, token, expiresAt },
  });

  return token;
}

// ── Set session cookie ────────────────────────────────────────────────────────

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

// ── Get current session ───────────────────────────────────────────────────────

export interface SessionPayload {
  userId: string;
  expiresAt: Date;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(token, key);
    const userId = payload.sub;
    if (!userId) return null;

    // Validate against DB (supports revocation)
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) {
      if (session) await prisma.session.delete({ where: { token } });
      return null;
    }

    return { userId, expiresAt: session.expiresAt };
  } catch {
    return null;
  }
}

// ── Get authenticated admin user ──────────────────────────────────────────────

export async function getAdminUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.adminUser.findUnique({
    where: { id: session.userId, active: true },
    select: { id: true, displayName: true, email: true, role: true },
  });

  return user;
}

// ── Delete session ────────────────────────────────────────────────────────────

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
    cookieStore.delete(SESSION_COOKIE);
  }
}

// ── Require auth (for Server Components) ─────────────────────────────────────

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/admin/login");
  }
  return user;
}
