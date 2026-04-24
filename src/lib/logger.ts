type LogLevel = 'info' | 'warn' | 'error'

type LogContext = Record<string, unknown> & {
  workspaceId?: string
  runtimeId?: string
  provider?: string
  operation?: string
  requestId?: string
  userId?: string
  apiKeyId?: string
  model?: string
  latencyMs?: number
  status?: number | string
  error?: Error
}

function write(level: LogLevel, message: string, context: LogContext = {}) {
  const entry: Record<string, unknown> = {
    level,
    message,
    timestamp: new Date().toISOString(),
  }

  // Extract error object for special handling
  const { error, ...restContext } = context
  
  // Add context fields
  Object.assign(entry, restContext)

  // Add error details if present
  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }
  }

  const serialized = JSON.stringify(entry)

  if (level === 'error') {
    console.error(serialized)
    return
  }

  if (level === 'warn') {
    console.warn(serialized)
    return
  }

  console.info(serialized)
}

export const logger = {
  info(message: string, context?: LogContext) {
    write('info', message, context)
  },
  warn(message: string, context?: LogContext) {
    write('warn', message, context)
  },
  error(message: string, context?: LogContext) {
    write('error', message, context)
  },
  runtime(message: string, context?: LogContext) {
    write('info', message, { operation: 'runtime', ...context })
  },
  proxy(message: string, context?: LogContext) {
    write('info', message, { operation: 'proxy', ...context })
  },
  auth(message: string, context?: LogContext) {
    write('info', message, { operation: 'auth', ...context })
  },
}
