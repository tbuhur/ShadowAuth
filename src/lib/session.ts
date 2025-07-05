import { randomBytes, createHash } from 'crypto';

export interface Session {
  sessionKey: string;
  nullifierHash: string;
  appId: string;
  expiresAt: Date;
  maxUsage: number;
  usageCount: number;
  permissions: string[];
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSessionParams {
  sessionKey: string;
  nullifierHash: string;
  appId: string;
  expiresAt: Date;
  maxUsage: number;
  permissions: string[];
}

// In-memory session storage (replace with database in production)
const sessionStore = new Map<string, Session>();

export async function generateSessionKey(): Promise<string> {
  // Generate a cryptographically secure random session key
  const randomBytesBuffer = randomBytes(32);
  return randomBytesBuffer.toString('hex');
}

export async function createSession(params: CreateSessionParams): Promise<Session> {
  const { sessionKey, nullifierHash, appId, expiresAt, maxUsage, permissions } = params;
  
  const session: Session = {
    sessionKey,
    nullifierHash,
    appId,
    expiresAt,
    maxUsage,
    usageCount: 0,
    permissions,
    isRevoked: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Store session in memory (replace with database in production)
  sessionStore.set(sessionKey, session);

  return session;
}

export async function verifySession(sessionKey: string): Promise<Session | null> {
  const session = sessionStore.get(sessionKey);
  
  if (!session) {
    return null;
  }

  // Check if session is revoked
  if (session.isRevoked) {
    return null;
  }

  // Check if session is expired
  if (session.expiresAt < new Date()) {
    return null;
  }

  // Check usage limits
  if (session.usageCount >= session.maxUsage) {
    return null;
  }

  return session;
}

export async function incrementSessionUsage(sessionKey: string): Promise<void> {
  const session = sessionStore.get(sessionKey);
  
  if (session) {
    session.usageCount += 1;
    session.updatedAt = new Date();
    sessionStore.set(sessionKey, session);
  }
}

export async function revokeSession(sessionKey: string): Promise<boolean> {
  const session = sessionStore.get(sessionKey);
  
  if (!session) {
    return false;
  }

  session.isRevoked = true;
  session.updatedAt = new Date();
  sessionStore.set(sessionKey, session);
  
  return true;
}

export async function getSessionInfo(sessionKey: string): Promise<Partial<Session> | null> {
  const session = sessionStore.get(sessionKey);
  
  if (!session) {
    return null;
  }

  // Return only non-sensitive information
  return {
    expiresAt: session.expiresAt,
    maxUsage: session.maxUsage,
    usageCount: session.usageCount,
    permissions: session.permissions,
    isRevoked: session.isRevoked,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt
  };
}

export async function cleanupExpiredSessions(): Promise<number> {
  const now = new Date();
  let cleanedCount = 0;

  for (const [sessionKey, session] of sessionStore.entries()) {
    if (session.expiresAt < now || session.isRevoked) {
      sessionStore.delete(sessionKey);
      cleanedCount++;
    }
  }

  return cleanedCount;
}

// Utility function to hash session keys for storage
export function hashSessionKey(sessionKey: string): string {
  return createHash('sha256').update(sessionKey).digest('hex');
}

// Utility function to validate session key format
export function isValidSessionKey(sessionKey: string): boolean {
  // Session keys should be 64 character hex strings
  return /^[a-f0-9]{64}$/.test(sessionKey);
} 