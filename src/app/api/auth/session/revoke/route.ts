import { NextRequest, NextResponse } from 'next/server';
import { revokeSession } from '@/lib/session';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'anonymous';
    const { success } = await rateLimit(identifier, 'revoke', 10, 60); // 10 requests per minute
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { sessionKey } = body;

    // Validate required fields
    if (!sessionKey) {
      return NextResponse.json(
        { error: 'Missing required field: sessionKey' },
        { status: 400 }
      );
    }

    // Revoke session
    const revoked = await revokeSession(sessionKey);

    if (!revoked) {
      logger.warn('Session revocation failed - session not found', {
        sessionKey: sessionKey.substring(0, 8) + '...'
      });
      
      return NextResponse.json(
        { error: 'Session not found or already revoked' },
        { status: 404 }
      );
    }

    logger.info('Session revoked successfully', {
      sessionKey: sessionKey.substring(0, 8) + '...'
    });

    return NextResponse.json({
      success: true,
      message: 'Session revoked successfully'
    });

  } catch (error) {
    logger.error('Session revocation error', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 