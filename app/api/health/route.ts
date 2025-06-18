import { metrics } from "@/lib/metrics"
import { responseCache } from "@/lib/response-cache"

export async function GET() {
  try {
    const startTime = Date.now()

    // Testar conectividade básica
    const basicHealth = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || "1.0.0",
    }

    // Testar GroqCloud (se configurado)
    let groqHealth = { status: "not_configured", responseTime: 0 }
    if (process.env.GROQ_API_KEY) {
      try {
        const groqStart = Date.now()
        const response = await fetch("https://api.groq.com/openai/v1/models", {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(5000), // 5 segundos timeout
        })

        const groqTime = Date.now() - groqStart
        groqHealth = {
          status: response.ok ? "healthy" : "degraded",
          responseTime: groqTime,
        }

        metrics.setHealthCheck("groq", response.ok ? "healthy" : "degraded", groqTime)
      } catch (error) {
        groqHealth = { status: "unhealthy", responseTime: 0 }
        metrics.setHealthCheck("groq", "unhealthy", 0, error instanceof Error ? error.message : "Unknown error")
      }
    }

    // Estatísticas do sistema
    const cacheStats = responseCache.getStats()
    const systemHealth = metrics.getSystemHealth()

    // Métricas dos últimos 5 minutos
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    const recentStats = {
      requests: metrics.getStats("api.requests.total", fiveMinutesAgo),
      chatRequests: metrics.getStats("chat.requests.total", fiveMinutesAgo),
      responseTime: metrics.getStats("api.response_time", fiveMinutesAgo),
      errors: metrics.getStats("api.errors.total", fiveMinutesAgo),
    }

    const totalTime = Date.now() - startTime

    const healthData = {
      ...basicHealth,
      services: {
        groq: groqHealth,
        cache: {
          status: "healthy",
          stats: cacheStats,
        },
        rateLimiter: {
          status: "healthy",
          // Note: Rate limiter stats would need to be implemented
        },
      },
      metrics: recentStats,
      overall: systemHealth.overall,
      checkDuration: totalTime,
    }

    // Determinar status HTTP baseado na saúde geral
    const statusCode = systemHealth.overall === "healthy" ? 200 : systemHealth.overall === "degraded" ? 200 : 503

    return Response.json(healthData, { status: statusCode })
  } catch (error) {
    console.error("Health check failed:", error)

    return Response.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
