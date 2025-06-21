import fs from "fs"
import path from "path"
import https from "https"

export interface PixPaymentData {
  amount: number
  customerName: string
  customerEmail: string
  customerDocument: string
  reference: string
  planId: string
  description: string
  expirationDate: string
}

export interface PixPaymentResult {
  txid: string
  pixCopiaECola: string
  qrCode: string
  paymentUrl: string
  status: string
  expiresAt: string
}

export class BancoInterAPI {
  private clientId: string
  private clientSecret: string
  private contaCorrente: string
  private environment: "sandbox" | "production"
  private baseUrl: string
  private accessToken: string | null = null
  private tokenExpiresAt = 0

  constructor() {
    // Credenciais oficiais da integração "Auto Ajuda Pro - Site MVP"
    this.clientId = process.env.BANCO_INTER_CLIENT_ID || "fd1641ee-6011-4132-b2ea-b87ed8edc4c7"
    this.clientSecret = process.env.BANCO_INTER_CLIENT_SECRET || "c838f820-224d-486a-a519-290a60f8db48"
    this.contaCorrente = process.env.BANCO_INTER_CONTA_CORRENTE || "413825752"
    this.environment = (process.env.BANCO_INTER_ENVIRONMENT as "sandbox" | "production") || "production"

    // URLs oficiais conforme documentação
    this.baseUrl =
      this.environment === "sandbox"
        ? "https://cdpj-sandbox.partners.uatinter.co"
        : "https://cdpj.partners.bancointer.com.br"

    if (!this.clientId || !this.clientSecret || !this.contaCorrente) {
      throw new Error("❌ Credenciais do Banco Inter não configuradas corretamente")
    }

    console.log("🏦 Banco Inter API - Auto Ajuda Pro inicializada:", {
      environment: this.environment,
      clientId: this.clientId.substring(0, 8) + "...",
      conta: this.contaCorrente,
      baseUrl: this.baseUrl,
      integration: "Auto Ajuda Pro - Site MVP",
      status: "ATIVO",
      expires: "20/06/2026",
    })
  }

  private getHttpsAgent() {
    try {
      const certPath = path.join(process.cwd(), "certificates", "Inter_API_Certificado.crt")
      const keyPath = path.join(process.cwd(), "certificates", "Inter_API_Chave.key")

      if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
        console.log("⚠️ Certificados SSL não encontrados, usando HTTPS padrão")
        return new https.Agent({
          rejectUnauthorized: true,
          timeout: 30000,
        })
      }

      const cert = fs.readFileSync(certPath)
      const key = fs.readFileSync(keyPath)

      console.log("🔐 Certificados SSL carregados")

      return new https.Agent({
        cert,
        key,
        rejectUnauthorized: true,
        timeout: 30000,
      })
    } catch (error) {
      console.error("❌ Erro ao carregar certificados SSL:", error)
      return new https.Agent({
        rejectUnauthorized: true,
        timeout: 30000,
      })
    }
  }

  private async getAccessToken(): Promise<string> {
    // Verificar se o token ainda é válido (com margem de 5 minutos)
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 300000) {
      return this.accessToken
    }

    console.log("🔑 Obtendo token OAuth2 - Banco Inter...")

    try {
      // Escopos conforme documentação oficial - separados por espaço
      const scopes = [
        "cob.write", // Emissão/alteração de pix cobrança imediata
        "cob.read", // Consulta de pix cobrança imediata
        "cobv.write", // Emissão/alteração de pix cobrança com vencimento
        "cobv.read", // Consulta de cobrança com vencimento
        "pix.write", // Solicitação de devolução de pix
        "pix.read", // Consulta de pix
        "webhook.write", // Alteração do webhook
        "webhook.read", // Consulta do webhook
        "payloadlocation.write", // Criação de location do payload
        "payloadlocation.read", // Consulta de locations de payloads
        "extrato.read", // Consulta de Extrato e Saldo
      ].join(" ") // IMPORTANTE: Separar por ESPAÇO, não por +

      // Corpo da requisição conforme documentação oficial
      const requestBody = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "client_credentials",
        scope: scopes,
      }).toString()

      console.log("📤 Enviando requisição OAuth2:", {
        url: `${this.baseUrl}/oauth/v2/token`,
        client_id: this.clientId.substring(0, 8) + "...",
        grant_type: "client_credentials",
        scopes: scopes.split(" ").length + " escopos",
      })

      const response = await fetch(`${this.baseUrl}/oauth/v2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "AutoAjudaPro/1.0",
          Accept: "application/json",
        },
        body: requestBody,
        // @ts-ignore
        agent: this.getHttpsAgent(),
      })

      console.log("📥 Resposta OAuth2:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Erro OAuth2 Banco Inter:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          clientId: this.clientId.substring(0, 8) + "...",
          url: `${this.baseUrl}/oauth/v2/token`,
        })
        throw new Error(
          `Falha na autenticação OAuth2: ${response.status} - ${response.statusText}\nDetalhes: ${errorText}`,
        )
      }

      const data = await response.json()

      this.accessToken = data.access_token
      // Token válido por 1 hora conforme documentação
      this.tokenExpiresAt = Date.now() + data.expires_in * 1000

      console.log("✅ Token OAuth2 obtido com sucesso:", {
        token_type: data.token_type,
        expires_in: `${data.expires_in} segundos (1 hora)`,
        expiresAt: new Date(this.tokenExpiresAt).toLocaleString("pt-BR"),
        scope: data.scope,
        tokenPreview: data.access_token.substring(0, 20) + "...",
      })

      return this.accessToken
    } catch (error) {
      console.error("❌ Erro crítico na autenticação OAuth2:", error)
      throw new Error(
        `Falha na autenticação com Banco Inter: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      )
    }
  }

  async createPixPayment(paymentData: PixPaymentData): Promise<PixPaymentResult> {
    console.log("💰 Criando cobrança PIX - Banco Inter:", {
      valor: `R$ ${paymentData.amount.toFixed(2)}`,
      cliente: paymentData.customerName,
      email: paymentData.customerEmail,
      referencia: paymentData.reference,
      plano: paymentData.planId,
    })

    try {
      const token = await this.getAccessToken()

      // Gerar TXID único conforme padrão Banco Inter (máximo 35 caracteres)
      const timestamp = Date.now().toString()
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
      const txid = `AUTOAJUDA${timestamp}${randomSuffix}`.substring(0, 35)

      // Calcular data de vencimento (24 horas)
      const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const vencimento = expirationDate.toISOString().split("T")[0]

      // Payload conforme documentação oficial da API PIX
      const pixPayload = {
        calendario: {
          dataDeVencimento: vencimento,
          validadeAposVencimento: 1,
        },
        devedor: {
          nome: paymentData.customerName.substring(0, 200),
          cpf: paymentData.customerDocument.replace(/\D/g, "").padStart(11, "0"),
        },
        valor: {
          original: paymentData.amount.toFixed(2),
        },
        chave: this.contaCorrente, // Usando conta corrente como chave PIX
        solicitacaoPagador: `AutoAjuda Pro - ${paymentData.description}`.substring(0, 140),
        infoAdicionais: [
          {
            nome: "Plano",
            valor: paymentData.planId,
          },
          {
            nome: "Email",
            valor: paymentData.customerEmail,
          },
          {
            nome: "Referencia",
            valor: paymentData.reference,
          },
        ],
      }

      console.log("📤 Enviando cobrança para Banco Inter:", {
        endpoint: `${this.baseUrl}/pix/v2/cob/${txid}`,
        txid,
        valor: pixPayload.valor.original,
        vencimento,
        chave: pixPayload.chave,
        devedor: pixPayload.devedor.nome,
      })

      const response = await fetch(`${this.baseUrl}/pix/v2/cob/${txid}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "AutoAjudaPro/1.0",
          Accept: "application/json",
        },
        body: JSON.stringify(pixPayload),
        // @ts-ignore
        agent: this.getHttpsAgent(),
      })

      console.log("📥 Resposta criação PIX:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Erro ao criar cobrança PIX:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          txid,
          endpoint: `${this.baseUrl}/pix/v2/cob/${txid}`,
        })
        throw new Error(
          `Erro ao criar cobrança PIX: ${response.status} - ${response.statusText}\nDetalhes: ${errorText}`,
        )
      }

      const pixData = await response.json()

      console.log("✅ Cobrança PIX criada com sucesso:", {
        txid: pixData.txid,
        status: pixData.status,
        valor: pixData.valor?.original,
        vencimento: pixData.calendario?.dataDeVencimento,
        temPixCopiaECola: !!pixData.pixCopiaECola,
      })

      // Gerar QR Code da cobrança
      let qrCodeBase64 = ""
      if (pixData.pixCopiaECola) {
        try {
          const qrResponse = await fetch(`${this.baseUrl}/pix/v2/qr/${pixData.txid}/imagem`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "User-Agent": "AutoAjudaPro/1.0",
              Accept: "image/png",
            },
            // @ts-ignore
            agent: this.getHttpsAgent(),
          })

          if (qrResponse.ok) {
            const qrBuffer = await qrResponse.arrayBuffer()
            qrCodeBase64 = Buffer.from(qrBuffer).toString("base64")
            console.log("✅ QR Code gerado com sucesso")
          } else {
            console.log("⚠️ Não foi possível gerar QR Code, mas cobrança foi criada")
          }
        } catch (qrError) {
          console.log("⚠️ Erro ao gerar QR Code:", qrError)
        }
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://autoajudapro.com"

      return {
        txid: pixData.txid,
        pixCopiaECola: pixData.pixCopiaECola || "",
        qrCode: qrCodeBase64,
        paymentUrl: `${baseUrl}/payment/pix?txid=${pixData.txid}`,
        status: pixData.status || "ATIVA",
        expiresAt: expirationDate.toISOString(),
      }
    } catch (error) {
      console.error("❌ Erro crítico ao criar pagamento PIX:", error)
      throw error
    }
  }

  async checkPixStatus(txid: string): Promise<any> {
    try {
      const token = await this.getAccessToken()

      console.log("🔍 Consultando status da cobrança PIX:", txid)

      const response = await fetch(`${this.baseUrl}/pix/v2/cob/${txid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "AutoAjudaPro/1.0",
          Accept: "application/json",
        },
        // @ts-ignore
        agent: this.getHttpsAgent(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Erro ao consultar cobrança PIX:", {
          status: response.status,
          error: errorText,
          txid,
        })
        throw new Error(`Erro ao consultar PIX: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      console.log("📊 Status da cobrança consultado:", {
        txid,
        status: data.status,
        valor: data.valor?.original,
        vencimento: data.calendario?.dataDeVencimento,
        pixRecebidos: data.pix?.length || 0,
      })

      return data
    } catch (error) {
      console.error("❌ Erro ao consultar status PIX:", error)
      throw error
    }
  }

  async setupWebhook(): Promise<boolean> {
    try {
      const token = await this.getAccessToken()
      const webhookUrl =
        process.env.BANCO_INTER_WEBHOOK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook/banco-inter`

      console.log("🔗 Configurando webhook Banco Inter:", webhookUrl)

      const webhookPayload = {
        webhookUrl,
        tiposEventos: ["pix"],
      }

      const response = await fetch(`${this.baseUrl}/pix/v2/webhook`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "AutoAjudaPro/1.0",
          Accept: "application/json",
        },
        body: JSON.stringify(webhookPayload),
        // @ts-ignore
        agent: this.getHttpsAgent(),
      })

      if (response.ok) {
        console.log("✅ Webhook configurado com sucesso")
        return true
      } else {
        const errorText = await response.text()
        console.error("❌ Erro ao configurar webhook:", response.status, errorText)
        return false
      }
    } catch (error) {
      console.error("❌ Erro ao configurar webhook:", error)
      return false
    }
  }
}
