// Sistema de rate limiting em memória (para produção, usar Redis)
interface RateLimitEntry {
  count: number
  resetTime: number
  lastRequest: number
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map()
  private readonly maxRequests: number
  private readonly windowMs: number
  private readonly cleanupInterval: NodeJS.Timeout

  constructor(maxRequests = 10, windowMs = 60000) {
    // 10 requests per minute
    this.maxRequests = maxRequests
    this.windowMs = windowMs

    // Limpar entradas expiradas a cada 5 minutos
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup()
      },
      5 * 60 * 1000,
    )
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key)
      }
    }
  }

  public checkLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.limits.get(identifier)

    if (!entry || now > entry.resetTime) {
      // Nova janela de tempo
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.windowMs,
        lastRequest: now,
      }
      this.limits.set(identifier, newEntry)

      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: newEntry.resetTime,
      }
    }

    // Verificar se excedeu o limite
    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      }
    }

    // Incrementar contador
    entry.count++
    entry.lastRequest = now
    this.limits.set(identifier, entry)

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    }
  }

  public getRemainingTime(identifier: string): number {
    const entry = this.limits.get(identifier)
    if (!entry) return 0

    const now = Date.now()
    return Math.max(0, entry.resetTime - now)
  }

  public destroy() {
    clearInterval(this.cleanupInterval)
    this.limits.clear()
  }
}

// Instâncias globais para diferentes tipos de rate limiting
export const chatRateLimiter = new RateLimiter(20, 60000) // 20 mensagens por minuto
export const apiRateLimiter = new RateLimiter(100, 60000) // 100 requests por minuto
export const authRateLimiter = new RateLimiter(5, 300000) // 5 tentativas de login por 5 minutos

// Função helper para obter identificador do usuário
export function getUserIdentifier(req: Request): string {
  // Tentar obter IP real
  const forwarded = req.headers.get("x-forwarded-for")
  const realIp = req.headers.get("x-real-ip")
  const ip = forwarded?.split(",")[0] || realIp || "unknown"

  // Em produção, usar também user-agent para melhor identificação
  const userAgent = req.headers.get("user-agent") || "unknown"
  const identifier = `${ip}-${userAgent.substring(0, 50)}`

  return identifier
}

// Middleware para aplicar rate limiting
export function withRateLimit(rateLimiter: RateLimiter) {
  return (handler: (req: Request) => Promise<Response>) =>
    async (req: Request): Promise<Response> => {
      const identifier = getUserIdentifier(req)
      const { allowed, remaining, resetTime } = rateLimiter.checkLimit(identifier)

      if (!allowed) {
        const remainingTime = Math.ceil((resetTime - Date.now()) / 1000)

        return Response.json(
          {
            success: false,
            error: "Rate limit exceeded",
            message: `Muitas requisições. Tente novamente em ${remainingTime} segundos.`,
            retryAfter: remainingTime,
          },
          {
            status: 429,
            headers: {
              "Retry-After": remainingTime.toString(),
              "X-RateLimit-Limit": rateLimiter["maxRequests"].toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
            },
          },
        )
      }

      // Adicionar headers de rate limit na resposta
      const response = await handler(req)

      response.headers.set("X-RateLimit-Limit", rateLimiter["maxRequests"].toString())
      response.headers.set("X-RateLimit-Remaining", remaining.toString())
      response.headers.set("X-RateLimit-Reset", Math.ceil(resetTime / 1000).toString())

      return response
    }
}
