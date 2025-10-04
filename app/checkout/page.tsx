"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Toast from "../../components/toast"
import { useUtmParams } from "@/hooks/useUtmParams"
import QRCode from "qrcode"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { utmParams } = useUtmParams()

  const [playerName, setPlayerName] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [cpf, setCpf] = useState("")
  const [utmParameters, setUtmParameters] = useState<Record<string, string>>({})
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success")
  const [pixData, setPixData] = useState<{code: string, qrCode: string, transactionId: string} | null>(null)
  const [showPixInline, setShowPixInline] = useState(false)
  const [pixError, setPixError] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [qrCodeImage, setQrCodeImage] = useState("")
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutos em segundos
  const [timerActive, setTimerActive] = useState(false)

  // Get URL parameters
  const itemType = searchParams.get("itemType") || "recharge"
  const itemValue = searchParams.get("itemValue") || "1.060"
  const playerId = searchParams.get("playerId") || ""
  const price = searchParams.get("price") || "14.24"
  const paymentMethod = searchParams.get("paymentMethod") || "PIX"

  useEffect(() => {
    setPlayerName(playerId)
    
    // Capturar parâmetros UTM da URL atual e do sessionStorage
    const urlParams = new URLSearchParams(window.location.search)
    const utmData: Record<string, string> = {}
    
    // Lista de parâmetros para capturar
    const paramsToCapture = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
      'gclid', 'fbclid', 'src', 'sck', 'xcod', 'keyword', 'device', 'network', 
      'gad_source', 'gbraid', 'wbraid', 'msclkid'
    ]
    
    // 1. Capturar da URL atual
    paramsToCapture.forEach(param => {
      const value = urlParams.get(param)
      if (value) {
        utmData[param] = value
      }
    })
    
    // 2. Capturar do sessionStorage (persistência entre páginas)
    paramsToCapture.forEach(param => {
      if (!utmData[param]) {
        const storedValue = sessionStorage.getItem(`utm_${param}`)
        if (storedValue) {
          utmData[param] = storedValue
        }
      }
    })
    
    // 3. Usar parâmetros do hook como fallback
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value && !utmData[key]) {
        utmData[key] = value
      }
    })
    // 4. Salvar no sessionStorage para próximas páginas
    Object.entries(utmData).forEach(([key, value]) => {
      sessionStorage.setItem(`utm_${key}`, value)
    })
    
    // 5. Adicionar timestamp e página atual
    utmData.timestamp = new Date().toISOString()
    utmData.current_page = 'checkout'
    utmData.referrer = document.referrer || 'direct'
    
    // Debug temporário - verificar captura de UTMs
    if (Object.keys(utmData).filter(key => key.startsWith('utm_')).length > 0) {
      console.log('✅ UTM Parameters detectados:', utmData)
    } else {
      console.log('⚠️ Nenhum UTM parameter detectado. URL atual:', window.location.href)
    }
    
    setUtmParameters(utmData)
  }, [playerId, utmParams])

  const showToastMessage = (message: string, type: "success" | "error" | "info") => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
  }

  const getFinalPrice = () => {
    return Number.parseFloat(price!)
  }


  const calculateDiamondDetails = (diamonds: string) => {
    const diamondCount = Number.parseInt(diamonds.replace(".", "").replace(",", ""))
    const bonusMap: { [key: number]: number } = {
      100: 20, 310: 62, 520: 104, 1060: 212, 2180: 436, 5600: 1120, 15600: 3120,
    }
    const bonus = bonusMap[diamondCount] || 0
    const total = diamondCount + bonus
    return { original: diamondCount, bonus, total }
  }

  const handleBack = () => {
    router.back()
  }

  const handleProceedToPayment = async () => {
    if (isProcessingPayment) {
      return
    }

    if (!fullName.trim() || !email.trim() || !phone.trim() || !cpf.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    if (!validateCpf(cpf)) {
      alert("Por favor, insira um CPF válido.")
      return
    }

    setIsProcessingPayment(true)
    setShowPixInline(true)
    setPixError("")
    
    try {
      // Gerar PIX
      const response = await fetch('/api/generate-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(getFinalPrice() * 100),
          utmParams: utmParameters,
          playerId: playerId,
          itemType: itemType,
          itemValue: itemValue,
          paymentMethod: paymentMethod,
          customer: {
            name: fullName,
            email: email,
            phone: getPhoneNumbers(phone),
            document: {
              number: cpf.replace(/\D/g, ""),
              type: "cpf"
            }
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Gerar QR Code em base64
        let qrCodeImageData = ""
        try {
          const qrCodeDataURL = await QRCode.toDataURL(data.pixCode, {
            width: 150,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
          })
          qrCodeImageData = qrCodeDataURL
        } catch (qrError) {
          // Erro silencioso no QR Code
          // Fallback: usar a imagem do servidor se disponível
          if (data.qrCode) {
            qrCodeImageData = data.qrCode
          }
        }
        
        setPixData({
          code: data.pixCode,
          qrCode: data.qrCode,
          transactionId: data.transactionId
        })
        
        setQrCodeImage(qrCodeImageData)
        
        // Iniciar timer de 15 minutos
        setTimeLeft(15 * 60)
        setTimerActive(true)
        
        // Enviar para UTMify com status pending
        await sendToUtmify('pending', data)
        
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.message || `Erro HTTP ${response.status}`
        setPixError(`Erro ao gerar PIX: ${errorMessage}`)
      }
    } catch (error) {
      setPixError('Erro ao gerar PIX. Tente novamente.')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const formatPrice = (priceStr: string) => {
    return `R$ ${Number.parseFloat(priceStr).toFixed(2).replace(".", ",")}`
  }

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    }
    return value
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }
  }

  const getPhoneNumbers = (formattedPhone: string) => {
    return formattedPhone.replace(/\D/g, "")
  }

  const validateCpf = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, "")
    if (numbers.length !== 11) return false
    
    if (/^(\d)\1{10}$/.test(numbers)) return false
    
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i)
    }
    let digit1 = 11 - (sum % 11)
    if (digit1 > 9) digit1 = 0
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i)
    }
    let digit2 = 11 - (sum % 11)
    if (digit2 > 9) digit2 = 0
    
    return parseInt(numbers[9]) === digit1 && parseInt(numbers[10]) === digit2
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value)
    setCpf(formatted)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }

  // Timer de 15 minutos
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, timeLeft])


  // Formatar tempo para exibição (MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Função para enviar dados para UTMify (apenas pending no checkout)
  const sendToUtmify = async (status: 'pending', transactionData: any) => {
    try {
      // Criar dados no formato do UTMify (mesmo formato do webhook)
      const utmifyData = {
        orderId: transactionData.transactionId,
        platform: "RecarGames",
        paymentMethod: "pix",
        status: "waiting_payment", // Status UTMify para pending
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        approvedDate: null,
        refundedAt: null,
        customer: {
          name: fullName,
          email: email,
          phone: getPhoneNumbers(phone),
          document: cpf.replace(/\D/g, ""),
          country: "BR",
          ip: "unknown"
        },
        products: [
          {
            id: `recarga-${transactionData.transactionId}`,
            name: "Recarga Free Fire",
            planId: null,
            planName: null,
            quantity: 1,
            priceInCents: Math.round(getFinalPrice() * 100)
          }
        ],
        trackingParameters: {
          src: utmParameters.src || null,
          sck: utmParameters.sck || null,
          utm_source: utmParameters.utm_source || null,
          utm_campaign: utmParameters.utm_campaign || null,
          utm_medium: utmParameters.utm_medium || null,
          utm_content: utmParameters.utm_content || null,
          utm_term: utmParameters.utm_term || null,
          gclid: utmParameters.gclid || null,
          xcod: utmParameters.xcod || null,
          keyword: utmParameters.keyword || null,
          device: utmParameters.device || null,
          network: utmParameters.network || null,
          gad_source: utmParameters.gad_source || null,
          gbraid: utmParameters.gbraid || null
        },
        commission: {
          totalPriceInCents: Math.round(getFinalPrice() * 100),
          gatewayFeeInCents: Math.round(getFinalPrice() * 100),
          userCommissionInCents: Math.round(getFinalPrice() * 100)
        },
        isTest: process.env.NEXT_PUBLIC_UTMIFY_TEST_MODE === 'true'
      }

      const response = await fetch('/api/utmify-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(utmifyData)
      })
      
      if (response.ok) {
        console.log('✅ UTMify: Lead (pending) enviado com sucesso')
      } else {
        console.warn('⚠️ UTMify: Erro ao enviar lead')
      }
    } catch (error) {
      console.warn('⚠️ UTMify: Erro de conexão', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-white border-b border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10">
              <img src="/images/garena-logo.png" alt="Garena Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg text-gray-800">Canal Oficial de</h1>
              <p className="text-xs sm:text-sm text-gray-600">Recarga</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="w-full h-32 sm:h-48 md:h-64">
          <img src="/images/checkout-banner.webp" alt="Free Fire Banner" className="w-full h-full object-cover" />
        </div>

        <button
          onClick={handleBack}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="text-center py-4 sm:py-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Free Fire</h2>
      </div>

      <div className="max-w-2xl mx-auto px-3 sm:px-4 pb-4 sm:pb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          {itemType === "recharge" ? (
            <>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-gray-600 text-sm sm:text-base">Total</span>
                <div className="flex items-center gap-2">
                  <img
                    src="https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png"
                    alt="Diamante"
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  />
                  <span className="font-bold text-base sm:text-lg">
                    {calculateDiamondDetails(itemValue!).total.toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-gray-600 text-sm sm:text-base">Oferta Especial</span>
              <span className="font-bold text-base sm:text-lg">{itemValue}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-lg sm:text-xl font-bold border-t pt-3 sm:pt-4">
            <span>Preço</span>
            <span>
              {formatPrice(getFinalPrice().toString())}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          {!showPixInline ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={handleCpfChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="000.000.000-00"
                />
                {cpf && !validateCpf(cpf) && (
                  <p className="text-red-500 text-xs mt-1">CPF inválido</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col">
              {isProcessingPayment ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Gerando pagamento PIX...</p>
                </div>
              ) : pixError ? (
                <div className="text-center py-6">
                  <p className="text-red-600 mb-4">{pixError}</p>
                  <button
                    onClick={() => {
                      setShowPixInline(false)
                      setPixError("")
                      setPixData(null)
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : pixData ? (
                <>
                  {/* Título */}
                  <div className="text-center text-lg font-medium text-gray-800 mb-4">Pague com Pix</div>
                  
                  {/* QR Code */}
                  <div className="my-3 flex h-[150px] w-full items-center justify-center">
                    {qrCodeImage ? (
                      <img 
                        src={qrCodeImage} 
                        alt="QR Code Pix" 
                        width="150" 
                        height="150" 
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="w-[150px] h-[150px] bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Gerando QR Code...</span>
                      </div>
                    )}
                  </div>

                  {/* Informações da empresa */}
                  <div className="text-center text-gray-500 text-sm mb-4">
                    KAPTPAY TECNOLOGIA DE PAGAMENTOS<br/>
                    CNPJ: 62.912.988/0001-12
                  </div>

                  {/* Código PIX */}
                  <div className="mb-4 mt-3 select-all break-words rounded-md bg-gray-100 p-4 text-sm text-gray-800">
                    {pixData.code}
                  </div>

                  {/* Botão Copiar */}
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(pixData.code)
                        setIsCopied(true)
                        setTimeout(() => setIsCopied(false), 2000)
                      } catch (error) {
                        // Fallback para dispositivos que não suportam clipboard API
                        const textArea = document.createElement('textarea')
                        textArea.value = pixData.code
                        document.body.appendChild(textArea)
                        textArea.select()
                        document.execCommand('copy')
                        document.body.removeChild(textArea)
                        setIsCopied(true)
                        setTimeout(() => setIsCopied(false), 2000)
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors bg-red-500 text-white hover:bg-red-600 px-4 py-2 mb-6 h-11 text-base font-bold w-full"
                  >
                    {isCopied ? 'Copiado!' : 'Copiar Código'}
                  </button>

                  {/* Timer/Alerta */}
                  <div role="alert" className="relative rounded-lg border p-4 bg-background text-foreground text-left w-full mb-4">
                    <div className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M5 22h14"></path>
                        <path d="M5 2h14"></path>
                        <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
                        <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
                      </svg>
                      <div>
                        <h5 className="mb-1 font-medium leading-none tracking-tight">Aguardando pagamento</h5>
                        <div className="text-sm">
                          {timerActive ? (
                            <>Você tem <span className="font-bold text-red-600">{formatTime(timeLeft)}</span> para pagar. Após o pagamento, os diamantes podem levar alguns minutos para serem creditados.</>
                          ) : timeLeft === 0 ? (
                            <span className="text-red-600 font-medium">Tempo expirado. Gere um novo PIX para continuar.</span>
                          ) : (
                            "Você tem tempo para pagar. Após o pagamento, os diamantes podem levar alguns minutos para serem creditados."
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instruções de pagamento */}
                  <div className="text-gray-500 text-sm space-y-4">
                    <p className="font-semibold">Para realizar o pagamento siga os passos abaixo:</p>
                    <ol className="list-decimal list-inside space-y-2 pl-2">
                      <li>Abra o app ou o site da sua instituição financeira e seleciona o Pix.</li>
                      <li>Utilize as informações acima para realizar o pagamento.</li>
                      <li>Revise as informações e pronto!</li>
                    </ol>
                    <p>Seu pedido está sendo processado pelo nosso parceiro KAPTPAY.</p>
                    <p>Você receberá seus diamantes após recebermos a confirmação do pagamento. Isso ocorre geralmente em alguns minutos após a realização do pagamento na sua instituição financeira.</p>
                    <p>Em caso de dúvidas entre em contato com o suporte.</p>
                  </div>


                  {/* Botão Voltar */}
                  <button
                    onClick={() => {
                      setShowPixInline(false)
                      setPixData(null)
                      setIsCopied(false)
                      setQrCodeImage("")
                      setTimerActive(false)
                      setTimeLeft(15 * 60)
                    }}
                    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors px-4 py-2 h-11 text-base font-bold w-full ${
                      timeLeft === 0 
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                  >
                    {timeLeft === 0 ? 'Gerar Novo PIX' : 'Voltar'}
                  </button>
                </>
              ) : null}
            </div>
          )}
        </div>

        {!showPixInline && (
          <>
            <div className="text-gray-500 text-xs/normal mb-4">
              Ao clicar em "Prosseguir para Pagamento", atesto que li e concordo com os termos de uso e com a política de privacidade.
            </div>
            <button
              onClick={handleProceedToPayment}
              disabled={isProcessingPayment}
              className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg ${
                isProcessingPayment 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isProcessingPayment ? 'Processando...' : 'Prosseguir para Pagamento'}
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#EFEFEF] text-gray-600">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="flex flex-col items-center gap-3 p-4 text-center text-xs md:items-start max-md:pb-5">
            <div className="flex flex-col items-center gap-3 leading-none md:w-full md:flex-row md:justify-between">
              <div className="md:text-start">© 2025 Garena Online. Todos os direitos reservados.</div>
              <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <a href="#" className="transition-opacity hover:opacity-70">FAQ</a>
                <div className="h-3 w-px bg-gray-300"></div>
                <a href="https://www.recargajogo.eu/legal/tos?utm_source=organicjLj68e076949be15d3367c027e6&utm_campaign=&utm_medium=&utm_content=&utm_term=" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-70">Termos e Condições</a>
                <div className="h-3 w-px bg-gray-300"></div>
                <a href="https://www.recargajogo.eu/legal/pp?utm_source=organicjLj68e076949be15d3367c027e6&utm_campaign=&utm_medium=&utm_content=&utm_term=" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-70">Política de Privacidade</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <Toast
        isVisible={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />

    </div>
  )
}
