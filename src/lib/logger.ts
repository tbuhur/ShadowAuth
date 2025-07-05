import pino from 'pino';

// Configure logger based on environment
const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

export const logger = pino({
  level: logLevel,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  },
  base: {
    env: process.env.NODE_ENV,
    service: 'shadowauth-backend'
  }
});

// Custom log levels for different types of events
export const authLogger = logger.child({ module: 'authentication' });
export const sessionLogger = logger.child({ module: 'session' });
export const worldIdLogger = logger.child({ module: 'worldid' });
export const securityLogger = logger.child({ module: 'security' });

// Utility functions for common logging patterns
export function logAuthAttempt(success: boolean, details: Record<string, any>) {
  const logMethod = success ? authLogger.info : authLogger.warn;
  logMethod('Authentication attempt', {
    success,
    timestamp: new Date().toISOString(),
    ...details
  });
}

export function logSessionEvent(event: string, sessionKey: string, details?: Record<string, any>) {
  sessionLogger.info(`Session ${event}`, {
    sessionKey: sessionKey.substring(0, 8) + '...',
    timestamp: new Date().toISOString(),
    ...details
  });
}

export function logSecurityEvent(event: string, details: Record<string, any>) {
  securityLogger.warn(`Security event: ${event}`, {
    timestamp: new Date().toISOString(),
    ...details
  });
}

export function logWorldIdEvent(event: string, details: Record<string, any>) {
  worldIdLogger.info(`World ID ${event}`, {
    timestamp: new Date().toISOString(),
    ...details
  });
}

// Error logging with stack traces
export function logError(error: Error, context?: Record<string, any>) {
  logger.error('Application error', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    context,
    timestamp: new Date().toISOString()
  });
}

// Performance logging
export function logPerformance(operation: string, duration: number, details?: Record<string, any>) {
  logger.info('Performance metric', {
    operation,
    duration,
    timestamp: new Date().toISOString(),
    ...details
  });
}

// Request logging middleware
export function logRequest(req: any, res: any, next?: any) {
  const startTime = Date.now();
  
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    userAgent: req.headers?.['user-agent'],
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  if (next && res?.on) {
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.info('Request completed', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        timestamp: new Date().toISOString()
      });
    });
    
    next();
  }
} 