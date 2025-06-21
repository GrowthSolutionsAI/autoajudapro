import { Redis } from "@upstash/redis"

export class RedisCacheService {
  private redis: Redis

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }

  // Cache de respostas similares
  async getCachedResponse(messageHash: string): Promise<string | null> {
    try {
      const cached = await this.redis.get(`response:${messageHash}`)
      return cached as string | null
    } catch (error) {
      console.error("❌ Erro ao buscar cache:", error)
      return null
    }
  }

  async setCachedResponse(messageHash: string, response: string, ttl = 3600): Promise<void> {
    try {
      await this.redis.setex(`response:${messageHash}`, ttl, response)
    } catch (error) {
      console.error("❌ Erro ao salvar cache:", error)
    }
  }

  // Rate limiting por usuário
  async checkRateLimit(
    userId: string,
    limit = 50,
    window = 3600,
  ): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
  }> {
    try {
      const key = `rate_limit:${userId}`
      const current = await this.redis.incr(key)

      if (current === 1) {
        await this.redis.expire(key, window)
      }

      const ttl = await this.redis.ttl(key)
      const resetTime = Date.now() + ttl * 1000

      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetTime,
      }
    } catch (error) {
      console.error("❌ Erro no rate limit:", error)
      return { allowed: true, remaining: limit, resetTime: Date.now() + window * 1000 }
    }
  }

  // Cache de sessão de usuário
  async getUserSession(userId: string): Promise<any> {
    try {
      const session = await this.redis.get(`session:${userId}`)
      return session ? JSON.parse(session as string) : null
    } catch (error) {
      console.error("❌ Erro ao buscar sessão:", error)
      return null
    }
  }

  async setUserSession(userId: string, sessionData: any, ttl = 86400): Promise<void> {
    try {
      await this.redis.setex(`session:${userId}`, ttl, JSON.stringify(sessionData))
    } catch (error) {
      console.error("❌ Erro ao salvar sessão:", error)
    }
  }

  // Estatísticas em tempo real
  async incrementUserStats(userId: string, metric: string): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0]
      const key = `stats:${userId}:${today}:${metric}`
      await this.redis.incr(key)
      await this.redis.expire(key, 86400 * 7) // 7 dias
    } catch (error) {
      console.error("❌ Erro ao incrementar stats:", error)
    }
  }

  async getUserStats(userId: string, days = 7): Promise<Record<string, number>> {
    try {
      const stats: Record<string, number> = {}
      const promises = []

      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        promises.push(
          this.redis.get(`stats:${userId}:${dateStr}:messages`),
          this.redis.get(`stats:${userId}:${dateStr}:tokens`),
        )
      }

      const results = await Promise.all(promises)

      // Processar resultados
      for (let i = 0; i < results.length; i += 2) {
        const date = new Date()
        date.setDate(date.getDate() - Math.floor(i / 2))
        const dateStr = date.toISOString().split("T")[0]

        stats[`${dateStr}:messages`] = Number(results[i]) || 0
        stats[`${dateStr}:tokens`] = Number(results[i + 1]) || 0
      }

      return stats
    } catch (error) {
      console.error("❌ Erro ao buscar stats:", error)
      return {}
    }
  }
}
