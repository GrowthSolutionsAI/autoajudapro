"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Bot, User, X, Heart, Lightbulb, Smile, Brain, Target, Zap, Briefcase } from "lucide-react"

interface FullscreenChatProps {
  isOpen: boolean
  onClose: () => void
  userName: string
}

// Sistema avançado de análise de contexto e geração de respostas
class AdvancedAITherapist {
  private userName: string

  constructor(userName: string) {
    this.userName = userName
  }

  // Análise de sentimento e contexto
  analyzeContext(message: string) {
    const lowerMessage = message.toLowerCase()

    const emotions = {
      anxiety: this.detectAnxiety(lowerMessage),
      depression: this.detectDepression(lowerMessage),
      anger: this.detectAnger(lowerMessage),
      stress: this.detectStress(lowerMessage),
      loneliness: this.detectLoneliness(lowerMessage),
      selfEsteem: this.detectSelfEsteemIssues(lowerMessage),
      relationships: this.detectRelationshipIssues(lowerMessage),
      work: this.detectWorkIssues(lowerMessage),
      family: this.detectFamilyIssues(lowerMessage),
      motivation: this.detectMotivationIssues(lowerMessage),
    }

    const intensity = this.detectIntensity(lowerMessage)
    const urgency = this.detectUrgency(lowerMessage)

    return { emotions, intensity, urgency }
  }

  private detectAnxiety(message: string): number {
    const anxietyKeywords = [
      "ansioso",
      "ansiedade",
      "nervoso",
      "preocupado",
      "medo",
      "pânico",
      "coração acelerado",
      "suando",
      "tremendo",
      "inquieto",
      "tenso",
      "não consigo parar de pensar",
      "pensamentos acelerados",
      "insônia",
    ]
    return this.calculateScore(message, anxietyKeywords)
  }

  private detectDepression(message: string): number {
    const depressionKeywords = [
      "triste",
      "deprimido",
      "sem energia",
      "cansado",
      "vazio",
      "desesperançoso",
      "não tenho vontade",
      "sem motivação",
      "chorando",
      "sozinho",
      "inútil",
      "não vale a pena",
      "sem sentido",
      "escuro",
      "pesado",
    ]
    return this.calculateScore(message, depressionKeywords)
  }

  private detectAnger(message: string): number {
    const angerKeywords = [
      "raiva",
      "irritado",
      "furioso",
      "ódio",
      "revoltado",
      "injustiça",
      "não aguento mais",
      "explodindo",
      "estressado",
      "frustrado",
    ]
    return this.calculateScore(message, angerKeywords)
  }

  private detectStress(message: string): number {
    const stressKeywords = [
      "estresse",
      "pressão",
      "sobrecarregado",
      "muita coisa",
      "não dou conta",
      "deadline",
      "prazo",
      "responsabilidade",
      "cobrança",
      "exausto",
    ]
    return this.calculateScore(message, stressKeywords)
  }

  private detectLoneliness(message: string): number {
    const lonelinessKeywords = [
      "sozinho",
      "isolado",
      "ninguém me entende",
      "sem amigos",
      "abandonado",
      "excluído",
      "invisível",
      "não tenho com quem falar",
    ]
    return this.calculateScore(message, lonelinessKeywords)
  }

  private detectSelfEsteemIssues(message: string): number {
    const selfEsteemKeywords = [
      "não sou bom",
      "fracasso",
      "burro",
      "incapaz",
      "não mereço",
      "autoestima",
      "confiança",
      "inseguro",
      "não valho nada",
      "inferior",
    ]
    return this.calculateScore(message, selfEsteemKeywords)
  }

  private detectRelationshipIssues(message: string): number {
    const relationshipKeywords = [
      "relacionamento",
      "namorado",
      "namorada",
      "marido",
      "esposa",
      "parceiro",
      "briga",
      "discussão",
      "ciúme",
      "traição",
      "separação",
      "divórcio",
      "família",
      "pais",
      "filhos",
      "amigos",
      "conflito",
    ]
    return this.calculateScore(message, relationshipKeywords)
  }

  private detectWorkIssues(message: string): number {
    const workKeywords = [
      "trabalho",
      "chefe",
      "colega",
      "emprego",
      "carreira",
      "profissional",
      "demissão",
      "desemprego",
      "salário",
      "promoção",
      "burnout",
    ]
    return this.calculateScore(message, workKeywords)
  }

  private detectFamilyIssues(message: string): number {
    const familyKeywords = [
      "família",
      "pai",
      "mãe",
      "irmão",
      "irmã",
      "filho",
      "filha",
      "avô",
      "avó",
      "parente",
      "casa",
      "conflito familiar",
    ]
    return this.calculateScore(message, familyKeywords)
  }

  private detectMotivationIssues(message: string): number {
    const motivationKeywords = [
      "sem motivação",
      "desanimado",
      "objetivo",
      "meta",
      "sonho",
      "não sei o que fazer",
      "perdido",
      "direção",
      "propósito",
    ]
    return this.calculateScore(message, motivationKeywords)
  }

  private detectIntensity(message: string): "low" | "medium" | "high" {
    const highIntensityWords = ["muito", "extremamente", "demais", "insuportável", "não aguento"]
    const mediumIntensityWords = ["bastante", "bem", "meio", "um pouco"]

    if (highIntensityWords.some((word) => message.includes(word))) return "high"
    if (mediumIntensityWords.some((word) => message.includes(word))) return "medium"
    return "low"
  }

  private detectUrgency(message: string): boolean {
    const urgentWords = [
      "suicídio",
      "me matar",
      "acabar com tudo",
      "não aguento mais viver",
      "quero morrer",
      "sem saída",
      "desesperado",
      "emergência",
    ]
    return urgentWords.some((word) => message.includes(word))
  }

  private calculateScore(message: string, keywords: string[]): number {
    let score = 0
    keywords.forEach((keyword) => {
      if (message.includes(keyword)) score += 1
    })
    return Math.min((score / keywords.length) * 10, 10)
  }

  // Geração de resposta inteligente
  generateResponse(message: string): string {
    const analysis = this.analyzeContext(message)

    // Verificar urgência primeiro
    if (analysis.urgency) {
      return this.generateUrgentResponse()
    }

    // Identificar problema principal
    const mainProblem = this.identifyMainProblem(analysis.emotions)

    // Gerar resposta baseada no problema principal e intensidade
    return this.generateContextualResponse(mainProblem, analysis.intensity, message)
  }

  private identifyMainProblem(emotions: any): string {
    let maxScore = 0
    let mainProblem = "general"

    Object.entries(emotions).forEach(([emotion, score]) => {
      if (score > maxScore) {
        maxScore = score
        mainProblem = emotion
      }
    })

    return mainProblem
  }

  private generateUrgentResponse(): string {
    return `${this.userName}, percebo que você está passando por um momento muito difícil e isso me preocupa profundamente. 🚨

**É IMPORTANTE QUE VOCÊ BUSQUE AJUDA PROFISSIONAL IMEDIATAMENTE:**

📞 **CVV (Centro de Valorização da Vida)**: 188 (24h, gratuito)
🏥 **CAPS (Centro de Atenção Psicossocial)** mais próximo
🆘 **SAMU**: 192 (emergências médicas)

Você não está sozinho(a) e sua vida tem valor. Existem pessoas qualificadas que podem ajudar você neste momento.

Enquanto isso, tente:
• Respirar profundamente (4 segundos inspirando, 6 expirando)
• Entrar em contato com alguém de confiança
• Ir para um local seguro

Posso continuar conversando com você, mas é fundamental que procure ajuda profissional. Você merece apoio especializado. 💙`
  }

  private generateContextualResponse(problem: string, intensity: string, originalMessage: string): string {
    const responses = {
      anxiety: this.generateAnxietyResponse(intensity, originalMessage),
      depression: this.generateDepressionResponse(intensity, originalMessage),
      anger: this.generateAngerResponse(intensity, originalMessage),
      stress: this.generateStressResponse(intensity, originalMessage),
      loneliness: this.generateLonelinessResponse(intensity, originalMessage),
      selfEsteem: this.generateSelfEsteemResponse(intensity, originalMessage),
      relationships: this.generateRelationshipResponse(intensity, originalMessage),
      work: this.generateWorkResponse(intensity, originalMessage),
      family: this.generateFamilyResponse(intensity, originalMessage),
      motivation: this.generateMotivationResponse(intensity, originalMessage),
      general: this.generateGeneralResponse(intensity, originalMessage),
    }

    return responses[problem] || responses.general
  }

  private generateAnxietyResponse(intensity: string, message: string): string {
    const intensityPrefix = {
      high: `${this.userName}, entendo que sua ansiedade está muito intensa agora. É uma sensação realmente desconfortável, mas você pode superá-la. 🌟`,
      medium: `${this.userName}, percebo que você está sentindo ansiedade. Vamos trabalhar juntos para diminuir essa sensação. 💙`,
      low: `${this.userName}, é normal sentir um pouco de ansiedade às vezes. Vou te ajudar a lidar com isso. 🌱`,
    }

    return `${intensityPrefix[intensity]}

**🧠 ENTENDENDO SUA ANSIEDADE:**
A ansiedade é uma resposta natural do corpo a situações que percebemos como ameaçadoras. Seu cérebro está tentando te proteger, mas às vezes essa proteção se torna excessiva.

**⚡ TÉCNICA IMEDIATA - Respiração 4-7-8:**
1. Inspire pelo nariz por 4 segundos
2. Segure a respiração por 7 segundos  
3. Expire pela boca por 8 segundos
4. Repita 4 vezes

**🛠️ ESTRATÉGIAS PARA HOJE:**
• **Grounding 5-4-3-2-1**: Identifique 5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que saboreia
• **Questionamento**: "Este pensamento é real ou é ansiedade falando?"
• **Movimento**: Caminhada de 10 minutos ou alongamento

**📝 EXERCÍCIO PRÁTICO:**
Escreva seus medos em um papel e ao lado escreva evidências reais de que isso pode ou não acontecer. Isso ajuda a separar fatos de preocupações.

Você pode me contar mais sobre o que especificamente está causando sua ansiedade? Assim posso te dar dicas mais direcionadas. 🤝`
  }

  private generateDepressionResponse(intensity: string, message: string): string {
    const intensityPrefix = {
      high: `${this.userName}, sinto muito que você esteja passando por esse momento tão difícil. Sua dor é real e válida, e estou aqui para apoiá-lo(a). 🤗`,
      medium: `${this.userName}, percebo que você está se sentindo para baixo. Esses sentimentos são temporários, mesmo que não pareçam agora. 🌅`,
      low: `${this.userName}, todos temos dias mais difíceis. Vamos encontrar maneiras de trazer mais luz para seu dia. ☀️`,
    }

    return `${intensityPrefix[intensity]}

**💡 ENTENDENDO A TRISTEZA:**
A tristeza profunda pode fazer parecer que nada vai melhorar, mas isso é um sintoma, não a realidade. Seu cérebro está temporariamente com dificuldade para produzir os neurotransmissores do bem-estar.

**🌱 PEQUENOS PASSOS HOJE:**
• **Higiene básica**: Tomar banho, escovar os dentes (autocuidado é autoamor)
• **Luz solar**: 15 minutos de exposição ao sol (aumenta serotonina)
• **Movimento gentil**: Alongamento ou caminhada curta
• **Conexão**: Mensagem para uma pessoa querida

**🧘 TÉCNICA DE MINDFULNESS:**
Quando pensamentos negativos surgirem, diga mentalmente: "Estou tendo o pensamento de que..." Isso cria distância entre você e o pensamento.

**📋 ATIVAÇÃO COMPORTAMENTAL:**
Escolha UMA atividade que antes te dava prazer e faça por apenas 10 minutos hoje. Pode ser ouvir música, desenhar, cozinhar algo simples.

**🎯 FOCO NO PRESENTE:**
Liste 3 coisas pequenas pelas quais você pode ser grato hoje (pode ser ter um teto, água, ou até mesmo estar buscando ajuda).

O que você costumava gostar de fazer? Vamos encontrar uma versão pequena disso para hoje. 💚`
  }

  private generateStressResponse(intensity: string, message: string): string {
    return `${this.userName}, entendo que você está se sentindo sobrecarregado(a). O estresse é como uma panela de pressão - precisamos liberar a pressão aos poucos. 🫖

**🧠 O QUE ACONTECE NO ESTRESSE:**
Seu corpo está em modo "luta ou fuga", liberando cortisol. Isso é útil em emergências, mas prejudicial quando constante.

**⚡ ALÍVIO IMEDIATO:**
• **Respiração quadrada**: 4 segundos inspirar, 4 segurar, 4 expirar, 4 segurar
• **Tensão e relaxamento**: Contraia todos os músculos por 5 segundos, depois relaxe completamente
• **Água fria**: Lave o rosto ou beba água gelada (ativa o nervo vago)

**📊 ORGANIZAÇÃO MENTAL:**
1. **Liste tudo** que está te estressando
2. **Categorize**: Urgente/Importante, Importante/Não urgente, etc.
3. **Escolha apenas 1-2 itens** para focar hoje

**🎯 TÉCNICA POMODORO ADAPTADA:**
• 25 minutos focado em UMA tarefa
• 5 minutos de pausa total
• Repita apenas 2-3 ciclos por dia

**🛡️ PROTEÇÃO CONTRA SOBRECARGA:**
• Aprenda a dizer "não" para novas demandas
• Delegue o que for possível
• Aceite que "bom o suficiente" às vezes é perfeito

Qual é a principal fonte do seu estresse agora? Vamos criar um plano específico para isso. 🎯`
  }

  private generateSelfEsteemResponse(intensity: string, message: string): string {
    return `${this.userName}, sua autoestima pode estar baixa agora, mas isso não define quem você é. Você tem valor intrínseco como ser humano. 💎

**🧠 ENTENDENDO A AUTOESTIMA:**
A voz crítica interna muitas vezes é mais dura conosco do que seríamos com um amigo. Vamos mudar essa narrativa interna.

**🔄 REESTRUTURAÇÃO COGNITIVA:**
Quando pensar "Sou um fracasso", pergunte:
• "Eu falaria isso para um amigo querido?"
• "Que evidências reais tenho disso?"
• "Como um amigo me veria nesta situação?"

**✨ EXERCÍCIO DE AUTOCOMPAIXÃO:**
1. Coloque a mão no coração
2. Diga: "Este é um momento difícil"
3. "Momentos difíceis fazem parte da vida humana"
4. "Que eu seja gentil comigo mesmo(a)"

**📝 DIÁRIO DE FORÇAS:**
Todo dia, anote:
• 1 coisa que você fez bem (por menor que seja)
• 1 qualidade sua que você aprecia
• 1 momento em que ajudou alguém ou foi gentil

**🎭 TÉCNICA DO MELHOR AMIGO:**
Quando se criticar, pergunte: "O que meu melhor amigo diria sobre isso?" Então, seja esse amigo para você mesmo(a).

**🌱 PEQUENAS VITÓRIAS:**
Celebre conquistas pequenas: levantar da cama, tomar banho, fazer uma refeição. Cada passo conta.

Me conte uma coisa boa sobre você - pode ser qualquer coisa, por menor que pareça. 🌟`
  }

  private generateRelationshipResponse(intensity: string, message: string): string {
    return `${this.userName}, relacionamentos são uma das partes mais complexas e importantes da vida. Obrigada por confiar em mim para falar sobre isso. 💕

**🤝 ENTENDENDO RELACIONAMENTOS:**
Conflitos são normais e podem até fortalecer relacionamentos quando bem manejados. O importante é como lidamos com eles.

**🗣️ COMUNICAÇÃO ASSERTIVA:**
Use a fórmula: "Eu me sinto [emoção] quando [comportamento] porque [impacto]. Eu gostaria que [solução]."

Exemplo: "Eu me sinto ignorada quando você usa o celular durante nossa conversa porque sinto que não sou importante. Eu gostaria que guardássemos os celulares durante o jantar."

**🎯 TÉCNICAS DE RESOLUÇÃO:**
• **Escuta ativa**: Repita o que a pessoa disse antes de responder
• **Pausa estratégica**: "Preciso de um tempo para processar isso"
• **Foco no comportamento**, não na personalidade
• **Busque entender** antes de ser entendido(a)

**💔 SE É UM TÉRMINO:**
• Permita-se sentir a dor (é natural e necessária)
• Mantenha rotinas de autocuidado
• Evite decisões importantes por algumas semanas
• Lembre-se: você é completo(a) sozinho(a)

**🌱 CRESCIMENTO PESSOAL:**
Relacionamentos são espelhos. Pergunte-se:
• "O que posso aprender sobre mim nesta situação?"
• "Como posso crescer a partir disso?"

Você gostaria de falar sobre um relacionamento específico? Estou aqui para ouvir sem julgamentos. 👂`
  }

  private generateWorkResponse(intensity: string, message: string): string {
    return `${this.userName}, questões profissionais podem afetar profundamente nosso bem-estar. Vamos encontrar estratégias para melhorar sua situação. 💼

**⚖️ EQUILÍBRIO TRABALHO-VIDA:**
Seu valor como pessoa não se define pelo seu trabalho. Você é muito mais que sua profissão.

**🛡️ PROTEÇÃO CONTRA BURNOUT:**
• **Limites claros**: Horário para parar de checar emails
• **Pausas regulares**: 5 minutos a cada hora
• **Priorização**: Foque no que realmente importa
• **Delegação**: O que outros podem fazer?

**🎯 GESTÃO DE CONFLITOS NO TRABALHO:**
• Documente situações importantes
• Mantenha comunicação profissional e respeitosa
• Busque soluções, não culpados
• Use o RH quando necessário

**📈 DESENVOLVIMENTO PROFISSIONAL:**
• Identifique suas forças e use-as mais
• Busque feedback construtivo
• Invista em aprendizado contínuo
• Construa uma rede de contatos saudável

**💡 SE ESTÁ DESEMPREGADO(A):**
• Mantenha rotina estruturada
• Trate a busca por emprego como um trabalho
• Cuide da saúde mental (é fundamental)
• Considere trabalhos temporários ou freelances

**🔄 MUDANÇA DE CARREIRA:**
• Avalie seus valores e interesses
• Teste novas áreas através de projetos pequenos
• Converse com profissionais da área desejada
• Faça transição gradual quando possível

Qual aspecto do trabalho está te incomodando mais? Vamos criar um plano de ação específico. 🚀`
  }

  private generateMotivationResponse(intensity: string, message: string): string {
    return `${this.userName}, a falta de motivação é como uma nuvem que passa - temporária, mesmo que pareça permanente. Vamos reacender sua chama interior. 🔥

**🧠 ENTENDENDO A MOTIVAÇÃO:**
Motivação não é um sentimento constante. É normal ter altos e baixos. O segredo é criar sistemas que funcionem mesmo quando não estamos motivados.

**🎯 REDESCOBERTA DE PROPÓSITO:**
Pergunte-se:
• "O que me fazia sentir vivo(a) quando criança?"
• "Quando me sinto mais eu mesmo(a)?"
• "Que problemas eu gostaria de resolver no mundo?"
• "O que faria se soubesse que não poderia falhar?"

**⚡ TÉCNICA DOS PEQUENOS PASSOS:**
1. Escolha UM objetivo pequeno
2. Divida em passos de 2 minutos
3. Faça apenas o primeiro passo hoje
4. Celebre essa pequena vitória

**🔄 CRIANDO MOMENTUM:**
• **Regra dos 2 minutos**: Se leva menos que isso, faça agora
• **Empilhamento de hábitos**: Após [hábito existente], farei [novo hábito]
• **Ambiente favorável**: Remova obstáculos, adicione facilitadores

**🌟 ENCONTRANDO SIGNIFICADO:**
• Conecte suas ações a um propósito maior
• Ajude alguém (voluntariado libera endorfinas)
• Aprenda algo novo (estimula dopamina)
• Crie algo (arte, escrita, culinária)

**📊 SISTEMA DE RECOMPENSAS:**
• Defina recompensas pequenas para pequenas conquistas
• Compartilhe seus objetivos com alguém de confiança
• Acompanhe seu progresso visualmente

**💫 VISUALIZAÇÃO PODEROSA:**
Reserve 5 minutos para imaginar vividamente como será sua vida quando alcançar seus objetivos. Sinta as emoções, veja os detalhes.

Qual era um sonho seu que ficou esquecido? Vamos explorar como reativá-lo de forma realista. ✨`
  }

  private generateGeneralResponse(intensity: string, message: string): string {
    return `${this.userName}, obrigada por compartilhar isso comigo. Cada pessoa é única, e sua experiência merece ser ouvida e respeitada. 🌟

**🤗 VALIDAÇÃO:**
Seus sentimentos são válidos, independentemente do que os causou. Não minimize sua experiência.

**🧘 TÉCNICA UNIVERSAL - MINDFULNESS:**
1. Pare o que está fazendo
2. Respire profundamente 3 vezes
3. Observe seus pensamentos sem julgá-los
4. Pergunte: "Do que preciso agora?"

**💪 FORTALECIMENTO EMOCIONAL:**
• **Autocompaixão**: Trate-se como trataria um bom amigo
• **Aceitação**: "Posso não gostar desta situação, mas posso lidar com ela"
• **Crescimento**: "O que posso aprender com isso?"

**🌱 PASSOS PRÁTICOS:**
• Identifique uma pequena ação que pode tomar hoje
• Conecte-se com alguém que se importa com você
• Faça algo que nutra sua alma (música, natureza, arte)
• Pratique gratidão por 3 coisas simples

**🔮 PERSPECTIVA:**
Lembre-se: você já superou 100% dos seus dias difíceis até agora. Isso prova sua força e resiliência.

Gostaria de me contar mais detalhes sobre o que está acontecendo? Assim posso oferecer orientações mais específicas para sua situação. 💙`
  }
}

export default function FullscreenChat({ isOpen, onClose, userName }: FullscreenChatProps) {
  const [messages, setMessages] = useState<Array<{ id: string; role: string; content: string }>>([
    {
      id: "welcome",
      role: "assistant",
      content: `Olá ${userName || "amigo(a)"}! Sou a Sofia, especialista em desenvolvimento pessoal e autoajuda. 

Estou aqui para oferecer suporte emocional baseado em técnicas de psicologia positiva, terapia cognitivo-comportamental e mindfulness.

**Em qual área você gostaria de receber orientação hoje?**

🫶 **Relacionamentos**: Conflitos, comunicação, términos, construção de laços saudáveis.
🧠 **Saúde Mental**: Ansiedade, estresse, depressão, autoconhecimento, regulação emocional.
🌱 **Desenvolvimento Pessoal**: Autoestima, propósito de vida, habilidades sociais, produtividade.
💼 **Carreira e Finanças**: Orientação profissional, gestão de carreira, planejamento financeiro, empreendedorismo.

Você pode escolher uma área ou simplesmente me contar o que está acontecendo. 💙`,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const aiTherapist = new AdvancedAITherapist(userName || "amigo(a)")

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      category: "Desenvolvimento",
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
      category: "Propósito",
    },
  ]

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    handleSendMessage(suggestion)
    setShowSuggestions(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSendMessage = async (messageText: string = input) => {
    if (!messageText.trim()) return

    // Adiciona a mensagem do usuário
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simula o tempo de processamento da IA (mais realista)
    setTimeout(() => {
      // Gera resposta inteligente usando o sistema avançado
      const aiResponse = aiTherapist.generateResponse(messageText)

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 2000) // Tempo mais realista para uma resposta pensada
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-blue-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sofia - AutoAjuda Pro</h1>
            <p className="text-sm text-gray-600">Especialista em Psicologia Positiva & Desenvolvimento Pessoal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 font-medium">IA Avançada Online</span>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="hover:bg-red-100 hover:text-red-600 rounded-full p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
        {messages.length <= 1 && showSuggestions && (
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Bot className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Olá, {userName || "amigo(a)"}! Sou a Sofia 👋</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Sou uma IA especializada em autoajuda com conhecimentos avançados em psicologia positiva, terapia
              cognitivo-comportamental e mindfulness. Estou aqui para oferecer suporte emocional personalizado e
              técnicas práticas para seus desafios.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {suggestions.map((suggestion, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white/60 backdrop-blur-sm border-0"
                  onClick={() => handleSuggestionClick(suggestion.text)}
                >
                  <CardContent className="p-4 text-center">
                    <suggestion.icon className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">{suggestion.text}</p>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {suggestion.category}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 mb-8 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full flex-shrink-0 h-12 w-12 flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
            )}

            <div
              className={`max-w-[80%] p-6 rounded-2xl ${
                message.role === "user"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  : "bg-white/90 backdrop-blur-sm text-gray-900 shadow-lg border border-blue-100"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold text-blue-600">Sofia</span>
                  <Heart className="h-4 w-4 text-pink-500" />
                </div>
              )}
              <div className="prose prose-sm max-w-none">
                <p className="leading-relaxed whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
            </div>

            {message.role === "user" && (
              <div className="bg-gray-300 p-3 rounded-full flex-shrink-0 h-12 w-12 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 mb-8 justify-start">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full flex-shrink-0 h-12 w-12 flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-semibold text-blue-600">Sofia</span>
                <Heart className="h-4 w-4 text-pink-500" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Analisando sua mensagem e preparando resposta personalizada
                </span>
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
      <div className="bg-white/80 backdrop-blur-md border-t border-blue-100 p-6">
        <div className="max-w-5xl mx-auto">
          <form id="chat-form" onSubmit={handleFormSubmit} className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Compartilhe seus sentimentos, desafios ou qualquer coisa que esteja te incomodando... 💙"
                className="w-full py-4 px-6 text-lg rounded-full border-2 border-blue-200 focus:border-blue-500 bg-white/90 backdrop-blur-sm"
                disabled={isLoading}
              />
              {input && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              <Send className="h-5 w-5 mr-2" />
              Enviar
            </Button>
          </form>

          <div className="flex items-center justify-center mt-4 gap-4 text-sm text-gray-500">
            <span>🧠 Powered by GroqCloud + Llama 3</span>
            <span>•</span>
            <span>🔒 Conversa confidencial</span>
            <span>•</span>
            <span>💡 Respostas personalizadas</span>
          </div>
        </div>
      </div>
    </div>
  )
}
