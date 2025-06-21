"use client"

import { useState, useCallback, useRef, useEffect } from "react"

export interface StreamingMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  isStreaming?: boolean
  tokens?: number
  timestamp?: string
}

export interface StreamingChatOptions {
  userId: string
  persona?: string
  userPlan?: "free" | "pro" | "premium"
  onError?: (error: string) => void
  onRateLimit?: (resetTime: number) => void
}

export function useStreamingChat(options: StreamingChatOptions) {
  const [messages, setMessages] = useState<StreamingMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: number
    resetTime: number
  } | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const currentStreamingMessageRef = useRef<string>("")

  const sendMessage = useCallback(
    async (content: string, context?: any) => {
      if (isStreaming) return

      setError(null)
      setIsStreaming(true)

      // Adicionar mensagem do usuário
      const userMessage: StreamingMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])

      // Preparar mensagem de resposta (streaming)
      const assistantMessageId = (Date.now() + 1).toString()
      const assistantMessage: StreamingMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        isStreaming: true,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      currentStreamingMessageRef.current = ""

      try {
        // Criar AbortController para cancelar se necessário
        abortControllerRef.current = new AbortController()

        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            userId: options.userId,
            persona: options.persona || "general",
            userPlan: options.userPlan || "free",
            context,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          if (response.status === 429) {
            const errorData = await response.json()
            setRateLimitInfo({
              remaining: errorData.remaining,
              resetTime: errorData.resetTime,
            })
            options.onRateLimit?.(errorData.resetTime)
            throw new Error("Rate limit excedido")
          }
          throw new Error(`HTTP ${response.status}`)
        }

        if (!response.body) {
          throw new Error("Resposta sem body")
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n").filter((line) => line.trim())

          for (const line of lines) {
            try {
              const data = JSON.parse(line)

              if (data.error) {
                throw new Error(data.error)
              }

              if (data.content) {
                currentStreamingMessageRef.current += data.content

                // Atualizar mensagem em tempo real
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          content: currentStreamingMessageRef.current,
                          tokens: data.tokens,
                        }
                      : msg,
                  ),
                )
              }

              if (data.isComplete) {
                // Finalizar streaming
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          content: currentStreamingMessageRef.current,
                          isStreaming: false,
                          tokens: data.tokens,
                        }
                      : msg,
                  ),
                )
                break
              }
            } catch (parseError) {
              console.error("Erro ao fazer parse do chunk:", parseError)
            }
          }
        }
      } catch (error) {
        console.error("Erro no streaming:", error)

        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
        setError(errorMessage)
        options.onError?.(errorMessage)

        // Remover mensagem de streaming com erro
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId))

        // Adicionar mensagem de erro
        const errorResponseMessage: StreamingMessage = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: `Desculpe, ocorreu um erro: ${errorMessage}. Tente novamente em alguns instantes.`,
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, errorResponseMessage])
      } finally {
        setIsStreaming(false)
        abortControllerRef.current = null
      }
    },
    [messages, isStreaming, options],
  )

  const cancelStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsStreaming(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
    setRateLimitInfo(null)
  }, [])

  const retryLastMessage = useCallback(() => {
    if (messages.length >= 2) {
      const lastUserMessage = [...messages].reverse().find((msg) => msg.role === "user")
      if (lastUserMessage) {
        // Remover última resposta com erro
        setMessages((prev) => {
          const lastAssistantIndex = prev.map((m) => m.role).lastIndexOf("assistant")
          if (lastAssistantIndex !== -1) {
            return prev.slice(0, lastAssistantIndex)
          }
          return prev
        })

        // Reenviar mensagem
        sendMessage(lastUserMessage.content)
      }
    }
  }, [messages, sendMessage])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    messages,
    isStreaming,
    error,
    rateLimitInfo,
    sendMessage,
    cancelStreaming,
    clearMessages,
    retryLastMessage,
  }
}
