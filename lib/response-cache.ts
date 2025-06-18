// Sistema de cache em memória para respostas da IA
interface CacheEntry {
  response: string
  timestamp: number
  hits: number
}

class ResponseCache {
  private cache: Map<string, CacheEntry> = new Map()
  private readonly maxSize: number
  private readonly ttlMs: number
  private readonly cleanupInterval: NodeJS.Timeout

  constructor(maxSize = 1000, ttlMs = 30 * 60 * 1000) {
    // 30 minutos
    this.maxSize = maxSize
    this.ttlMs = ttlMs

    // Limpar cache expirado a cada 10 minutos
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup()
      },
      10 * 60 * 1000,
    )
  }

  private generateKey(messages: any[]): string {
    // Gerar chave baseada nas últimas 3 mensagens para contexto
    const relevantMessages = messages.slice(-3)
    const content = relevantMessages.map((msg) => `${msg.role}:${msg.content}`).join("|")

    // Hash simples para reduzir tamanho da chave
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }

    return `chat_${Math.abs(hash)}`
  }

  private cleanup() {
    const now = Date.now()
    let removed = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttlMs) {
        this.cache.delete(key)
        removed++
      }
    }

    // Se ainda estiver muito grande, remover entradas menos usadas
    if (this.cache.size > this.maxSize) {
      const entries = Array.from(this.cache.entries()).sort((a, b) => a[1].hits - b[1].hits) // Ordenar por menos hits

      const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.2)) // Remover 20%
      toRemove.forEach(([key]) => this.cache.delete(key))
      removed += toRemove.length
    }

    if (removed > 0) {
      console.log(`🧹 Cache cleanup: ${removed} entradas removidas, ${this.cache.size} restantes`)
    }
  }

  public get(messages: any[]): string | null {
    const key = this.generateKey(messages)
    const entry = this.cache.get(key)

    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > this.ttlMs) {
      this.cache.delete(key)
      return null
    }

    // Incrementar hits e atualizar timestamp
    entry.hits++
    entry.timestamp = now

    console.log(`💾 Cache hit para chave: ${key} (${entry.hits} hits)`)
    return entry.response
  }

  public set(messages: any[], response: string): void {
    const key = this.generateKey(messages)

    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      hits: 1,
    })

    console.log(`💾 Cache armazenado para chave: ${key} (${this.cache.size} entradas total)`)
  }

  public clear(): void {
    this.cache.clear()
    console.log("🧹 Cache limpo completamente")
  }

  public getStats(): { size: number; maxSize: number; hitRate: number } {
    const totalHits = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.hits, 0)
    const totalEntries = this.cache.size

    return {
      size: totalEntries,
      maxSize: this.maxSize,
      hitRate: totalEntries > 0 ? totalHits / totalEntries : 0,
    }
  }

  public destroy() {
    clearInterval(this.cleanupInterval)
    this.cache.clear()
  }
}

// Instância global do cache
export const responseCache = new ResponseCache()

// Função helper para verificar se mensagens são similares o suficiente para cache
export function shouldUseCache(messages: any[]): boolean {
  // Não usar cache para primeiras mensagens (nomes)
  if (messages.length <= 2) return false

  // Não usar cache para mensagens muito longas ou muito específicas
  const lastMessage = messages[messages.length - 1]?.content || ""
  if (lastMessage.length > 500) return false

  // Não usar cache para mensagens com informações pessoais específicas
  const personalKeywords = ["meu nome", "eu sou", "nasci em", "moro em", "trabalho na"]
  if (personalKeywords.some((keyword) => lastMessage.toLowerCase().includes(keyword))) {
    return false
  }

  return true
}
