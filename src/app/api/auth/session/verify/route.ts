import { NextRequest, NextResponse } from 'next/server';
import { verifySession, incrementSessionUsage } from '@/lib/session';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'anonymous';
    const { success } = await rateLimit(identifier, 'verify', 100, 60); // 100 requests per minute
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { sessionKey, requiredPermissions = [] } = body;

    // Validate required fields
    if (!sessionKey) {
      return NextResponse.json(
        { error: 'Missing required field: sessionKey' },
        { status: 400 }
      );
    }

    // Verify session
    const session = await verifySession(sessionKey);

    if (!session) {
      logger.warn('Invalid session key', {
        sessionKey: sessionKey.substring(0, 8) + '...'
      });
      
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      logger.warn('Expired session', {
        sessionKey: sessionKey.substring(0, 8) + '...',
        expiresAt: session.expiresAt
      });
      
      return NextResponse.json(
        { error: 'Session has expired' },
        { status: 401 }
      );
    }

    // Check usage limits
    if (session.usageCount >= session.maxUsage) {
      logger.warn('Session usage limit exceeded', {
        sessionKey: sessionKey.substring(0, 8) + '...',
        usageCount: session.usageCount,
        maxUsage: session.maxUsage
      });
      
      return NextResponse.json(
        { error: 'Session usage limit exceeded' },
        { status: 429 }
      );
    }

    // Check permissions if required
    if (requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.every((permission: string) => 
        session.permissions.includes(permission)
      );
      
      if (!hasPermission) {
        logger.warn('Insufficient permissions', {
          sessionKey: sessionKey.substring(0, 8) + '...',
          required: requiredPermissions,
          available: session.permissions
        });
        
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Increment usage count
    await incrementSessionUsage(sessionKey);

    logger.info('Session verified successfully', {
      sessionKey: sessionKey.substring(0, 8) + '...',
      usageCount: session.usageCount + 1
    });

    // Return session info (without sensitive data)
    return NextResponse.json({
      success: true,
      session: {
        isValid: true,
        expiresAt: session.expiresAt,
        usageCount: session.usageCount + 1,
        maxUsage: session.maxUsage,
        permissions: session.permissions
      }
    });

  } catch (error) {
    logger.error('Session verification error', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 