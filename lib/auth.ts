import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'devforge-super-secret-key-change-me-in-production'
);

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  setupComplete: boolean;
}

/**
 * Signs a payload and returns a JWT token.
 */
export async function signJWT(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

/**
 * Verifies a JWT token and returns its payload or null if invalid.
 */
export async function verifyJWT(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Retrieves the current session from browser cookies.
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('devforge-session')?.value;
    if (!token) return null;
    return await verifyJWT(token);
  } catch (e) {
    return null;
  }
}

/**
 * Sets the session cookie for the user.
 */
export async function setSessionCookie(payload: SessionPayload) {
  const token = await signJWT(payload);
  const cookieStore = await cookies();
  cookieStore.set('devforge-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clears the session cookie, logging out the user.
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('devforge-session');
}

/**
 * Hashes a plaintext password.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compares a password against a hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
