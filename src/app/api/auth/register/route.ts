import { NextRequest, NextResponse } from 'next/server';
import { generateAppId, createAppRegistration } from '@/lib/app-registration';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'anonymous';
    const { success } = await rateLimit(identifier, 'register', 3, 300); // 3 requests per 5 minutes
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { 
      appName, 
      appUrl, 
      description, 
      contactEmail, 
      redirectUrls = [],
      permissions = ['read', 'write']
    } = body;

    // Validate required fields
    if (!appName || !appUrl || !contactEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: appName, appUrl, contactEmail' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(appUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid app URL format' },
        { status: 400 }
      );
    }

    // Validate redirect URLs
    for (const redirectUrl of redirectUrls) {
      try {
        new URL(redirectUrl);
      } catch {
        return NextResponse.json(
          { error: 'Invalid redirect URL format' },
          { status: 400 }
        );
      }
    }

    // Generate unique app ID
    const appId = await generateAppId();
    
    // Create app registration
    const registration = await createAppRegistration({
      appId,
      appName,
      appUrl,
      description,
      contactEmail,
      redirectUrls,
      permissions,
      status: 'pending' // Requires approval in production
    });

    logger.info('App registration created', {
      appId,
      appName,
      contactEmail: contactEmail.substring(0, 3) + '***@***'
    });

    // Return registration data
    return NextResponse.json({
      success: true,
      registration: {
        appId,
        appName,
        appUrl,
        description,
        contactEmail,
        redirectUrls,
        permissions,
        status: registration.status,
        createdAt: registration.createdAt
      },
      nextSteps: [
        'Complete World ID app setup at developer.worldcoin.org',
        'Configure your app with the provided appId',
        'Wait for approval (if required)',
        'Start integrating ShadowAuth SDK'
      ]
    });

  } catch (error) {
    logger.error('App registration error', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 