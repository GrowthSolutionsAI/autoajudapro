// Sistema de métricas e monitoramento
interface MetricEntry {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

interface HealthCheck {
  service: string
  status: "healthy" | "degraded" | "unhealthy"
  responseTime?: number
  error?: string
  timestamp: number
}

class MetricsCollector {
  private metrics: MetricEntry[] = []
  private healthChecks: Map<string, HealthCheck> = new Map()
  private readonly maxMetrics = 10000
  private readonly cleanupInterval: NodeJS.Timeout

  constructor() {
    // Limpar métricas antigas a cada 30 minutos
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup()
      },
      30 * 60 * 1000,
    )
  }

  private cleanup() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000 // 24 horas
    const before = this.metrics.length

    this.metrics = this.metrics.filter((metric) => metric.timestamp > cutoff)

    // Se ainda estiver muito grande, manter apenas os mais recentes
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    console.log(`📊 Metrics cleanup: ${before - this.metrics.length} métricas removidas`)
  }

  // Registrar métrica
  public record(name: string, value: number, tags?: Record<string, string>) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      tags,
    })
  }

  // Incrementar contador
  public increment(name: string, tags?: Record<string, string>) {
    this.record(name, 1, tags)
  }

  // Registrar tempo de resposta
  public timing(name: string, duration: number, tags?: Record<string, string>) {
    this.record(`${name}.duration`, duration, tags)
  }

  // Health check
  public setHealthCheck(service: string, status: HealthCheck["status"], responseTime?: number, error?: string) {
    this.healthChecks.set(service, {
      service,
      status,
      responseTime,
      error,
      timestamp: Date.now(),
    })
  }

  // Obter métricas agregadas
  public getMetrics(name?: string, since?: number): MetricEntry[] {
    let filtered = this.metrics

    if (name) {
      filtered = filtered.filter((m) => m.name === name)
    }

    if (since) {
      filtered = filtered.filter((m) => m.timestamp >= since)
    }

    return filtered
  }

  // Estatísticas de uma métrica
  public getStats(
    name: string,
    since?: number,
  ): {
    count: number
    sum: number
    avg: number
    min: number
    max: number
    p95: number
  } {
    const metrics = this.getMetrics(name, since)

    if (metrics.length === 0) {
      return { count: 0, sum: 0, avg: 0, min: 0, max: 0, p95: 0 }
    }

    const values = metrics.map((m) => m.value).sort((a, b) => a - b)
    const sum = values.reduce((a, b) => a + b, 0)
    const p95Index = Math.floor(values.length * 0.95)

    return {
      count: values.length,
      sum,
      avg: sum / values.length,
      min: values[0],
      max: values[values.length - 1],
      p95: values[p95Index] || 0,
    }
  }

  // Status geral do sistema
  public getSystemHealth(): {
    overall: "healthy" | "degraded" | "unhealthy"
    services: HealthCheck[]
    uptime: number
  } {
    const services = Array.from(this.healthChecks.values())
    const unhealthyCount = services.filter((s) => s.status === "unhealthy").length
    const degradedCount = services.filter((s) => s.status === "degraded").length

    let overall: "healthy" | "degraded" | "unhealthy" = "healthy"

    if (unhealthyCount > 0) {
      overall = "unhealthy"
    } else if (degradedCount > 0) {
      overall = "degraded"
    }

    return {
      overall,
      services,
      uptime: process.uptime(),
    }
  }

  public destroy() {
    clearInterval(this.cleanupInterval)
    this.metrics = []
    this.healthChecks.clear()
  }
}

// Instância global
export const metrics = new MetricsCollector()

// Middleware para coletar métricas de API
export function withMetrics(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    const startTime = Date.now()
    const url = new URL(req.url)
    const endpoint = url.pathname

    metrics.increment("api.requests.total", {
      method: req.method,
      endpoint,
    })

    try {
      const response = await handler(req)
      const duration = Date.now() - startTime

      metrics.timing("api.response_time", duration, {
        method: req.method,
        endpoint,
        status: response.status.toString(),
      })

      metrics.increment("api.responses.total", {
        method: req.method,
        endpoint,
        status: response.status.toString(),
      })

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      metrics.timing("api.response_time", duration, {
        method: req.method,
        endpoint,
        status: "error",
      })

      metrics.increment("api.errors.total", {
        method: req.method,
        endpoint,
        error: error instanceof Error ? error.name : "unknown",
      })

      throw error
    }
  }
}

// Funções específicas para chat
export const chatMetrics = {
  requestReceived: (sessionId: string, messageCount: number) => {
    metrics.increment("chat.requests.total")
    metrics.record("chat.message_count", messageCount, { sessionId })
  },

  responseGenerated: (provider: string, duration: number, success: boolean) => {
    metrics.timing("chat.generation_time", duration, { provider })
    metrics.increment("chat.responses.total", {
      provider,
      success: success.toString(),
    })
  },

  fallbackUsed: (reason: string) => {
    metrics.increment("chat.fallbacks.total", { reason })
  },

  cacheHit: () => {
    metrics.increment("chat.cache.hits")
  },

  cacheMiss: () => {
    metrics.increment("chat.cache.misses")
  },
}
