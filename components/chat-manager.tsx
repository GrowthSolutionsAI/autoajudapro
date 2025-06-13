"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Heart,
  Brain,
  Target,
  Briefcase,
  Smile,
  Zap,
  Send,
  User,
  X,
  Plus,
  MessageCircle,
  Crown,
  Lock,
  Lightbulb,
  Menu,
  ChevronLeft,
  Cpu,
  Trash2,
  Bot,
  RefreshCw,
} from "lucide-react"
import PaymentModal from "./payment-modal"

interface ChatSession {
  id: string
  title: string
  messages: Array<{ id: string; role: string; content: string }>
  createdAt: string
  lastActivity: string
  messageCount: number
  isPaid: boolean
}

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

interface ChatManagerProps {
  isOpen: boolean
  onClose: () => void
  userName: string
}

const FREE_MESSAGE_LIMIT = 5

// Adicione esta função no início do arquivo, fora do componente
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function ChatManager({ isOpen, onClose, userName }: ChatManagerProps) {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "Conversa Inicial",
      messages: [
        {
          id: "welcome",
          role: "assistant",
          content: `Olá! 💙

Sou a Sofia, sua IA especializada em psicologia positiva e desenvolvimento pessoal. Estou aqui para te apoiar em sua jornada de autoconhecimento e bem-estar.

Como você gostaria que eu te chamasse?`,
        },
      ],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      messageCount: 0,
      isPaid: false,
    },
  ])

  const [currentChatId, setCurrentChatId] = useState("1")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Para controle mobile
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showAreaButtons, setShowAreaButtons] = useState(false)
  const [showAreaOptions, setShowAreaOptions] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Adicione estes novos estados
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null)
  const [lastMessageError, setLastMessageError] = useState<string | null>(null)

  const currentChat = chatSessions.find((chat) => chat.id === currentChatId)
  const userMessageCount = currentChat?.messageCount || 0
  const isFreeLimitReached = userMessageCount >= FREE_MESSAGE_LIMIT && !currentChat?.isPaid
  const remainingFreeMessages = Math.max(0, FREE_MESSAGE_LIMIT - userMessageCount)

  // Áreas de especialidade com ícones e descrições
  const areaOptions = [
    {
      id: "relacionamentos",
      title: "Relacionamentos",
      icon: <Heart className="h-6 w-6 text-pink-500" />,
      description: "Melhore seus relacionamentos amorosos, familiares e amizades",
    },
    {
      id: "saude-mental",
      title: "Saúde Mental",
      icon: <Brain className="h-6 w-6 text-blue-500" />,
      description: "Suporte para ansiedade, estresse e desafios emocionais",
    },
    {
      id: "desenvolvimento-pessoal",
      title: "Desenvolvimento Pessoal",
      icon: <Target className="h-6 w-6 text-purple-500" />,
      description: "Aumente autoestima, confiança e desenvolva hábitos positivos",
    },
    {
      id: "carreira",
      title: "Carreira",
      icon: <Briefcase className="h-6 w-6 text-yellow-500" />,
      description: "Decisões profissionais e equilíbrio trabalho-vida",
    },
    {
      id: "financas-pessoais",
      title: "Finanças Pessoais",
      icon: <Smile className="h-6 w-6 text-green-500" />,
      description: "Organize finanças, reduza dívidas e crie hábitos saudáveis",
    },
    {
      id: "proposito-vida",
      title: "Propósito de Vida",
      icon: <Zap className="h-6 w-6 text-orange-500" />,
      description: "Encontre significado, propósito e direção na sua vida",
    },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Limpar timeout de retry quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
    }
  }, [retryTimeout])

  // Sincronizar mensagens com a sessão atual
  useEffect(() => {
    if (currentChat) {
      setMessages(
        currentChat.messages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
        })),
      )
      // Resetar botões de área se for uma nova conversa
      if (currentChat.messages.length === 1) {
        setShowAreaButtons(false)
        setShowSuggestions(false)
        setShowAreaOptions(false)
      } else if (currentChat.messages.length === 3) {
        // Após o usuário fornecer seu nome e a IA responder, mostrar os botões de área
        setShowAreaButtons(true)
        setShowSuggestions(true)
        setShowAreaOptions(true)
      } else {
        setShowAreaButtons(false)
        setShowSuggestions(false)
        setShowAreaOptions(false)
      }
    }
  }, [currentChatId, currentChat])

  const suggestions = [
    {
      icon: Heart,
      text: "Preciso de ajuda com meu relacionamento",
      category: "Relacionamentos",
    },
    {
      icon: Brain,
      text: "Estou me sentindo ansioso ultimamente",
      category: "Saúde Mental",
    },
    {
      icon: Target,
      text: "Quero melhorar minha autoestima",
      category: "Desenvolvimento Pessoal",
    },
    {
      icon: Briefcase,
      text: "Preciso de orientação na minha carreira",
      category: "Carreira",
    },
    {
      icon: Smile,
      text: "Estou com dificuldades financeiras",
      category: "Finanças",
    },
    {
      icon: Zap,
      text: "Quero encontrar meu propósito de vida",
      category: "Desenvolvimento",
    },
  ]

  const createNewChat = () => {
    const newChatId = Date.now().toString()
    const newChat: ChatSession = {
      id: newChatId,
      title: `Nova Conversa ${chatSessions.length + 1}`,
      messages: [
        {
          id: "welcome-" + newChatId,
          role: "assistant",
          content: `Olá! 💙

Sou a Sofia, sua IA especializada em psicologia positiva e desenvolvimento pessoal. Estou aqui para te apoiar em sua jornada de autoconhecimento e bem-estar.

Como você gostaria que eu te chamasse?`,
        },
      ],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      messageCount: 0,
      isPaid: false,
    }

    setChatSessions((prev) => [...prev, newChat])
    setCurrentChatId(newChatId)
    setShowSuggestions(false)
    setShowAreaButtons(false)
    setShowAreaOptions(false)
    setIsSidebarOpen(false) // Fechar sidebar no mobile após criar novo chat
  }

  const deleteChat = (chatId: string) => {
    if (chatSessions.length <= 1) return

    setChatSessions((prev) => prev.filter((chat) => chat.id !== chatId))

    if (currentChatId === chatId) {
      const remainingChats = chatSessions.filter((chat) => chat.id !== chatId)
      setCurrentChatId(remainingChats[0]?.id || "")
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setShowSuggestions(false)
    // Enviar automaticamente após um pequeno delay
    setTimeout(() => {
      handleSendMessage(suggestion)
    }, 100)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handlePaymentSuccess = () => {
    // Marcar chat atual como pago
    setChatSessions((prev) => prev.map((chat) => (chat.id === currentChatId ? { ...chat, isPaid: true } : chat)))
    setIsPaymentModalOpen(false)
  }

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId)
    setIsSidebarOpen(false) // Fechar sidebar no mobile após selecionar chat
  }

  const handleAreaSelection = (area: string) => {
    const message = `Gostaria de ajuda com ${area}`
    setShowAreaOptions(false)
    handleSendMessage(message)
  }

  // Função para tentar novamente após um erro
  const handleRetry = async () => {
    if (!currentChat || messages.length === 0) return

    // Encontrar a última mensagem do usuário
    const lastUserMessageIndex = [...messages].reverse().findIndex((msg) => msg.role === "user")
    if (lastUserMessageIndex === -1) return

    const lastUserMessage = [...messages].reverse()[lastUserMessageIndex]

    // Remover a mensagem de erro (última mensagem do assistente)
    const lastAssistantMessage = messages[messages.length - 1]
    if (lastAssistantMessage.role === "assistant") {
      // Remover a última mensagem (erro) do estado local
      setMessages((prev) => prev.slice(0, -1))

      // Remover a última mensagem (erro) da sessão de chat
      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: chat.messages.slice(0, -1),
              }
            : chat,
        ),
      )
    }

    // Tentar enviar a mensagem novamente
    setIsRetrying(true)
    await handleSendMessage(lastUserMessage.content)
    setIsRetrying(false)
  }

  // Modificar a função handleSendMessage para incluir melhor tratamento de erros
  const handleSendMessage = async (messageText: string = input) => {
    if (!messageText.trim() || !currentChat || (isLoading && !isRetrying)) return

    // Verificar limite de mensagens gratuitas
    if (isFreeLimitReached) {
      setIsPaymentModalOpen(true)
      return
    }

    // Definir newMessageCount no início da função
    const newMessageCount = currentChat.messageCount + 1

    // Se estiver retentando, não mostrar a mensagem do usuário novamente
    if (!isRetrying) {
      console.log("📤 Enviando mensagem:", messageText.substring(0, 50) + "...")

      setIsLoading(true)
      setInput("")
      setLastMessageError(null)

      // Adicionar mensagem do usuário
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: messageText,
      }

      // Atualizar mensagens locais imediatamente
      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)

      // Atualizar título do chat se for a primeira mensagem do usuário
      if (currentChat.messages.length === 1) {
        // Esta é a resposta ao "Como você gostaria que eu te chamasse?"
        const title = `Conversa com ${messageText}`
        setChatSessions((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  title,
                  lastActivity: new Date().toISOString(),
                  messageCount: newMessageCount,
                }
              : chat,
          ),
        )
      } else {
        // Apenas incrementar contador
        setChatSessions((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  lastActivity: new Date().toISOString(),
                  messageCount: newMessageCount,
                }
              : chat,
          ),
        )
      }

      // Atualizar sessão de chat com mensagem do usuário
      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, { ...userMessage }],
                lastActivity: new Date().toISOString(),
              }
            : chat,
        ),
      )
    }

    try {
      // Preparar mensagens para envio (excluir system messages)
      const messagesForAPI = isRetrying
        ? messages.filter((msg) => msg.role !== "system")
        : [...messages, { role: "user", content: messageText }].filter((msg) => msg.role !== "system")

      console.log("🌐 Fazendo requisição para /api/chat...")
      console.log("📤 Enviando mensagens:", messagesForAPI.length)
      console.log("📝 Mensagem do usuário:", messageText)

      // Implementação de retry com backoff exponencial
      let response = null
      let retries = 0
      const maxRetries = 2

      while (retries <= maxRetries) {
        try {
          response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: messagesForAPI,
            }),
          })

          // Se a resposta for bem-sucedida ou não for um erro temporário, saia do loop
          if (response.ok || (response.status !== 429 && response.status !== 503 && response.status !== 504)) {
            break
          }

          // Se for um erro de rate limit ou temporário, tente novamente
          retries++
          if (retries <= maxRetries) {
            const waitTime = Math.pow(2, retries) * 1000 // Backoff exponencial: 2s, 4s
            console.log(`⏳ Tentativa ${retries}/${maxRetries} falhou. Aguardando ${waitTime}ms...`)
            await sleep(waitTime)
          }
        } catch (networkError) {
          console.error("🌐 Erro de rede:", networkError)
          retries++
          if (retries <= maxRetries) {
            const waitTime = Math.pow(2, retries) * 1000
            console.log(`⏳ Erro de rede na tentativa ${retries}/${maxRetries}. Aguardando ${waitTime}ms...`)
            await sleep(waitTime)
          } else {
            throw networkError
          }
        }
      }

      console.log("📡 Status da resposta:", response?.status)

      // Se houver erro de rate limit, tente usar o fallback
      if (response && !response.ok && response.status === 429) {
        console.log("⚠️ Rate limit atingido, usando fallback...")
        const fallbackData = await getFallbackResponse(messagesForAPI)

        if (fallbackData && fallbackData.message) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: fallbackData.message,
          }

          // Atualizar mensagens com resposta de fallback
          setMessages((prev) => [...prev, assistantMessage])

          // Atualizar sessão de chat com resposta de fallback
          setChatSessions((prev) =>
            prev.map((chat) =>
              chat.id === currentChatId
                ? {
                    ...chat,
                    messages: [...chat.messages, { ...assistantMessage }],
                    lastActivity: new Date().toISOString(),
                  }
                : chat,
            ),
          )

          setIsLoading(false)
          return
        }
      }

      if (!response || !response.ok) {
        const errorText = (await response?.text()) || "Sem resposta do servidor"
        console.error("❌ Erro HTTP:", response?.status, errorText)
        throw new Error(`Erro HTTP: ${response?.status || "Sem status"}`)
      }

      const responseText = await response.text()
      console.log("📄 Resposta bruta (primeiros 200 chars):", responseText.substring(0, 200))

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ Erro ao fazer parse do JSON:", parseError)
        console.log("📄 Resposta completa:", responseText)
        throw new Error("Resposta inválida da API")
      }

      console.log("📦 Dados recebidos:", {
        success: data.success,
        hasMessage: !!data.message,
        messageLength: data.message?.length || 0,
        metadata: data.metadata,
      })

      if (!data.message) {
        console.error("❌ Resposta sem mensagem:", data)
        throw new Error("Resposta vazia da API")
      }

      // Verificar se não é a mensagem de fallback
      const isFallback = data.message.includes("dificuldades técnicas momentâneas")
      if (isFallback) {
        console.warn("⚠️ Recebida resposta de fallback - problema na API")
      }

      // Adicionar aviso sobre limite se estiver próximo
      let assistantContent = data.message
      const remainingAfterThis = FREE_MESSAGE_LIMIT - newMessageCount

      if (!currentChat.isPaid && remainingAfterThis <= 2 && remainingAfterThis > 0) {
        assistantContent += `\n\n---\n💡 **Aviso:** Você tem ${remainingAfterThis} mensagem${remainingAfterThis > 1 ? "s" : ""} gratuita${remainingAfterThis > 1 ? "s" : ""} restante${remainingAfterThis > 1 ? "s" : ""}. Para continuar nossa conversa sem limites, considere assinar um de nossos planos! 🌟`
      } else if (!currentChat.isPaid && remainingAfterThis === 0) {
        assistantContent += `\n\n---\n🔒 **Limite atingido!** Esta foi sua última mensagem gratuita. Para continuar nossa jornada juntos, escolha um plano que se adeque às suas necessidades. Estou ansiosa para continuar te ajudando! 💙`
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
      }

      console.log("✅ Mensagem do assistente criada:")
      console.log("📏 Tamanho:", assistantMessage.content.length, "caracteres")
      console.log("📝 Início:", assistantMessage.content.substring(0, 100) + "...")
      console.log("🤖 É fallback?", isFallback)

      // Atualizar mensagens com resposta da IA
      setMessages((prev) => [...prev, assistantMessage])

      // Atualizar sessão de chat com resposta da IA
      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, { ...assistantMessage }],
                lastActivity: new Date().toISOString(),
              }
            : chat,
        ),
      )

      // Verificar se deve abrir modal de pagamento após esta resposta
      if (newMessageCount >= FREE_MESSAGE_LIMIT && !currentChat.isPaid) {
        setTimeout(() => {
          setIsPaymentModalOpen(true)
        }, 2000) // Aguardar 2 segundos para o usuário ler a resposta
      }

      console.log("✅ Mensagem processada e exibida com sucesso")
      // Resetar contador de tentativas após sucesso
      setRetryCount(0)
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error)
      setLastMessageError(error instanceof Error ? error.message : "Erro desconhecido")

      // Se for um erro de rate limit, tente usar o fallback
      if (error instanceof Error && error.message.includes("rate_limit_exceeded")) {
        console.log("⚠️ Rate limit detectado no erro, tentando fallback...")

        try {
          const messagesForAPI = messages.filter((msg) => msg.role !== "system")
          const fallbackData = await getFallbackResponse(messagesForAPI)

          if (fallbackData && fallbackData.message) {
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: fallbackData.message,
            }

            // Atualizar mensagens com resposta de fallback
            setMessages((prev) => [...prev, assistantMessage])

            // Atualizar sessão de chat com resposta de fallback
            setChatSessions((prev) =>
              prev.map((chat) =>
                chat.id === currentChatId
                  ? {
                      ...chat,
                      messages: [...chat.messages, { ...assistantMessage }],
                      lastActivity: new Date().toISOString(),
                    }
                  : chat,
              ),
            )

            setIsLoading(false)
            return
          }
        } catch (fallbackError) {
          console.error("❌ Erro ao usar fallback:", fallbackError)
        }
      }

      // Mensagem de erro para o usuário
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: `Desculpe, estou com dificuldades técnicas no momento. 😔

**Detalhes do erro:** ${error instanceof Error ? error.message : "Erro desconhecido"}

**Enquanto isso, aqui estão algumas dicas:**

🧘 **Respiração Calmante:**
- Inspire por 4 segundos
- Segure por 4 segundos
- Expire por 6 segundos

💭 **Lembre-se:**
- Você é mais forte do que imagina
- Este momento difícil vai passar
- Estou aqui para te apoiar

**[Tentar novamente]** Clique para tentar enviar sua mensagem novamente.`,
      }

      setMessages((prev) => [...prev, errorMessage])

      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, { ...errorMessage }],
                lastActivity: new Date().toISOString(),
              }
            : chat,
        ),
      )

      // Configurar retry automático após 5 segundos
      const timeout = setTimeout(() => {
        console.log("🔄 Tentando novamente automaticamente...")
        handleRetry()
      }, 5000)

      setRetryTimeout(timeout)
    } finally {
      setIsLoading(false)
      setIsRetrying(false)
    }
  }

  // Função para obter resposta de fallback
  const getFallbackResponse = async (messages: Message[]) => {
    try {
      console.log("🔄 Tentando fallback...")
      const response = await fetch("/api/chat/fallback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      })

      if (!response.ok) {
        throw new Error(`Erro no fallback: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("❌ Erro no fallback:", error)
      return null
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 z-50 flex">
        {/* Sidebar - Responsivo */}
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
          {/* Header do Sidebar */}
          <div className="p-4 border-b border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                  <Cpu className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Suas Conversas</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsSidebarOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="md:hidden hover:bg-gray-100 rounded-full p-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="hover:bg-red-100 hover:text-red-600 rounded-full p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={createNewChat}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Conversa
            </Button>
          </div>

          {/* Lista de Chats */}
          <div className="flex-1 overflow-y-auto p-2">
            {chatSessions.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 group ${
                  currentChatId === chat.id
                    ? "bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleChatSelect(chat.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 truncate">{chat.title}</span>
                      {chat.isPaid && <Crown className="h-3 w-3 text-yellow-500" />}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {new Date(chat.lastActivity).toLocaleDateString("pt-BR")} às{" "}
                        {new Date(chat.lastActivity).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {!chat.isPaid && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {Math.max(0, FREE_MESSAGE_LIMIT - chat.messageCount)} restantes
                        </span>
                      )}
                    </div>
                  </div>

                  {chatSessions.length > 1 && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteChat(chat.id)
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
                <p className="text-xs text-gray-500">{currentChat?.isPaid ? "Usuário Premium" : "Usuário Gratuito"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay para mobile quando sidebar está aberta */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Área principal do chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header do Chat */}
          <div className="bg-white/80 backdrop-blur-md border-b border-blue-100 p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-4">
              {/* Botão menu mobile */}
              <Button
                onClick={() => setIsSidebarOpen(true)}
                variant="ghost"
                size="sm"
                className="md:hidden hover:bg-gray-100 rounded-full p-2"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 md:p-3 rounded-xl">
                <Bot className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">Sofia</h1>
                <p className="text-xs md:text-sm text-gray-600 truncate">IA Especialista em Autoajuda</p>
              </div>

              {/* Status do usuário - Oculto em telas muito pequenas */}
              <div className="hidden sm:flex items-center gap-2 md:gap-4">
                {currentChat?.isPaid ? (
                  <div className="flex items-center gap-2 bg-yellow-100 px-2 md:px-3 py-1 rounded-full">
                    <Crown className="w-3 h-3 md:w-4 md:h-4 text-yellow-600" />
                    <span className="text-xs md:text-sm text-yellow-700 font-medium">Premium</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-blue-100 px-2 md:px-3 py-1 rounded-full">
                    <span className="text-xs md:text-sm text-blue-700 font-medium">
                      {remainingFreeMessages} restantes
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-green-100 px-2 md:px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs md:text-sm text-green-700 font-medium">IA Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 md:p-6">
            {currentChat && currentChat.messages.length <= 1 && (
              <div className="text-center py-8 md:py-12">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 md:p-4 rounded-full w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 flex items-center justify-center">
                  <Bot className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Conversa com Sofia - IA 👋</h2>
                <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto px-4">
                  Estou aqui para te ajudar em sua jornada de autoconhecimento e bem-estar.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 md:gap-4 mb-6 md:mb-8 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 md:p-3 rounded-full flex-shrink-0 h-10 w-10 md:h-12 md:w-12 flex items-center justify-center">
                    <Bot className="h-5 w-5 md:h-6 md:w-6 text-white" />
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
                      <span className="font-semibold text-blue-600 text-sm md:text-base">Sofia IA</span>
                      <Heart className="h-3 w-3 md:h-4 md:w-4 text-pink-500" />
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none">
                    <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-sm">{message.content}</p>
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="bg-gray-300 p-2 md:p-3 rounded-full flex-shrink-0 h-10 w-10 md:h-12 md:w-12 flex items-center justify-center">
                    <User className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Opções de áreas após o usuário informar seu nome */}
            {showAreaOptions && currentChat && currentChat.messages.length === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4 max-w-4xl mx-auto">
                {areaOptions.map((area) => (
                  <Button
                    key={area.id}
                    variant="outline"
                    className="flex items-start h-auto text-left bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 rounded-xl transition-all duration-200 p-0 overflow-hidden"
                    onClick={() => handleAreaSelection(area.title)}
                    disabled={isLoading}
                  >
                    <div className="flex p-4 w-full">
                      <div className="flex-shrink-0 mr-3 mt-1">{area.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">{area.title}</div>
                        <div className="text-xs text-gray-600 break-words">{area.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex gap-2 md:gap-4 mb-6 md:mb-8 justify-start">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 md:p-3 rounded-full flex-shrink-0 h-10 w-10 md:h-12 md:w-12 flex items-center justify-center">
                  <Bot className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-2 md:mb-3">
                    <span className="font-semibold text-blue-600 text-sm md:text-base">Sofia IA</span>
                    <Heart className="h-3 w-3 md:h-4 md:w-4 text-pink-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs md:text-sm text-gray-600">Analisando sua mensagem...</span>
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
            <form onSubmit={handleFormSubmit} className="flex gap-2 md:gap-3 max-w-4xl mx-auto">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder={
                  isFreeLimitReached
                    ? "Limite de mensagens gratuitas atingido"
                    : currentChat?.messages.length === 1
                      ? "Digite seu nome..."
                      : "Digite sua mensagem para a Sofia IA..."
                }
                className="flex-1 rounded-full border-blue-200 focus:border-blue-500 py-6 px-4 md:px-6 text-base"
                disabled={isLoading || isFreeLimitReached || showAreaOptions}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim() || isFreeLimitReached || showAreaOptions}
                className={`bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full p-3 md:p-4 ${
                  isFreeLimitReached || showAreaOptions ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Send className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </form>

            {/* Contador de mensagens e aviso */}
            <div className="flex justify-center items-center mt-2 md:mt-3">
              {isFreeLimitReached ? (
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                  <Lock className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                  <span>
                    Limite de mensagens gratuitas atingido.{" "}
                    <button
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Assinar plano
                    </button>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                  <Lightbulb className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
                  <span>
                    {remainingFreeMessages} mensagens gratuitas restantes. Suas conversas são privadas e seguras.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {lastMessageError && (
        <div className="flex items-center justify-center p-4">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center gap-2"
          >
            {isRetrying ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Modal de Pagamento */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </>
  )
}
