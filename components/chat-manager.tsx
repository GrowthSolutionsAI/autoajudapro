"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Heart, Brain, Target, Briefcase, Smile, Zap } from "lucide-react"
import PaymentModal from "./payment-modal"
import AdvancedChatInterface from "./advanced-chat-interface"

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
  userData?: any
}

interface UserSubscription {
  id: string
  planType: string
  status: string
  expiresAt: string
  isActive: boolean
}

const FREE_MESSAGE_LIMIT = 3 // Reduzido para incentivar assinatura

// Adicione esta função no início do arquivo, fora do componente
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function ChatManager({ isOpen, onClose, userName, userData }: ChatManagerProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // Verificar se tem assinatura ativa
  const hasActiveSubscription =
    userData?.subscription?.status === "active" && new Date(userData.subscription.endDate) > new Date()

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false)
    // Recarregar dados do usuário
    window.location.reload()
  }

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showAreaButtons, setShowAreaButtons] = useState(false)
  const [showAreaOptions, setShowAreaOptions] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null)
  const [lastMessageError, setLastMessageError] = useState<string | null>(null)

  // Novos estados para controle de assinatura
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true)

  const currentChat = chatSessions.find((chat) => chat.id === currentChatId)
  const userMessageCount = currentChat?.messageCount || 0

  // Verificar se usuário tem acesso baseado na assinatura
  const isFreeLimitReached = userMessageCount >= FREE_MESSAGE_LIMIT && !hasActiveSubscription
  const remainingFreeMessages = hasActiveSubscription ? "∞" : Math.max(0, FREE_MESSAGE_LIMIT - userMessageCount)

  // Verificar assinatura do usuário
  useEffect(() => {
    const checkUserSubscription = async () => {
      try {
        setIsCheckingSubscription(true)

        // Usar email real do usuário logado
        const userEmail = `${userName.toLowerCase().replace(/\s+/g, "")}@autoajuda.com`

        const response = await fetch(`/api/user/subscription?email=${encodeURIComponent(userEmail)}`)

        if (!response.ok) {
          console.log("⚠️ Erro ao verificar assinatura, assumindo usuário gratuito")
          setUserSubscription(null)
          return
        }

        const data = await response.json()

        if (data.success && data.hasActiveSubscription) {
          setUserSubscription({
            id: data.subscription?.id || "mock",
            planType: data.plan || "free",
            status: data.status || "ACTIVE",
            expiresAt: data.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: data.hasActiveSubscription,
          })
          console.log("✅ Assinatura ativa encontrada")
        } else {
          setUserSubscription(null)
          console.log("ℹ️ Usuário sem assinatura ativa")
        }
      } catch (error) {
        console.error("❌ Erro ao verificar assinatura:", error)
        setUserSubscription(null)
      } finally {
        setIsCheckingSubscription(false)
      }
    }

    if (isOpen) {
      checkUserSubscription()
      // Verificar apenas a cada 10 minutos (reduzido de 5 minutos)
      const interval = setInterval(checkUserSubscription, 10 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [isOpen, userName]) // Adicionar userName como dependência

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
      isPaid: hasActiveSubscription,
    }

    setChatSessions((prev) => [...prev, newChat])
    setCurrentChatId(newChatId)
    setShowSuggestions(false)
    setShowAreaButtons(false)
    setShowAreaOptions(false)
    setIsSidebarOpen(false)
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
    setTimeout(() => {
      handleSendMessage(suggestion)
    }, 100)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId)
    setIsSidebarOpen(false)
  }

  const handleAreaSelection = (area: string) => {
    const message = `Gostaria de ajuda com ${area}`
    setShowAreaOptions(false)
    handleSendMessage(message)
  }

  // Função para tentar novamente após um erro
  const handleRetry = async () => {
    if (!currentChat || messages.length === 0) return

    const lastUserMessageIndex = [...messages].reverse().findIndex((msg) => msg.role === "user")
    if (lastUserMessageIndex === -1) return

    const lastUserMessage = [...messages].reverse()[lastUserMessageIndex]

    const lastAssistantMessage = messages[messages.length - 1]
    if (lastAssistantMessage.role === "assistant") {
      setMessages((prev) => prev.slice(0, -1))
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

    setIsRetrying(true)
    await handleSendMessage(lastUserMessage.content)
    setIsRetrying(false)
  }

  // Função principal para enviar mensagens
  const handleSendMessage = async (messageText: string = input) => {
    if (!messageText.trim() || !currentChat || (isLoading && !isRetrying)) return

    // Verificar limite de mensagens para usuários sem assinatura
    if (isFreeLimitReached) {
      setIsPaymentModalOpen(true)
      return
    }

    const newMessageCount = currentChat.messageCount + 1

    if (!isRetrying) {
      console.log("📤 Enviando mensagem:", messageText.substring(0, 50) + "...")

      setIsLoading(true)
      setInput("")
      setLastMessageError(null)

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: messageText,
      }

      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)

      if (currentChat.messages.length === 1) {
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
      const messagesForAPI = isRetrying
        ? messages.filter((msg) => msg.role !== "system")
        : [...messages, { role: "user", content: messageText }].filter((msg) => msg.role !== "system")

      console.log("🌐 Fazendo requisição para /api/chat...")

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
              sessionId: currentChatId,
              userEmail: `${userName.toLowerCase().replace(/\s+/g, "")}@autoajuda.com`,
            }),
          })

          if (response.ok || (response.status !== 429 && response.status !== 503 && response.status !== 504)) {
            break
          }

          retries++
          if (retries <= maxRetries) {
            const waitTime = Math.pow(2, retries) * 1000
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

      if (response && !response.ok && response.status === 429) {
        console.log("⚠️ Rate limit atingido, usando fallback...")
        const fallbackData = await getFallbackResponse(messagesForAPI)

        if (fallbackData && fallbackData.message) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: fallbackData.message,
          }

          setMessages((prev) => [...prev, assistantMessage])
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
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ Erro ao fazer parse do JSON:", parseError)
        throw new Error("Resposta inválida da API")
      }

      if (!data.message) {
        console.error("❌ Resposta sem mensagem:", data)
        throw new Error("Resposta vazia da API")
      }

      let assistantContent = data.message

      // Adicionar aviso sobre limite apenas para usuários sem assinatura
      if (!hasActiveSubscription) {
        const remainingAfterThis = FREE_MESSAGE_LIMIT - newMessageCount

        if (remainingAfterThis <= 1 && remainingAfterThis > 0) {
          assistantContent += `\n\n---\n💡 **Aviso:** Você tem ${remainingAfterThis} mensagem gratuita restante. Para conversas ilimitadas, escolha um de nossos planos! 🌟`
        } else if (remainingAfterThis === 0) {
          assistantContent += `\n\n---\n🔒 **Limite atingido!** Esta foi sua última mensagem gratuita. Para continuar nossa conversa, escolha um plano que se adeque às suas necessidades! 💙`
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
      }

      setMessages((prev) => [...prev, assistantMessage])
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

      // Abrir modal de pagamento se necessário
      if (!hasActiveSubscription && newMessageCount >= FREE_MESSAGE_LIMIT) {
        setTimeout(() => {
          setIsPaymentModalOpen(true)
        }, 2000)
      }

      setRetryCount(0)
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error)
      setLastMessageError(error instanceof Error ? error.message : "Erro desconhecido")

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: `Desculpe, estou com dificuldades técnicas no momento. 😔

**Enquanto isso, aqui estão algumas dicas:**

🧘 **Respiração Calmante:**
- Inspire por 4 segundos
- Segure por 4 segundos  
- Expire por 6 segundos

💭 **Lembre-se:**
- Você é mais forte do que imagina
- Este momento difícil vai passar
- Estou aqui para te apoiar

Tente enviar sua mensagem novamente em alguns instantes. 💙`,
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
      <AdvancedChatInterface
        isOpen={isOpen}
        onClose={onClose}
        userName={userName}
        userId={userData?.id || "demo-user"}
        hasActiveSubscription={hasActiveSubscription}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        userName={userName}
      />
    </>
  )
}
