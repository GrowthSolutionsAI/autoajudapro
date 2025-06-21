import { RedisCacheService } from "./redis-cache"

export interface RateLimitConfig {
  messages: number
  tokens: number
  period: number // em segundos
  burstLimit?: number // limite de rajada
}

export interface RateLimitResult {
  allowed: boolean
  remaining: {
    messages: number
    tokens: number
  }
  resetTime: number
  currentUsage: {
    messages: number
    tokens: number
  }
  plan: string
}

export const PLAN_LIMITS: Record<string, RateLimitConfig> = {
  free: {
    messages: 10,
    tokens: 50000,
    period: 24 * 60 * 60, // 24 horas
    burstLimit: 3, // máximo 3 mensagens em 1 minuto
  },
  pro: {
    messages: 100,
    tokens: 500000,
    period: 24 * 60 * 60,
    burstLimit: 10,
  },
  premium: {
    messages: 1000,
    tokens: 5000000,
    period: 24 * 60 * 60,
    burstLimit: 50,
  },
  unlimited: {
    messages: -1, // ilimitado
    tokens: -1,
    period: 24 * 60 * 60,
    burstLimit: 100,
  },
}

export class AdvancedRateLimiter {
  private cache: RedisCacheService

  constructor() {
    this.cache = new RedisCacheService()
  }

  async checkRateLimit(userId: string, plan: string, tokensToConsume = 0): Promise<RateLimitResult> {
    const config = PLAN_LIMITS[plan] || PLAN_LIMITS.free
    const now = Date.now()
    const windowStart = now - config.period * 1000

    try {
      // Chaves Redis
      const messagesKey = `rate_limit:${userId}:messages`
      const tokensKey = `rate_limit:${userId}:tokens`
      const burstKey = `rate_limit:${userId}:burst`

      // Verificar limite de rajada (último minuto)
      const burstCount = await this.cache.redis.incr(burstKey)
      if (burstCount === 1) {
        await this.cache.redis.expire(burstKey, 60) // 1 minuto
      }

      if (config.burstLimit && burstCount > config.burstLimit) {
        return {
          allowed: false,
          remaining: { messages: 0, tokens: 0 },
          resetTime: now + 60000, // 1 minuto
          currentUsage: { messages: burstCount, tokens: 0 },
          plan,
        }
      }

      // Verificar limites diários
      const [currentMessages, currentTokens] = await Promise.all([
        this.cache.redis.get(messagesKey),
        this.cache.redis.get(tokensKey),
      ])

      const messagesUsed = Number(currentMessages) || 0
      const tokensUsed = Number(currentTokens) || 0

      // Verificar se pode consumir
      const canConsumeMessages = config.messages === -1 || messagesUsed < config.messages
      const canConsumeTokens = config.tokens === -1 || tokensUsed + tokensToConsume <= config.tokens

      if (!canConsumeMessages || !canConsumeTokens) {
        return {
          allowed: false,
          remaining: {
            messages: config.messages === -1 ? -1 : Math.max(0, config.messages - messagesUsed),
            tokens: config.tokens === -1 ? -1 : Math.max(0, config.tokens - tokensUsed),
          },
          resetTime: now + config.period * 1000,
          currentUsage: { messages: messagesUsed, tokens: tokensUsed },
          plan,
        }
      }

      // Consumir recursos
      const pipeline = this.cache.redis.pipeline()
      pipeline.incr(messagesKey)
      pipeline.expire(messagesKey, config.period)

      if (tokensToConsume > 0) {
        pipeline.incrby(tokensKey, tokensToConsume)
        pipeline.expire(tokensKey, config.period)
      }

      await pipeline.exec()

      return {
        allowed: true,
        remaining: {
          messages: config.messages === -1 ? -1 : Math.max(0, config.messages - messagesUsed - 1),
          tokens: config.tokens === -1 ? -1 : Math.max(0, config.tokens - tokensUsed - tokensToConsume),
        },
        resetTime: now + config.period * 1000,
        currentUsage: {
          messages: messagesUsed + 1,
          tokens: tokensUsed + tokensToConsume,
        },
        plan,
      }
    } catch (error) {
      console.error("❌ Erro no rate limiting:", error)
      // Em caso de erro, permitir (fail-open)
      return {
        allowed: true,
        remaining: { messages: -1, tokens: -1 },
        resetTime: now + config.period * 1000,
        currentUsage: { messages: 0, tokens: 0 },
        plan,
      }
    }
  }

  async getUserUsageStats(
    userId: string,
    days = 7,
  ): Promise<{
    daily: Array<{
      date: string
      messages: number
      tokens: number
    }>
    total: {
      messages: number
      tokens: number
    }
  }> {
    try {
      const stats = await this.cache.getUserStats(userId, days)
      const daily = []
      let totalMessages = 0
      let totalTokens = 0

      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        const messages = stats[`${dateStr}:messages`] || 0
        const tokens = stats[`${dateStr}:tokens`] || 0

        daily.push({ date: dateStr, messages, tokens })
        totalMessages += messages
        totalTokens += tokens
      }

      return {
        daily: daily.reverse(),
        total: { messages: totalMessages, tokens: totalTokens },
      }
    } catch (error) {
      console.error("❌ Erro ao buscar estatísticas:", error)
      return {
        daily: [],
        total: { messages: 0, tokens: 0 },
      }
    }
  }

  async resetUserLimits(userId: string): Promise<void> {
    try {
      const keys = [`rate_limit:${userId}:messages`, `rate_limit:${userId}:tokens`, `rate_limit:${userId}:burst`]

      await Promise.all(keys.map((key) => this.cache.redis.del(key)))
      console.log(`✅ Limites resetados para usuário: ${userId}`)
    } catch (error) {
      console.error("❌ Erro ao resetar limites:", error)
    }
  }
}
