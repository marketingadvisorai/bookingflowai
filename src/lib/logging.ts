/**
 * Structured Logging Utility
 * 
 * Simple JSON-based structured logging for BookingFlow v2.
 * No external dependencies - just enhanced console output.
 * 
 * Usage:
 *   log.info('api.holds', 'created', { holdId, orgId });
 *   log.warn('rate-limit', 'exceeded', { ip, endpoint });
 *   log.error('stripe.webhook', 'failed', { error: err.message });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown>;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  event: string;
  context?: LogContext;
}

function formatLog(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function shouldLog(level: LogLevel): boolean {
  const logLevel = process.env.LOG_LEVEL ?? 'info';
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
  return levels.indexOf(level) >= levels.indexOf(logLevel as LogLevel);
}

function createLogEntry(level: LogLevel, module: string, event: string, context?: LogContext): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    module,
    event,
    ...(context && Object.keys(context).length > 0 ? { context } : {}),
  };
}

/**
 * Structured logging functions.
 * 
 * @param module - Component/feature name (e.g., 'api.holds', 'stripe.webhook')
 * @param event - What happened (e.g., 'created', 'failed', 'expired')
 * @param context - Additional context data
 */
export const log = {
  debug(module: string, event: string, context?: LogContext): void {
    if (!shouldLog('debug')) return;
    const entry = createLogEntry('debug', module, event, context);
    console.log(formatLog(entry));
  },
  
  info(module: string, event: string, context?: LogContext): void {
    if (!shouldLog('info')) return;
    const entry = createLogEntry('info', module, event, context);
    console.log(formatLog(entry));
  },
  
  warn(module: string, event: string, context?: LogContext): void {
    if (!shouldLog('warn')) return;
    const entry = createLogEntry('warn', module, event, context);
    console.warn(formatLog(entry));
  },
  
  error(module: string, event: string, context?: LogContext): void {
    if (!shouldLog('error')) return;
    const entry = createLogEntry('error', module, event, context);
    console.error(formatLog(entry));
  },
};

/**
 * Create a scoped logger for a specific module.
 * 
 * Usage:
 *   const logger = createLogger('api.holds');
 *   logger.info('created', { holdId });
 */
export function createLogger(module: string) {
  return {
    debug: (event: string, context?: LogContext) => log.debug(module, event, context),
    info: (event: string, context?: LogContext) => log.info(module, event, context),
    warn: (event: string, context?: LogContext) => log.warn(module, event, context),
    error: (event: string, context?: LogContext) => log.error(module, event, context),
  };
}

/**
 * Log an error with stack trace extraction.
 */
export function logError(module: string, event: string, error: unknown, context?: LogContext): void {
  const errorInfo: LogContext = {
    ...context,
    error: error instanceof Error ? error.message : String(error),
    ...(error instanceof Error && error.stack ? { stack: error.stack.split('\n').slice(0, 3).join(' | ') } : {}),
  };
  log.error(module, event, errorInfo);
}
