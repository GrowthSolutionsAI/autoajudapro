import fs from "fs"
import path from "path"
import https from "https"

export class BancoInterProduction {
  private clientId: string
  private clientSecret: string
  private contaCorrente: string
  private baseUrl: string
  private accessToken: string | null = null
  private tokenExpiresAt = 0

  constructor() {
    // Credenciais oficiais de produção
    this.clientId = process.env.BANCO_INTER_CLIENT_ID!
    this.clientSecret = process.env.BANCO_INTER_CLIENT_SECRET!
    this.contaCorrente = process.env.BANCO_INTER_CONTA_CORRENTE!
    this.baseUrl = "https://cdpj.partners.bancointer.com.br"

    if (!this.clientId || !this.clientSecret || !this.contaCorrente) {
      throw new Error("❌ Credenciais do Banco Inter não configuradas")
    }

    console.log("🏦 Banco Inter Produção inicializado:", {
      clientId: this.clientId.substring(0, 8) + "...",
      conta: this.contaCorrente,
      ambiente: "PRODUÇÃO",
    })
  }

  private getHttpsAgent() {
    try {
      const certPath = path.join(process.cwd(), "certificates", "Inter_API_Certificado.crt")
      const keyPath = path.join(process.cwd(), "certificates", "Inter_API_Chave.key")

      if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        const cert = fs.readFileSync(certPath)
        const key = fs.readFileSync(keyPath)

        console.log("🔐 Certificados SSL carregados para produção")

        return new https.Agent({
          cert,
          key,
          rejectUnauthorized: true,
          timeout: 30000,
        })
      }
    } catch (error) {
      console.error("⚠️ Erro ao carregar certificados:", error)
    }

    return new https.Agent({
      rejectUnauthorized: true,
      timeout: 30000,
    })
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 300000) {
      return this.accessToken
    }

    console.log("🔑 Obtendo token OAuth2 - Produção...")

    try {
      const scopes = [
        "cob.write",
        "cob.read",
        "cobv.write",
        "cobv.read",
        "pix.write",
        "pix.read",
        "webhook.write",
        "webhook.read",
      ].join(" ")

      const requestBody = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "client_credentials",
        scope: scopes,
      }).toString()

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

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OAuth2 falhou: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiresAt = Date.now() + data.expires_in * 1000

      console.log("✅ Token OAuth2 obtido - Produção")
      return this.accessToken
    } catch (error) {
      console.error("❌ Erro crítico OAuth2:", error)
      throw error
    }
  }

  async createPixPayment(data: {
    amount: number
    customerName: string
    customerEmail: string
    customerDocument: string
    reference: string
    planId: string
  }) {
    try {
      const token = await this.getAccessToken()

      // Gerar TXID único
      const timestamp = Date.now().toString()
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
      const txid = `AUTOAJUDA${timestamp}${randomSuffix}`.substring(0, 35)

      // Data de vencimento (24 horas)
      const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const vencimento = expirationDate.toISOString().split("T")[0]

      const pixPayload = {
        calendario: {
          dataDeVencimento: vencimento,
          validadeAposVencimento: 1,
        },
        devedor: {
          nome: data.customerName.substring(0, 200),
          cpf: data.customerDocument.replace(/\D/g, "").padStart(11, "0"),
        },
        valor: {
          original: data.amount.toFixed(2),
        },
        chave: this.contaCorrente,
        solicitacaoPagador: `AutoAjuda Pro - ${data.planId}`.substring(0, 140),
        infoAdicionais: [
          {
            nome: "Plano",
            valor: data.planId,
          },
          {
            nome: "Email",
            valor: data.customerEmail,
          },
          {
            nome: "Referencia",
            valor: data.reference,
          },
        ],
      }

      console.log("📤 Criando cobrança PIX - Produção:", {
        txid,
        valor: pixPayload.valor.original,
        cliente: data.customerName,
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

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ao criar PIX: ${response.status} - ${errorText}`)
      }

      const pixData = await response.json()

      console.log("✅ Cobrança PIX criada - Produção:", {
        txid: pixData.txid,
        status: pixData.status,
      })

      // Gerar QR Code
      let qrCodeBase64 = ""
      if (pixData.pixCopiaECola) {
        try {
          const qrResponse = await fetch(`${this.baseUrl}/pix/v2/qr/${pixData.txid}/imagem`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "image/png",
            },
            // @ts-ignore
            agent: this.getHttpsAgent(),
          })

          if (qrResponse.ok) {
            const qrBuffer = await qrResponse.arrayBuffer()
            qrCodeBase64 = Buffer.from(qrBuffer).toString("base64")
          }
        } catch (qrError) {
          console.log("⚠️ Erro ao gerar QR Code:", qrError)
        }
      }

      return {
        txid: pixData.txid,
        pixCopiaECola: pixData.pixCopiaECola || "",
        qrCode: qrCodeBase64,
        paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pix?txid=${pixData.txid}`,
        status: pixData.status || "ATIVA",
        expiresAt: expirationDate.toISOString(),
      }
    } catch (error) {
      console.error("❌ Erro ao criar pagamento PIX - Produção:", error)
      throw error
    }
  }

  async setupWebhook(): Promise<boolean> {
    try {
      const token = await this.getAccessToken()
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook/banco-inter`

      console.log("🔗 Configurando webhook - Produção:", webhookUrl)

      const response = await fetch(`${this.baseUrl}/pix/v2/webhook`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webhookUrl,
          tiposEventos: ["pix"],
        }),
        // @ts-ignore
        agent: this.getHttpsAgent(),
      })

      if (response.ok) {
        console.log("✅ Webhook configurado - Produção")
        return true
      } else {
        const errorText = await response.text()
        console.error("❌ Erro webhook:", errorText)
        return false
      }
    } catch (error) {
      console.error("❌ Erro ao configurar webhook:", error)
      return false
    }
  }
}
