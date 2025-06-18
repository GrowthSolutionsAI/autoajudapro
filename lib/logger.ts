// Sistema de logging estruturado
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string
  level: string
  message: string
  context?: Record<string, any>
  userId?: string
  sessionId?: string
  requestId?: string
}

class Logger {
  private logLevel: LogLevel
  private logs: LogEntry[] = []
  private maxLogs = 1000

  constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel
  }

  private formatLog(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      context,
      userId: context?.userId,
      sessionId: context?.sessionId,
      requestId: context?.requestId,
    }
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry)

    // Manter apenas os últimos logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Log no console em desenvolvimento
    if (process.env.NODE_ENV === "development") {
      const color = this.getLogColor(entry.level)
      console.log(
        `${color}[${entry.timestamp}] ${entry.level}: ${entry.message}${entry.context ? " " + JSON.stringify(entry.context) : ""}\x1b[0m`,
      )
    }
  }

  private getLogColor(level: string): string {
    switch (level) {
      case "DEBUG":
        return "\x1b[36m" // Cyan
      case "INFO":
        return "\x1b[32m" // Green
      case "WARN":
        return "\x1b[33m" // Yellow
      case "ERROR":
        return "\x1b[31m" // Red
      default:
        return "\x1b[0m" // Reset
    }
  }

  public debug(message: string, context?: Record<string, any>) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.addLog(this.formatLog(LogLevel.DEBUG, message, context))
    }
  }

  public info(message: string, context?: Record<string, any>) {
    if (this.shouldLog(LogLevel.INFO)) {
      this.addLog(this.formatLog(LogLevel.INFO, message, context))
    }
  }

  public warn(message: string, context?: Record<string, any>) {
    if (this.shouldLog(LogLevel.WARN)) {
      this.addLog(this.formatLog(LogLevel.WARN, message, context))
    }
  }

  public error(message: string, context?: Record<string, any>) {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.addLog(this.formatLog(LogLevel.ERROR, message, context))
    }
  }

  public getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter((log) => LogLevel[log.level as keyof typeof LogLevel] >= level)
    }
    return [...this.logs]
  }

  public clearLogs() {
    this.logs = []
  }

  // Métricas específicas para chat
  public chatRequest(sessionId: string, userEmail?: string, messageCount?: number) {
    this.info("Chat request received", {
      sessionId,
      userEmail,
      messageCount,
      type: "chat_request",
    })
  }

  public chatResponse(sessionId: string, provider: string, responseTime: number, success: boolean) {
    this.info("Chat response sent", {
      sessionId,
      provider,
      responseTime,
      success,
      type: "chat_response",
    })
  }

  public rateLimitHit(identifier: string, endpoint: string) {
    this.warn("Rate limit exceeded", {
      identifier,
      endpoint,
      type: "rate_limit",
    })
  }

  public apiError(endpoint: string, error: string, statusCode: number) {
    this.error("API error occurred", {
      endpoint,
      error,
      statusCode,
      type: "api_error",
    })
  }
}

// Instância global do logger
export const logger = new Logger(process.env.NODE_ENV === "development" ? LogLevel.DEBUG : LogLevel.INFO)

// Middleware para logging de requests
export function withLogging(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    const startTime = Date.now()
    const requestId = Math.random().toString(36).substring(2, 15)

    logger.info("Request started", {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.headers.get("user-agent"),
      type: "request_start",
    })

    try {
      const response = await handler(req)
      const responseTime = Date.now() - startTime

      logger.info("Request completed", {
        requestId,
        status: response.status,
        responseTime,
        type: "request_complete",
      })

      return response
    } catch (error) {
      const responseTime = Date.now() - startTime

      logger.error("Request failed", {
        requestId,
        error: error instanceof Error ? error.message : String(error),
        responseTime,
        type: "request_error",
      })

      throw error
    }
  }
}
