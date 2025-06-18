import { metrics } from "@/lib/metrics"
import { withRateLimit, apiRateLimiter } from "@/lib/rate-limiter"

async function handleMetricsRequest(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url)
    const metric = url.searchParams.get("metric")
    const since = url.searchParams.get("since")
    const format = url.searchParams.get("format") || "json"

    const sinceTimestamp = since ? Number.parseInt(since) : Date.now() - 60 * 60 * 1000 // 1 hora padrão

    if (metric) {
      // Retornar métrica específica
      const stats = metrics.getStats(metric, sinceTimestamp)
      const rawMetrics = metrics.getMetrics(metric, sinceTimestamp)

      return Response.json({
        metric,
        period: {
          since: new Date(sinceTimestamp).toISOString(),
          until: new Date().toISOString(),
        },
        stats,
        data: format === "raw" ? rawMetrics : undefined,
      })
    }

    // Retornar resumo geral
    const commonMetrics = [
      "api.requests.total",
      "api.response_time",
      "api.errors.total",
      "chat.requests.total",
      "chat.generation_time",
      "chat.responses.total",
      "chat.fallbacks.total",
      "chat.cache.hits",
      "chat.cache.misses",
    ]

    const summary = commonMetrics.reduce(
      (acc, metricName) => {
        acc[metricName] = metrics.getStats(metricName, sinceTimestamp)
        return acc
      },
      {} as Record<string, any>,
    )

    // Adicionar métricas do sistema
    const systemHealth = metrics.getSystemHealth()

    return Response.json({
      period: {
        since: new Date(sinceTimestamp).toISOString(),
        until: new Date().toISOString(),
      },
      system: {
        uptime: systemHealth.uptime,
        health: systemHealth.overall,
        services: systemHealth.services.length,
      },
      metrics: summary,
    })
  } catch (error) {
    console.error("Metrics endpoint error:", error)

    return Response.json(
      {
        error: "Failed to retrieve metrics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Aplicar rate limiting mais restritivo para métricas
export const GET = withRateLimit(apiRateLimiter)(handleMetricsRequest)
