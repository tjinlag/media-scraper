type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'debug'

function shouldLog(level: LogLevel): boolean {
  return levels[level] >= levels[currentLevel]
}

function formatMessage(level: LogLevel, message: string, meta?: unknown) {
  const timestamp = new Date().toISOString()

  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`

  if (!meta) return base

  return `${base} ${JSON.stringify(meta)}`
}

function log(level: LogLevel, message: string, meta?: unknown) {
  if (!shouldLog(level)) return

  const formatted = formatMessage(level, message, meta)

  if (level === 'error') {
    console.error(formatted)
  } else if (level === 'warn') {
    console.warn(formatted)
  } else {
    console.log(formatted)
  }
}

export const logger = {
  debug: (msg: string, meta?: unknown) => log('debug', msg, meta),
  info: (msg: string, meta?: unknown) => log('info', msg, meta),
  warn: (msg: string, meta?: unknown) => log('warn', msg, meta),
  error: (msg: string, meta?: unknown) => log('error', msg, meta)
}
