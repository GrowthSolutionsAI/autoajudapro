"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, User, X, Plus, MessageCircle, Trash2, Zap, Clock, Sparkles, RefreshCw } from "lucide-react"
import { COACHING_PERSONAS } from "@/lib/claude-ai"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  tokens?: number
  provider?: string
  model?: string
}

interface Conversation {
  id: string
  title: string
  persona: string
  messages: Message[]
  createdAt: Date
  lastActivity: Date
  messageCount: number
}

interface AdvancedChatInterfaceProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  userId: string
  hasActiveSubscription: boolean
}

export default function AdvancedChatInterface({
  isOpen,
  onClose,
  userName,
  userId,
  hasActiveSubscription,
}: AdvancedChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string>("")
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<string>("general")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [userStats, setUserStats] = useState({
    messagesCount: 0,
    tokensUsed: 0,
    conversationsCount: 0,
    remaining: 100,
  })
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentConversation = conversations.find((c) => c.id === currentConversationId)
  const currentPersona = COACHING_PERSONAS.find((p) => p.id === selectedPersona) || COACHING_PERSONAS[0]

  // Scroll automático
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentConversation?.messages, streamingMessage])

  // Criar nova conversa
  const createNewConversation = useCallback(
    (persona = "general") => {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: `Nova conversa - ${COACHING_PERSONAS.find((p) => p.id === persona)?.name || "Geral"}`,
        persona,
        messages: [
          {
            id: "welcome-" + Date.now(),
            role: "assistant",
            content: getWelcomeMessage(persona, userName),
            timestamp: new Date(),
            provider: "system",
          },
        ],
        createdAt: new Date(),
        lastActivity: new Date(),
        messageCount: 0,
      }

      setConversations((prev) => [newConversation, ...prev])
      setCurrentConversationId(newConversation.id)
      setSelectedPersona(persona)
      setIsSidebarOpen(false)
    },
    [userName],
  )

  // Inicializar primeira conversa
  useEffect(() => {
    if (isOpen && conversations.length === 0) {
      createNewConversation("general")
    }
  }, [isOpen, conversations.length, createNewConversation])

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !currentConversation) return

    // Verificar limite de mensagens
    if (!hasActiveSubscription && userStats.messagesCount >= 3) {
      // Abrir modal de pagamento
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    // Adicionar mensagem do usuário
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              lastActivity: new Date(),
              messageCount: conv.messageCount + 1,
              title: conv.messageCount === 0 ? input.trim().substring(0, 50) : conv.title,
            }
          : conv,
      ),
    )

    setInput("")
    setIsLoading(true)
    setIsStreaming(true)
    setStreamingMessage("")

    try {
      const response = await fetch("/api/chat/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...currentConversation.messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          conversationId: currentConversationId,
          userId,
          persona: selectedPersona,
          useCache: true,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
          tokens: data.tokens,
          provider: data.provider,
          model: data.model,
        }

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, assistantMessage],
                  lastActivity: new Date(),
                }
              : conv,
          ),
        )

        // Atualizar estatísticas
        setUserStats((prev) => ({
          ...prev,
          messagesCount: prev.messagesCount + 1,
          tokensUsed: prev.tokensUsed + (data.tokens || 0),
          remaining: data.remaining || prev.remaining,
        }))
      } else {
        throw new Error(data.error || "Erro desconhecido")
      }
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error)

      // Mensagem de erro
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "Desculpe, estou com dificuldades técnicas no momento. Tente novamente em alguns instantes. 💙",
        timestamp: new Date(),
        provider: "error",
      }

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [...conv.messages, errorMessage],
                lastActivity: new Date(),
              }
            : conv,
        ),
      )
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      setStreamingMessage("")
    }
  }

  // Deletar conversa
  const deleteConversation = (conversationId: string) => {
    if (conversations.length <= 1) return

    setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))

    if (currentConversationId === conversationId) {
      const remaining = conversations.filter((conv) => conv.id !== conversationId)
      setCurrentConversationId(remaining[0]?.id || "")
    }
  }

  // Trocar persona
  const changePersona = (persona: string) => {
    setSelectedPersona(persona)
    createNewConversation(persona)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 z-50 flex">
      {/* Sidebar */}
      <div
        className={`
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 
        fixed md:relative 
        w-80 md:w-80 
        h-full 
        bg-white/90 backdrop-blur-md 
        border-r border-blue-100 
        flex flex-col 
        transition-transform duration-300 ease-in-out
        z-50 md:z-auto
      `}
      >
        {/* Header Sidebar */}
        <div className="p-4 border-b border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Sofia AI Coach</span>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="hover:bg-red-100 hover:text-red-600 rounded-full p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Estatísticas do usuário */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Mensagens hoje</span>
              <Badge variant={hasActiveSubscription ? "default" : "secondary"}>
                {hasActiveSubscription ? "∞" : `${userStats.remaining} restantes`}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{userStats.messagesCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>{userStats.tokensUsed}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => createNewConversation(selectedPersona)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Conversa
          </Button>
        </div>

        {/* Personas */}
        <div className="p-4 border-b border-blue-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Especialidades</h3>
          <div className="grid grid-cols-2 gap-2">
            {COACHING_PERSONAS.map((persona) => (
              <Button
                key={persona.id}
                onClick={() => changePersona(persona.id)}
                variant={selectedPersona === persona.id ? "default" : "outline"}
                size="sm"
                className="h-auto p-2 flex flex-col items-center gap-1"
              >
                <span className="text-lg">{persona.icon}</span>
                <span className="text-xs text-center leading-tight">{persona.name.replace("Sofia - ", "")}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto p-2">
          <h3 className="text-sm font-medium text-gray-700 mb-3 px-2">Conversas Recentes</h3>
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 group ${
                currentConversationId === conversation.id
                  ? "bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => {
                setCurrentConversationId(conversation.id)
                setSelectedPersona(conversation.persona)
                setIsSidebarOpen(false)
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">
                      {COACHING_PERSONAS.find((p) => p.id === conversation.persona)?.icon || "🌟"}
                    </span>
                    <span className="text-sm font-medium text-gray-900 truncate">{conversation.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{conversation.lastActivity.toLocaleDateString("pt-BR")}</p>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {conversation.messageCount} msgs
                    </span>
                  </div>
                </div>

                {conversations.length > 1 && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteConversation(conversation.id)
                    }}
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 rounded-full p-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info do usuário */}
        <div className="p-4 border-t border-blue-100">
          <div className="flex items-center gap-3">
            <div className="bg-gray-300 p-2 rounded-full">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{userName}</p>
              <div className="flex items-center gap-1">
                {hasActiveSubscription ? (
                  <>
                    <Sparkles className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-yellow-600">Premium Ativo</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">Usuário Gratuito</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header do Chat */}
        <div className="bg-white/80 backdrop-blur-md border-b border-blue-100 p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              onClick={() => setIsSidebarOpen(true)}
              variant="ghost"
              size="sm"
              className="md:hidden hover:bg-gray-100 rounded-full p-2"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>

            <div className={`bg-gradient-to-r ${currentPersona.color} p-2 md:p-3 rounded-xl`}>
              <span className="text-lg md:text-xl">{currentPersona.icon}</span>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">{currentPersona.name}</h1>
              <p className="text-xs md:text-sm text-gray-600 truncate">{currentPersona.description}</p>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              {hasActiveSubscription ? (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              ) : (
                <Badge variant="secondary">{userStats.remaining} restantes</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          {currentConversation?.messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 md:gap-4 mb-6 md:mb-8 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div
                  className={`bg-gradient-to-r ${currentPersona.color} p-2 md:p-3 rounded-full flex-shrink-0 h-10 w-10 md:h-12 md:w-12 flex items-center justify-center`}
                >
                  <span className="text-lg md:text-xl">{currentPersona.icon}</span>
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-[80%] p-4 md:p-6 rounded-2xl ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "bg-white/90 backdrop-blur-sm text-gray-900 shadow-lg border border-blue-100"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2 md:mb-3">
                    <span className="font-semibold text-blue-600 text-sm md:text-base">{currentPersona.name}</span>
                    {message.provider && (
                      <Badge variant="outline" className="text-xs">
                        {message.provider === "anthropic"
                          ? "Claude"
                          : message.provider === "groq-fallback"
                            ? "Groq"
                            : message.provider === "cache"
                              ? "Cache"
                              : "Sistema"}
                      </Badge>
                    )}
                  </div>
                )}
                <div className="prose prose-sm max-w-none">
                  <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-sm">{message.content}</p>
                </div>
                {message.tokens && (
                  <div className="mt-2 text-xs text-gray-500">
                    {message.tokens} tokens •{" "}
                    {message.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>

              {message.role === "user" && (
                <div className="bg-gray-300 p-2 md:p-3 rounded-full flex-shrink-0 h-10 w-10 md:h-12 md:w-12 flex items-center justify-center">
                  <User className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {/* Mensagem sendo digitada */}
          {isStreaming && streamingMessage && (
            <div className="flex gap-2 md:gap-4 mb-6 md:mb-8 justify-start">
              <div
                className={`bg-gradient-to-r ${currentPersona.color} p-2 md:p-3 rounded-full flex-shrink-0 h-10 w-10 md:h-12 md:w-12 flex items-center justify-center`}
              >
                <span className="text-lg md:text-xl">{currentPersona.icon}</span>
              </div>
              <div className="max-w-[85%] md:max-w-[80%] p-4 md:p-6 rounded-2xl bg-white/90 backdrop-blur-sm text-gray-900 shadow-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2 md:mb-3">
                  <span className="font-semibold text-blue-600 text-sm md:text-base">{currentPersona.name}</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-sm">{streamingMessage}</p>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && !isStreaming && (
            <div className="flex gap-2 md:gap-4 mb-6 md:mb-8 justify-start">
              <div
                className={`bg-gradient-to-r ${currentPersona.color} p-2 md:p-3 rounded-full flex-shrink-0 h-10 w-10 md:h-12 md:w-12 flex items-center justify-center`}
              >
                <span className="text-lg md:text-xl">{currentPersona.icon}</span>
              </div>
              <div className="bg-white/90 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2 md:mb-3">
                  <span className="font-semibold text-blue-600 text-sm md:text-base">{currentPersona.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm text-gray-600">Pensando...</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white/80 backdrop-blur-md border-t border-blue-100 p-3 md:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex gap-2 md:gap-3"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                !hasActiveSubscription && userStats.messagesCount >= 3
                  ? "Limite de mensagens gratuitas atingido"
                  : `Converse com ${currentPersona.name}...`
              }
              className="flex-1 rounded-full border-blue-200 focus:border-blue-500 py-6 px-4 md:px-6 text-base"
              disabled={isLoading || (!hasActiveSubscription && userStats.messagesCount >= 3)}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim() || (!hasActiveSubscription && userStats.messagesCount >= 3)}
              className={`bg-gradient-to-r ${currentPersona.color} hover:opacity-90 text-white rounded-full p-3 md:p-4`}
            >
              {isLoading ? (
                <RefreshCw className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
              ) : (
                <Send className="h-5 w-5 md:h-6 md:w-6" />
              )}
            </Button>
          </form>

          <div className="flex justify-center items-center mt-2 md:mt-3">
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
              <span>
                {hasActiveSubscription
                  ? "Conversas ilimitadas ativadas • Powered by Claude AI"
                  : `${userStats.remaining} mensagens gratuitas restantes • Powered by Claude AI`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getWelcomeMessage(persona: string, userName: string): string {
  const messages = {
    general: `Olá ${userName}! 🌟

Sou a Sofia, sua coach de desenvolvimento pessoal. Estou aqui para te apoiar em sua jornada de autoconhecimento e crescimento.

**Como posso te ajudar hoje?**
- 💭 Reflexões sobre vida e propósito
- 🌱 Desenvolvimento de hábitos positivos
- 🎯 Definição e alcance de objetivos
- 💪 Fortalecimento da autoestima

O que está em seu coração hoje? 💙`,

    relationships: `Olá ${userName}! 💕

Sou a Sofia, especialista em relacionamentos. Estou aqui para te ajudar a construir conexões mais profundas e saudáveis.

**Posso te apoiar com:**
- 💑 Relacionamentos amorosos
- 👨‍👩‍👧‍👦 Dinâmicas familiares
- 👥 Amizades e vínculos sociais
- 🗣️ Comunicação assertiva

Como estão seus relacionamentos atualmente? 🤗`,

    career: `Olá ${userName}! 💼

Sou a Sofia, sua coach de carreira. Vou te ajudar a encontrar clareza e direção em sua jornada profissional.

**Vamos trabalhar juntos em:**
- 🎯 Definição de objetivos profissionais
- 🚀 Transição de carreira
- 💡 Descoberta do seu propósito
- ⚖️ Equilíbrio trabalho-vida

Qual é seu maior desafio profissional hoje? ✨`,

    wellness: `Olá ${userName}! 🧘

Sou a Sofia, especialista em bem-estar mental. Estou aqui para te apoiar no cuidado da sua saúde emocional.

**Posso te ajudar com:**
- 😰 Gestão de ansiedade e estresse
- 💪 Fortalecimento da autoestima
- 🧘 Técnicas de mindfulness
- 🌱 Desenvolvimento de resiliência

Como você está se sentindo hoje? 💙`,

    finance: `Olá ${userName}! 💰

Sou a Sofia, sua coach financeira. Vou te ajudar a desenvolver uma relação mais saudável com o dinheiro.

**Vamos trabalhar em:**
- 💡 Mindset sobre dinheiro
- 📊 Planejamento financeiro
- 🎯 Metas financeiras
- 🛡️ Segurança financeira

Qual é sua principal preocupação financeira? 📈`,
  }

  return messages[persona as keyof typeof messages] || messages.general
}
