"use client"

import React from "react"
import { X, Copy, Check } from "lucide-react"
import { useTrackingParams, type OrderData, type TrackingParameters } from "../hooks/useTrackingParams"
import { orderStorageService } from "@/lib/order-storage"
import { mobileDebug } from "@/lib/mobile-debug"

interface PixModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  customerData: {
    name: string
    email: string
    phone: string
    document: string
  }
  utmParameters?: Record<string, string>
}

export default function PixModal({ isOpen, onClose, amount, customerData, utmParameters = {} }: PixModalProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [pixCode, setPixCode] = React.useState("")
  const [qrCode, setQrCode] = React.useState("")
  const [transactionId, setTransactionId] = React.useState("")
  const [paymentStatus, setPaymentStatus] = React.useState<"pending" | "paid">("pending")
  const [isCopied, setIsCopied] = React.useState(false)
  const [orderData, setOrderData] = React.useState<any>(null)
  const [isGenerating, setIsGenerating] = React.useState(false)

  // UTM parameters para enviar apenas ao UTMify (não ao BlackCat)
  const finalUtmParams: TrackingParameters = {
    src: utmParameters.src || null,
    sck: utmParameters.sck || null,
    utm_source: utmParameters.utm_source || null,
    utm_campaign: utmParameters.utm_campaign || null,
    utm_medium: utmParameters.utm_medium || null,
    utm_content: utmParameters.utm_content || null,
    utm_term: utmParameters.utm_term || null,
    xcod: utmParameters.xcod || null,
    keyword: utmParameters.keyword || null,
    device: utmParameters.device || null,
    network: utmParameters.network || null,
    gclid: utmParameters.gclid || null,
    gad_source: utmParameters.gad_source || null,
    gbraid: utmParameters.gbraid || null
  }

  const generatePixPayment = async () => {
    mobileDebug.log("PIX: Iniciando geração de pagamento")
    
    if (isGenerating) {
      mobileDebug.log("PIX: Geração já em progresso, ignorando")
      return
    }

    setIsGenerating(true)
    setIsLoading(true)
    setError("")
    
    mobileDebug.log("PIX: Estados definidos", { isGenerating: true, isLoading: true })

    try {
      // Validar dados obrigatórios
      mobileDebug.log("PIX: Validando dados", customerData)
      if (!customerData.name || !customerData.email || !customerData.phone || !customerData.document) {
        mobileDebug.error("PIX: Dados obrigatórios faltando")
        throw new Error("Todos os campos são obrigatórios")
      }

      // Validar formato do CPF (deve ter 11 dígitos)
      const cpfNumbers = customerData.document.replace(/\D/g, "")
      mobileDebug.log("PIX: CPF validado", { cpf: cpfNumbers, length: cpfNumbers.length })
      if (cpfNumbers.length !== 11) {
        mobileDebug.error("PIX: CPF inválido", { cpf: cpfNumbers, length: cpfNumbers.length })
        throw new Error("CPF deve ter 11 dígitos")
      }

      // Validar formato do telefone (deve ter 10 ou 11 dígitos)
      const phoneNumbers = customerData.phone.replace(/\D/g, "")
      mobileDebug.log("PIX: Telefone validado", { phone: phoneNumbers, length: phoneNumbers.length })
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        mobileDebug.error("PIX: Telefone inválido", { phone: phoneNumbers, length: phoneNumbers.length })
        throw new Error("Telefone deve ter 10 ou 11 dígitos")
      }

      // Criar dados básicos (sem orderId - será gerado pelo BlackCat)
      mobileDebug.log("PIX: Preparando dados para BlackCat")

      // Payload para BlackCat (SEM orderId - será gerado pelo BlackCat)
      const blackcatPayload = {
        amount: Math.round(amount * 100),
        utmParams: finalUtmParams, // Incluir UTMs para salvar no metadata
        customer: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          document: {
            number: customerData.document,
            type: "cpf",
          },
        }
      }

      mobileDebug.log("PIX: Fazendo requisição para API")
      mobileDebug.log("PIX: Payload", blackcatPayload)

      const response = await fetch("/api/generate-pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blackcatPayload),
      })

      mobileDebug.log("PIX: Resposta recebida", { status: response.status, ok: response.ok })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.message || `Erro HTTP ${response.status}`
        const errorDetails = errorData.details || ''
        
        mobileDebug.error("PIX: Erro na API", { status: response.status, message: errorMessage, details: errorDetails })
        
        if (response.status === 401) {
          throw new Error("Erro de autenticação na API de pagamento")
        } else if (response.status === 400) {
          throw new Error("Dados inválidos para gerar PIX")
        } else if (response.status >= 500) {
          throw new Error("Erro no servidor de pagamentos. Tente novamente.")
        } else {
          throw new Error(`Erro ao gerar PIX: ${errorMessage}`)
        }
      }

      const data = await response.json()
      mobileDebug.log("PIX: Dados recebidos", { 
        hasPixCode: !!data.pixCode, 
        hasQrCode: !!data.qrCode, 
        hasTransactionId: !!data.transactionId 
      })

      if (data.pixCode) {
        setPixCode(data.pixCode)
        mobileDebug.log("PIX: Código PIX definido", { length: data.pixCode.length })
      }

      if (data.qrCode) {
        setQrCode(data.qrCode)
        mobileDebug.log("PIX: QR Code definido")
      }

      if (data.transactionId) {
        mobileDebug.log("PIX: Transaction ID definido", data.transactionId)
        setTransactionId(data.transactionId)
        
        // Salvar dados do pedido no storage para recuperar quando pagamento for confirmado
        const orderForStorage = {
          orderId: data.transactionId, // Usar transactionId como orderId
          transactionId: data.transactionId,
          amount: amount,
          status: 'pending' as const,
          customerData: {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            document: customerData.document
          },
          trackingParameters: finalUtmParams, // UTMs salvos para enviar ao UTMify depois
          createdAt: new Date().toISOString()
        }
        
        orderStorageService.saveOrder(orderForStorage)
        mobileDebug.log("PIX: Pedido salvo no storage")
      }

      setPaymentStatus("pending")
      mobileDebug.log("PIX: Status definido como pending")
      mobileDebug.log("PIX: QR Code gerado com sucesso - aguardando confirmação do BlackCat via webhook")
      
      // DEBUG CLIENT-SIDE: Mostrar informações importantes no console
      console.group("🔍 [DEBUG PIX] Informações do pagamento gerado")
      console.log("📦 Transaction ID:", data.transactionId)
      console.log("💰 Valor:", amount)
      console.log("👤 Cliente:", customerData)
      console.log("🎯 UTM Parameters:", finalUtmParams)
      console.log("🔗 Webhook URL esperada:", `${window.location.origin}/api/webhook`)
      console.log("⏰ Timestamp:", new Date().toISOString())
      console.log("🚨 IMPORTANTE: BlackCat deve estar configurado para enviar webhook!")
      console.log("🚨 URL do webhook no BlackCat:", `${window.location.origin}/api/webhook`)
      console.log("🚨 Se não receber webhook em 30s, verificar configuração no BlackCat")
      console.groupEnd()
      
      // Sistema de fallback - verificar status a cada 5 segundos
      let fallbackInterval: NodeJS.Timeout
      let fallbackAttempts = 0
      const maxFallbackAttempts = 43 // 5 minutos (43 x 7s)

      const startFallbackCheck = () => {
        console.log("🔄 [FALLBACK] Iniciando verificação de status a cada 7 segundos")
        
        fallbackInterval = setInterval(async () => {
          fallbackAttempts++
          console.log(`🔄 [FALLBACK] Tentativa ${fallbackAttempts}/${maxFallbackAttempts} - Verificando status...`)

          try {
            const statusResponse = await fetch('/api/check-transaction-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transactionId: data.transactionId })
            })

            const statusData = await statusResponse.json()
            console.log(`🔄 [FALLBACK] Status atual:`, statusData.status)

            if (statusData.status === 'paid') {
              console.log("🎉 [FALLBACK] PAGAMENTO CONFIRMADO!")
              setPaymentStatus("paid")
              clearInterval(fallbackInterval)
              
              // Mostrar no console para o cliente
              console.group("🎉 [PAGAMENTO CONFIRMADO] Via Fallback")
              console.log("✅ Status:", "PAID")
              console.log("📦 Transaction ID:", data.transactionId)
              console.log("💰 Valor:", amount)
              console.log("⏰ Confirmado em:", new Date().toLocaleString())
              console.groupEnd()
            } else if (fallbackAttempts >= maxFallbackAttempts) {
              console.warn("⏰ [FALLBACK] Tempo limite atingido, parando verificações")
              clearInterval(fallbackInterval)
            }
          } catch (error) {
            console.error("❌ [FALLBACK] Erro ao verificar status:", error)
          }
        }, 7000) // A cada 7 segundos (evitar 429)
      }

      // Iniciar fallback após 10 segundos (dar tempo para webhook chegar)
      setTimeout(startFallbackCheck, 10000)

      // Cleanup do interval quando modal fechar
      const originalOnClose = onClose
      const enhancedOnClose = () => {
        if (fallbackInterval) {
          clearInterval(fallbackInterval)
          console.log("🔄 [FALLBACK] Verificações interrompidas - modal fechado")
        }
        originalOnClose()
      }
      
      // Aguardar 30 segundos e verificar se webhook foi recebido
      setTimeout(() => {
        console.group("⏰ [DEBUG WEBHOOK] Verificação após 30 segundos")
        console.log("🔍 Verificando se webhook foi recebido...")
        console.log("📦 Transaction ID para verificar:", data.transactionId)
        console.log("🚨 Se não apareceu log de webhook, BlackCat não está enviando!")
        console.log("🔄 Fallback está rodando a cada 7s como backup")
        console.groupEnd()
      }, 30000)

    } catch (error) {
      mobileDebug.error("pix: Erro geral", error)
    } finally {
      mobileDebug.log("PIX: Finalizando geração")
      setIsLoading(false)
      setIsGenerating(false)
    }
  }

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      // Fallback para dispositivos que não suportam clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = pixCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  // Generate PIX when modal opens
  React.useEffect(() => {
    if (isOpen && !pixCode && !isGenerating && !isLoading && customerData.name && customerData.email) {
      mobileDebug.log("PIX: Modal aberto, gerando PIX automaticamente")
      generatePixPayment()
    }
  }, [isOpen, customerData, pixCode, isGenerating, isLoading])

  // Reset states when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setPixCode("")
      setQrCode("")
      setTransactionId("")
      setPaymentStatus("pending")
      setError("")
      setIsCopied(false)
      setOrderData(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Pagamento PIX</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Gerando pagamento PIX...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-6">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={generatePixPayment}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {pixCode && !isLoading && !error && (
            <div className="space-y-6">
              {qrCode && (
                <div className="text-center">
                  <img 
                    src={qrCode} 
                    alt="QR Code PIX" 
                    className="mx-auto max-w-full h-auto rounded-lg border"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código PIX (Copia e Cola)
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={pixCode}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                  />
                  <button
                    onClick={copyPixCode}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                    {isCopied ? 'Copiado!' : 'Copiar Código PIX'}
                  </button>
                </div>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>Valor: <span className="font-bold">R$ {amount.toFixed(2)}</span></p>
                <p className="mt-2">Status: <span className="font-bold">{paymentStatus === "pending" ? "Aguardando pagamento" : "Pago"}</span></p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-2">Como pagar:</h3>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Abra o app do seu banco</li>
                  <li>2. Escolha a opção PIX</li>
                  <li>3. Escaneie o QR Code ou cole o código</li>
                  <li>4. Confirme o pagamento</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
