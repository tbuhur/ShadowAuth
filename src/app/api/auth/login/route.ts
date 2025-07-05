import { NextRequest, NextResponse } from 'next/server';
import { verifyWorldIdProof } from '@/lib/worldid';
import { generateSessionKey, createSession } from '@/lib/session';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'anonymous';
    const { success } = await rateLimit(identifier, 'login', 5, 60); // 5 requests per minute
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { proof, nullifierHash, merkleRoot, credentialType } = body;

    // Validate required fields
    if (!proof || !nullifierHash || !merkleRoot) {
      return NextResponse.json(
        { error: 'Missing required fields: proof, nullifierHash, merkleRoot' },
        { status: 400 }
      );
    }

    // Verify World ID proof
    const verificationResult = await verifyWorldIdProof({
      proof,
      nullifierHash,
      merkleRoot,
      credentialType: credentialType || 'orb'
    });

    if (!verificationResult.success) {
      logger.warn('World ID verification failed', {
        nullifierHash,
        error: verificationResult.error
      });
      
      return NextResponse.json(
        { error: 'World ID verification failed', details: verificationResult.error },
        { status: 401 }
      );
    }

    // Generate session key
    const sessionKey = await generateSessionKey();
    
    // Create session
    const session = await createSession({
      sessionKey,
      nullifierHash,
      appId: process.env.NEXT_PUBLIC_WORLD_ID_APP_ID!,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      maxUsage: 100,
      permissions: ['read', 'write']
    });

    logger.info('Login successful', {
      sessionKey: sessionKey.substring(0, 8) + '...',
      nullifierHash: nullifierHash.substring(0, 8) + '...'
    });

    // Return session data
    return NextResponse.json({
      success: true,
      session: {
        key: sessionKey,
        expiresAt: session.expiresAt,
        maxUsage: session.maxUsage,
        permissions: session.permissions
      }
    });

  } catch (error) {
    logger.error('Login error', { error: error instanceof Error ? error.message : 'Unknown error' });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 