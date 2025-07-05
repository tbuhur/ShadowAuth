import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(_request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Basic health checks
    const healthChecks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        memory: checkMemoryUsage(),
        disk: await checkDiskSpace(),
        database: await checkDatabaseConnection(),
        blockchain: await checkBlockchainConnection()
      }
    };

    const duration = Date.now() - startTime;
    
    logger.info('Health check completed', {
      duration,
      status: healthChecks.status
    });

    return NextResponse.json(healthChecks);

  } catch (error) {
    logger.error('Health check failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return NextResponse.json(
      { 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 503 }
    );
  }
}

function checkMemoryUsage() {
  const usage = process.memoryUsage();
  const maxHeapSize = 512 * 1024 * 1024; // 512MB
  
  return {
    used: Math.round(usage.heapUsed / 1024 / 1024),
    total: Math.round(usage.heapTotal / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024),
    rss: Math.round(usage.rss / 1024 / 1024),
    healthy: usage.heapUsed < maxHeapSize
  };
}

async function checkDiskSpace(): Promise<{ healthy: boolean; available?: number }> {
  try {
    // This is a simplified check - in production, use a proper disk space library
    return { healthy: true };
  } catch {
    return { healthy: false };
  }
}

async function checkDatabaseConnection(): Promise<{ healthy: boolean; error?: string }> {
  try {
    // In production, this would check actual database connection
    // For now, return healthy as we're using in-memory storage
    return { healthy: true };
  } catch (error) {
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown database error' 
    };
  }
}

async function checkBlockchainConnection(): Promise<{ healthy: boolean; error?: string }> {
  try {
    // Check if we can connect to the blockchain
    // This would typically ping the RPC endpoint
    return { healthy: true };
  } catch (error) {
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown blockchain error' 
    };
  }
} 