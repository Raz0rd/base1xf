"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import { useRouter } from 'next/navigation';
import { useUtmParams } from '@/hooks/useUtmParams';
import HeadManager from '@/components/HeadManager';
import LoginModal from '@/components/login-modal';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { isAuthenticated, userData: authUserData, loading: authLoading, login } = useAuth();
  const [mounted, setMounted] = useState(false)
  const [showLeadMessage, setShowLeadMessage] = useState(false)
  const [leadMessageType, setLeadMessageType] = useState<"default" | "nao_quer_agora" | "nao_tem_interesse">("default")
  const [loginError, setLoginError] = useState("")
  const [showSocialError, setShowSocialError] = useState(false)
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [showPurchasePage, setShowPurchasePage] = useState(true)
  const [showOfferInfoModal, setShowOfferInfoModal] = useState(false)
  const [selectedOfferInfo, setSelectedOfferInfo] = useState<{name: string, image: string, description: string} | null>(null)
  const [textAnswer, setTextAnswer] = useState("")
  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showIllusoryLoading, setShowIllusoryLoading] = useState(false)
  const [showTutorialModal, setShowTutorialModal] = useState(false)
  const [selectedRechargeValue, setSelectedRechargeValue] = useState<string | null>(null)
  const [selectedSpecialOffer, setSelectedSpecialOffer] = useState<string | null>(null)
  const [showCookieBanner, setShowCookieBanner] = useState(false)
  const [showFreeItemModal, setShowFreeItemModal] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("PIX")
  const [showExitMessage, setShowExitMessage] = useState(false)
  const [exitMessage, setExitMessage] = useState("")
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [pendingDisqualifyAnswer, setPendingDisqualifyAnswer] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<'freefire' | 'deltaforce' | 'haikyu'>('freefire')
  
  // Função para navegar preservando UTM params
  const navigateToGame = (appId: string) => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      searchParams.set('app', appId)
      router.push(`/?${searchParams.toString()}`)
    }
  }

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
  
  // Configurações dinâmicas por jogo
  const gameConfig = {
    freefire: {
      name: 'Free Fire',
      banner: '/images/checkout-banner.webp',
      icon: '/images/profile-icon.webp',
      coinIcon: '/images/point.webp',
      userIcon: '/images/profile-icon.webp',
      rechargeValues: ["100", "310", "520", "1.060", "2.180", "5.600", "15.600"],
      promotionalValues: ["1.060", "2.180", "5.600", "15.600"],
      specialOffers: [
        { id: 'semanal', name: 'Assinatura Semanal', image: '/images/semanal.png', description: 'Ganhe 60 diamantes agora e resgate 40 diamantes todos os dias no jogo, durante 7 dias! Você receberá 340 diamantes no total.' },
        { id: 'mensal', name: 'Assinatura Mensal', image: '/images/mensal.png', description: 'Ganhe 300 diamantes agora e resgate 50 diamantes todos os dias no jogo, durante 30 dias! Você receberá 1800 diamantes no total.' },
        { id: 'booyah', name: 'Passe Booyah Premium Plus', image: '/images/boyahplus.png', description: 'Ganhe todos os privilégios e recompensas do Booyah Pass Premium + recompensas exclusivas + 50 níveis do Booyah Pass instantaneamente.' },
        { id: 'nivel', name: 'Passe de Nível', image: '/images/passe-nivel.webp', description: 'Avance de nível e desbloqueie recompensas incríveis, incluindo skins exclusivas e diamantes.' }
      ]
    },
    deltaforce: {
      name: 'Delta Force',
      banner: '/images/backgroundDelta.jpg',
      icon: '/images/delta-force-icon.webp',
      coinIcon: '/images/IconeCoinsDF.png',
      userIcon: '/images/iconeusuarioDeltaForce.png',
      rechargeValues: ["60", "300", "680", "1.280", "3.280", "6.480"],
      promotionalValues: ["680", "1.280", "3.280", "6.480"], // Todos com coins em dobro
      specialOffers: [
        { id: 'genesis', name: 'Black Hawk Down - Gênesis', image: '/images/Black Hawk Down - Gênesis.png', description: 'Limitado a 1 compra por conta.' },
        { id: 'reinvencao', name: 'Black Hawk Down - Reinvenção', image: '/images/Black Hawk Down - Reinvenção.png', description: 'Limitado a 1 compra por conta.' },
        { id: 'mare', name: 'Suprimentos de Maré', image: '/images/Suprimentos de Maré.png', description: 'Limitado a 1 compra por conta.' },
        { id: 'mare-avancado', name: 'Suprimentos de Maré - Avançado', image: '/images/Suprimentos de Maré - Avançado.png', description: 'Limitado a 1 compra por conta.' }
      ]
    },
    haikyu: {
      name: 'HAIKYU!! FLY HIGH',
      banner: '/images/backgroundHiuki.jpg',
      icon: '/images/HAIKIU FLY HIGH.png',
      coinIcon: '/images/iconCoinHaikyu.png',
      userIcon: '/images/HAIKIU FLY HIGH.png',
      rechargeValues: ["60", "300", "680", "1.280", "3.280", "6.480"],
      promotionalValues: ["680", "1.280", "3.280"],
      specialOffers: [
        { id: 'haikyu1', name: 'Especial de Recrutar Ultra I', image: '/images/haikiuEspecial1.png', description: 'Bilhete de Recrutar Ultra x1，Diamantes Estelares x200' },
        { id: 'haikyu2', name: 'Especial de Recrutar Ultra II', image: '/images/HaikiuEspecial2.png', description: 'Bilhete de Recrutar Ultra x5，Diamantes Estelares x300' },
        { id: 'haikyu3', name: 'Especial de Recrutar Ultra III', image: '/images/HaikiuEspecial3.png', description: 'Bilhete de Recrutar Ultra x5，Diamantes Estelares x500' },
        { id: 'haikyu4', name: 'Especial de Recrutar Ultra IV', image: '/images/HaikiuEspecial4.png', description: 'Bilhete de Recrutar Ultra x10，Diamantes Estelares x500' }
      ]
    }
  }

  const currentConfig = gameConfig[selectedGame]

  const router = useRouter()
  const { getUtmObject } = useUtmParams()
  
  // Evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  // Verificar consentimento de cookies
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const cookieConsent = localStorage.getItem('cookieConsent')
    
    if (!cookieConsent) {
      setShowCookieBanner(true)
    }
  }, [])

  // Função para aceitar cookies
  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true')
    setShowCookieBanner(false)
  }
  
  // Array de banners para carousel (4 banners diferentes)
  const banners = [
    {
      src: "/images/banner1.webp",
      alt: "Banner 1 - Promoção Especial de Recarga"
    },
    {
      src: "/images/BANNER3.png",
      alt: "Recarga Segura e Rápida - Checkout Premium com Bônus Exclusivos!"
    },
    {
      src: "/images/banner4.png",
      alt: "Banner 4 - Ofertas Exclusivas de Recarga"
    }
  ]


  // Capturar e salvar parâmetros UTM no sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const urlParams = new URLSearchParams(window.location.search)
    const paramsToCapture = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
      'gclid', 'fbclid', 'src', 'sck', 'xcod', 'keyword', 'device', 'network', 
      'gad_source', 'gbraid', 'wbraid', 'msclkid'
    ]
    
    // Salvar parâmetros da URL no sessionStorage
    paramsToCapture.forEach(param => {
      const value = urlParams.get(param)
      if (value) {
        sessionStorage.setItem(`utm_${param}`, value)
      }
    })
    
    // Capturar Adspect Click ID
    // Prioridade: gclid (Google Ads) > cid > clickid > click_id
    const adspectCid = urlParams.get('gclid') || 
                       urlParams.get('cid') || 
                       urlParams.get('clickid') || 
                       urlParams.get('click_id')
    if (adspectCid) {
      sessionStorage.setItem('adspect_cid', adspectCid)
    }
    
    const utmParams = getUtmObject()
  }, [])


  // Debug dos estados do modal
  

  // Rotação automática dos banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => 
        (prevIndex + 1) % banners.length
      )
    }, 6000) // Troca a cada 4 segundos

    return () => clearInterval(interval)
  }, [banners.length])

  // Função para gerar cupom de desconto
  const generateCoupon = () => {
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000) // 8 dígitos
    return `FF${randomDigits}`
  }

  // Função para copiar texto (compatível com mobile)
  const copyToClipboard = async (text: string) => {
    try {
      // Tentar usar a API moderna primeiro
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        setCouponCopied(true)
        return
      }
      
      // Fallback para dispositivos móveis/contextos não seguros
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        setCouponCopied(true)
      } else {
        throw new Error('Falha ao copiar')
      }
    } catch (error) {
      // Como último recurso, mostrar um prompt para o usuário copiar manualmente
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)
      
      if (isMobile) {
        alert(`Copie este código manualmente: ${text}`)
        setCouponCopied(true)
      }
    }
  }

  // Array de banners para o carrossel
  const bannerImages = [
    "/images/checkout-banner.webp",
    "/images/checkout-banner.webp", // Duplicando por enquanto
    "/images/checkout-banner.webp"  // Você pode substituir por outras imagens
  ]

  // useEffect removido - usando apenas o carousel principal dos banners

  const calculatePrice = (diamonds: string): { price: number; bonus: number } => {
    const diamondCount = Number.parseInt(diamonds.replace(".", "").replace(",", "")) // Handle both '.' and ',' as thousand separators

    // Preços específicos por jogo
    if (selectedGame === 'deltaforce') {
      const priceMap: { [key: number]: { price: number; bonus: number } } = {
        60: { price: 5.99, bonus: 0 },
        300: { price: 14.99, bonus: 0 },
        680: { price: 24.99, bonus: 680 },     // COINS EM DOBRO
        1280: { price: 37.99, bonus: 1280 },   // COINS EM DOBRO
        3280: { price: 97.99, bonus: 3280 },   // COINS EM DOBRO
        6480: { price: 189.99, bonus: 6480 },  // COINS EM DOBRO
      }
      return priceMap[diamondCount] || { price: 0, bonus: 0 }
    }

    if (selectedGame === 'haikyu') {
      const priceMap: { [key: number]: { price: number; bonus: number } } = {
        60: { price: 5.99, bonus: 0 },
        300: { price: 14.99, bonus: 0 },
        680: { price: 24.99, bonus: 680 },    // COINS EM DOBRO
        1280: { price: 37.99, bonus: 1280 },  // COINS EM DOBRO
        3280: { price: 97.99, bonus: 3280 },  // COINS EM DOBRO
        6480: { price: 189.99, bonus: 0 },
      }
      return priceMap[diamondCount] || { price: 0, bonus: 0 }
    }

    // Free Fire (padrão)
    const priceMap: { [key: number]: { price: number; bonus: number } } = {
      100: { price: 6.0, bonus: 20 },
      310: { price: 10.99, bonus: 62 },
      520: { price: 14.9, bonus: 104 },
      1060: { price: 19.99, bonus: 1060 },   // DOBRO
      2180: { price: 24.8, bonus: 2180 },    // DOBRO
      5600: { price: 34.9, bonus: 5600 },    // DOBRO
      15600: { price: 87.8, bonus: 15600 },  // DOBRO
    }

    return priceMap[diamondCount] || { price: 0, bonus: 0 }
  }

  const getSpecialOfferPrice = (offer: string): number => {
    const priceMap: { [key: string]: number } = {
      // Free Fire
      "Assinatura Semanal": 14.99,
      "Assinatura Mensal": 44.99,
      "Passe Booyah Premium Plus": 11.99,
      "Passe de Nível": 44.99,
      // Delta Force
      "Black Hawk Down - Gênesis": 25.44,
      "Black Hawk Down - Reinvenção": 18.50,
      "Suprimentos de Maré": 13.99,
      "Suprimentos de Maré - Avançado": 12.50,
      // Haikyu
      "Especial de Recrutar Ultra I": 15.99,
      "Especial de Recrutar Ultra II": 25.50,
      "Especial de Recrutar Ultra III": 52.11,
      "Especial de Recrutar Ultra IV": 77.30,
    }
    return priceMap[offer] || 0
  }

  const getSpecialOfferBonus = (offer: string): number => {
    const bonusMap: { [key: string]: number } = {
      // Haikyu - Diamantes Estelares
      "Especial de Recrutar Ultra I": 200,
      "Especial de Recrutar Ultra II": 300,
      "Especial de Recrutar Ultra III": 500,
      "Especial de Recrutar Ultra IV": 500,
      // Delta Force - Coins
      "Black Hawk Down - Gênesis": 300,
      "Black Hawk Down - Reinvenção": 300,
      "Suprimentos de Maré": 300,
      "Suprimentos de Maré - Avançado": 300,
    }
    return bonusMap[offer] || 0
  }

  const [userData, setUserData] = useState<any>(null)
  const [avatarInfo, setAvatarInfo] = useState<any>(null)
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [couponCopied, setCouponCopied] = useState(false)
  const [generatedCoupon, setGeneratedCoupon] = useState("PROMO5OFF")

  // Função para buscar informações do avatar
  const fetchAvatarInfo = async (headPicId: number) => {
    try {
      const response = await fetch(`/api/get-avatar?headPicId=${headPicId}`)
      if (response.ok) {
        const avatarData = await response.json()
        setAvatarInfo(avatarData)
        return avatarData
      } else {
        return null
      }
    } catch (error) {
      return null
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!playerId.trim()) {
      setLoginError("Por favor, insira um ID de jogador válido.")
      return
    }

    setIsLoading(true)
    setLoginError("")

    // Login simplificado para Delta Force e Haikyu com loading ilusório
    if (selectedGame === 'deltaforce' || selectedGame === 'haikyu') {
      setShowIllusoryLoading(true)
      
      // Simular loading de 1.5 segundos
      setTimeout(() => {
        setIsLoggedIn(true)
        setUserData(null)
        setLoginError("")
        setIsLoading(false)
        setShowIllusoryLoading(false)
      }, 1500)
      return
    }

    // Login normal para Free Fire
    try {
      const apiUrl = `/api/game-data?uid=${playerId}`
      const response = await fetch(apiUrl)
      const data = await response.json()

      if (response.ok && data.success) {
        if (data.data && data.data.basicInfo && data.data.basicInfo.nickname) {
          if (data.data.basicInfo.nickname === "LOGADO" || response.status !== 200) {
            setIsLoggedIn(false)
            setLoginError("Login inválido. Verifique seu ID de jogador.")
          } else {
            setIsLoggedIn(true)
            setUserData(data.data.basicInfo)
            setLoginError("")
            localStorage.setItem('userData', JSON.stringify(data.data.basicInfo))
            
            if (data.data.basicInfo.headPic) {
              await fetchAvatarInfo(data.data.basicInfo.headPic)
            }
          }
        } else {
          setIsLoggedIn(false)
          setLoginError("Resposta inválida do servidor. Tente novamente.")
        }
      } else {
        setIsLoggedIn(false)
        const errorMessage = data?.error || "Erro ao verificar ID do jogador. Tente novamente."
        setLoginError(errorMessage)
      }
    } catch (error) {
      setIsLoggedIn(false)
      setLoginError("Erro de conexão. Verifique sua internet e tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }


  // Função para salvar lead do usuário
  const saveUserLead = (reason: string) => {
    const leadData = {
      playerId: playerId || "anonymous",
      nickname: userData?.nickname || "unknown",
      timestamp: new Date().toISOString(),
      reason: reason,
      utm: getUtmObject()
    }
    
    // Salvar no localStorage
    const existingLeads = JSON.parse(localStorage.getItem("user_leads") || "[]")
    existingLeads.push(leadData)
    localStorage.setItem("user_leads", JSON.stringify(existingLeads))
    
    // Marcar que o usuário já passou pelo processo
    localStorage.setItem("user_visited", "true")
    
    //console.log("Lead salvo:", leadData)
  }


  // Nova função para lidar com step 3
  // Função para reiniciar (simplificada)
  const restartQuestionnaire = () => {
    setShowLeadMessage(false)
    setTextAnswer("")
    setSelectedValue(null)
  }

  // Função para lidar com login social
  const handleSocialLogin = (platform: string) => {
    //console.log(`Tentativa de login com ${platform}`)
    setShowSocialError(true)
  }

  const handleValueSelect = (value: string) => {
    setSelectedValue(value)
    setSelectedRechargeValue(value)
    // Ir direto para a página de recarga
    setShowPurchasePage(true)
  }

  const handleRechargeValueSelect = (value: string) => {
    setSelectedRechargeValue(value)
    setSelectedSpecialOffer(null)
  }

  const handleSpecialOfferSelect = (offer: string) => {
    setSelectedSpecialOffer(offer)
    // Limpar valor de recarga quando selecionar oferta especial
    setSelectedRechargeValue(null)
  }

  const handleBuyNow = () => {
    if (!isLoggedIn) return

    // Obter parâmetros UTM
    const utmParams = getUtmObject()

    if (selectedRechargeValue) {
      const priceData = calculatePrice(selectedRechargeValue)
      const params = new URLSearchParams({
        type: "recharge",
        value: selectedRechargeValue,
        price: priceData.price.toString(),
        bonus: priceData.bonus.toString(),
        playerId: playerId,
        payment: "PIX",
        app: selectedGame === 'deltaforce' ? '100157' : selectedGame === 'haikyu' ? 'haikyu' : '100067'
      })

      // Adicionar parâmetros UTM individualmente
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        }
      })

      //console.log('[v0] UTM params being passed to checkout:', utmParams)
      //console.log('[v0] Final checkout URL:', `/checkout?${params.toString()}`)
      
      router.push(`/checkout?${params.toString()}`)
    } else if (selectedSpecialOffer) {
      const price = getSpecialOfferPrice(selectedSpecialOffer)
      const bonus = getSpecialOfferBonus(selectedSpecialOffer)
      const params = new URLSearchParams({
        type: "special",
        value: selectedSpecialOffer,
        price: price.toString(),
        bonus: bonus.toString(),
        playerId: playerId,
        payment: "PIX",
        app: selectedGame === 'deltaforce' ? '100157' : selectedGame === 'haikyu' ? 'haikyu' : '100067'
      })

      // Adicionar parâmetros UTM individualmente
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        }
      })

      //console.log('[v0] UTM params being passed to checkout:', utmParams)
      //console.log('[v0] Final checkout URL:', `/checkout?${params.toString()}`)

      router.push(`/checkout?${params.toString()}`)
    }
  }

  // Modal de cupom de desconto
  if (showCouponModal) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 relative border-4 border-red-500">
          {/* Banner */}
          <div className="relative p-3 pb-0">
            <img
              src="/images/quiznovo.png"
              alt="Banner do jogo"
              className="w-full h-20 object-cover rounded-xl"
            />
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 mb-4 border-2 border-red-200">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-red-600 mb-2">Parabéns! 🎉</h2>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  Você ganhou um <span className="font-bold text-red-600">cupom de 5% de desconto</span> para usar na sua recarga!
                </p>
                
                {/* Cupom */}
                <div className="bg-white border-2 border-dashed border-red-300 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Seu cupom de desconto:</p>
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <span className="font-mono text-lg font-bold text-red-600">{generatedCoupon}</span>
                    <button
                      onClick={() => copyToClipboard(generatedCoupon)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        couponCopied 
                          ? "bg-green-500 text-white" 
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      {couponCopied ? "✓ Copiado" : "Copiar"}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Cole este código no checkout para ganhar 5% de desconto adicional na sua recarga!
                </p>
              </div>

              <button
                onClick={() => {
                  if (couponCopied) {
                    setShowCouponModal(false)
                    setShowPurchasePage(true)
                  }
                }}
                disabled={!couponCopied}
                className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg ${
                  couponCopied
                    ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {couponCopied ? "Continuar para Recarga" : "Copie o cupom para continuar"}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="pb-4">
            <p className="text-center text-sm text-gray-500">© Garena Online. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    )
  }

  // Evitar problemas de hidratação - não renderizar até estar montado
  if (!mounted) {
    return null
  }

  if (showPurchasePage) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header Fixo */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 p-3 sm:p-4 safe-area-top">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10">
                <svg width="34" height="36" viewBox="0 0 34 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[34px] block md:hidden"><g><path d="M19.5397 0.10298L19.6326 0.022157L19.8982 0L19.7826 0.195385L19.5734 0.229753L19.3184 0.505834L19.1692 0.425641L19.1335 0.516787L18.8325 0.540581L18.8448 0.620774L19.1335 0.655772L18.8911 0.724761L18.8565 0.828244L18.7168 0.81641L18.7058 0.920145L18.4166 0.931098V1.00097L18.2308 1.04679L18.0569 1.24155L17.9295 1.1611C17.9295 1.1611 17.8947 1.1611 17.8714 1.28838C17.2684 1.64168 16.0247 2.32664 14.7703 3.01758C13.7365 3.58698 12.6953 4.16043 11.9993 4.55566C11.9567 4.58208 11.9112 4.61072 11.8625 4.64133C11.2738 5.0112 10.2255 5.66994 8.52449 6.21303C10.1314 5.87985 10.7558 5.59868 11.6469 5.19752C12.079 5.00297 12.5738 4.7802 13.2737 4.50958C15.4158 3.68083 17.7672 3.77273 17.7672 3.77273L17.478 3.94646L17.5003 4.24496L17.6626 4.26837L17.7791 4.29128L17.9871 4.15356L17.9991 4.25691L18.1848 4.29128L18.3465 4.25691L18.5783 4.18856L18.7643 4.23098L18.7396 4.04894L18.8973 4.09993L19.0023 4.21839L19.1335 4.04894L19.4478 4.13606L19.1458 4.14172L19.1804 4.25691L18.6473 4.26837L18.6819 4.34869L18.3115 4.32603L18.2422 4.3604C18.2422 4.3604 18.3005 4.44147 18.2191 4.45255C17.9295 4.55566 17.7731 4.74638 17.7731 4.74638C20.4134 3.64105 23.6109 5.57412 23.6109 5.57412L23.8187 5.62498L23.8546 5.93669L23.9404 6.00631H24.1149L23.9927 6.19528L24.1149 6.33313V6.55721L23.9058 6.5061L23.7495 6.33313L23.8365 6.22939L23.7323 6.09267H23.4195L23.2638 5.98869L23.1416 5.97094L22.8634 5.83258L22.6374 5.86821L22.4292 5.67673L21.4904 5.69435L21.5431 5.78096L22.0121 5.81546L22.0818 5.93669H22.551L22.7937 6.12641L23.107 6.09267L23.2809 6.17815L23.6279 6.28139L23.4023 6.36787C23.4023 6.36787 23.8811 7.1017 26.8589 7.8004C31.1329 8.80112 34 6.95516 34 6.95516C33.2703 7.88638 32.3836 8.16221 32.3836 8.16221L31.7406 8.23208L31.6014 8.33519L31.3065 8.42193L30.4385 8.88798L30.2122 9.04283L30.1948 9.16318L30.1085 9.26742L30.0737 9.09507H29.8121L29.5699 9.16318L29.604 9.25017L29.5519 9.47388H29.3773L29.4655 9.33691L29.3773 9.26742L29.2742 9.09507L29.1182 9.11169L28.8052 9.38765L28.6141 9.33691L28.4918 9.37078L28.3188 9.45714L28.1452 9.52588L27.9192 9.45714L27.6927 9.5605L27.537 9.45714L27.1897 9.42201L27.1721 9.30204H26.9637L26.8067 9.38765L26.5986 9.52588L25.9041 9.5605L26.5464 9.68211L26.7728 9.71572L26.9288 9.52588L27.0854 9.50901L27.242 9.5605L27.5717 9.6991L27.7804 9.68211L27.9363 9.57724L28.058 9.63012L28.2145 9.71572L28.3772 9.80208C28.3772 9.80208 27.3808 9.94006 26.1071 10.0101C27.358 10.078 28.5379 10.9065 28.5379 10.9065C28.5379 10.9065 27.9131 10.6542 25.5978 10.8143C23.4676 10.9631 22.2721 10.4309 21.0773 9.89913C20.129 9.47709 19.1813 9.05525 17.7672 8.97409C13.5286 8.72936 11.7362 11.2349 11.7362 11.2349L11.579 11.5807L11.2405 11.6057L11.206 11.8123L11.1366 11.8384L11.1189 11.9071L10.8933 11.9937L10.902 12.0973L11.1189 12.1224L11.0758 12.261L11.0059 12.4072L11.3276 12.9697L10.9362 12.6326L10.7801 12.5545L10.511 12.4428L10.4241 12.5373L10.3543 12.7278L10.2415 12.9002L10.0767 12.8482C10.0767 12.8482 10.1113 13.3052 9.65914 13.3919C9.48551 13.5728 9.6509 13.677 9.6509 13.677L9.87674 13.694V13.8851L9.96406 13.901C9.96406 13.901 9.91172 13.9611 9.87674 14.0911C10.0416 14.1163 10.1193 14.0047 10.1193 14.0047L10.224 14.03C10.224 14.03 9.97242 14.5573 9.33825 14.7641C9.43342 14.8671 9.53773 14.8765 9.53773 14.8765C9.53773 14.8765 8.84297 15.2818 8.62588 15.7473C8.49585 16.2138 8.7042 16.1794 8.7042 16.1794C8.7042 16.1794 8.50383 16.4036 8.4866 16.0837C8.28724 15.9987 8.19194 16.2219 8.19194 16.2219C8.19194 16.2219 8.18231 16.2737 8.27825 16.3003C8.07826 16.4643 8.08739 16.6787 8.08739 16.6787L8.28724 16.6961C8.28724 16.6961 8.37342 16.9034 8.19194 16.9034C8.00945 16.9034 8.00057 16.9987 8.00057 16.9987V17.0931L8.096 17.1629L7.87587 17.3489C7.87587 17.3489 7.66752 18.1319 7.82999 19.582C8.40891 24.4364 13.0651 24.2304 13.0651 24.2304C13.0651 24.2304 17.6517 24.5978 19.7597 20.916C23.0032 15.1179 18.0454 13.8972 18.0454 13.8972C18.0454 13.8972 14.3855 13.0235 13.1807 14.3585C12.1089 15.5457 13.5514 16.9578 13.5514 16.9578C13.5514 16.9578 14.4087 17.5568 14.0145 18.5701C13.3594 20.253 11.5828 19.8334 11.5828 19.8334C11.5828 19.8334 8.80191 19.1686 9.45117 16.7523C10.3581 13.3735 14.7559 12.8164 14.7559 12.8164C14.7559 12.8164 19.4232 11.9764 22.2846 13.8868C23.5404 14.7256 25.6555 13.9906 25.6555 13.9906C25.044 14.5972 23.964 14.8053 23.9527 14.807C23.9532 14.807 23.9557 14.8065 23.9602 14.8058C24.0877 14.7838 25.8036 14.4876 28.0874 14.5433C30.3032 14.5964 31.6661 12.5633 31.6661 12.5633C31.6661 12.5633 31.2639 13.5216 29.4074 14.6231C26.6483 16.2595 26.2915 16.8663 26.2915 16.8663C26.2915 16.8663 26.524 16.7404 27.323 16.3371C25.4002 17.9829 24.1496 19.823 24.1496 19.823L23.9527 19.8811L24.0795 19.9951L24.253 20.0642L24.1947 20.2029L23.9757 20.2253C23.9757 20.2253 23.9527 20.5479 24.1612 20.6409C23.7903 20.9279 23.4314 21.3074 23.4314 21.3074L23.6159 21.3879C23.6159 21.3879 23.8709 21.6289 23.5465 21.9177C23.2687 22.2166 23.2568 21.837 23.2568 21.837C23.2568 21.837 23.2454 22.3198 22.6085 22.6538C22.4812 22.6992 22.2727 22.6416 22.2727 22.6416L21.9595 22.9987C21.9595 22.9987 24.1612 22.838 26.1071 22.032C22.539 23.7813 20.5126 23.9765 20.5126 23.9765V24.0341L20.7904 24.1037C20.7904 24.1037 20.0723 24.5398 17.3621 24.7826C17.8246 24.9317 17.8947 24.9205 17.8947 24.9205C17.8947 24.9205 17.2572 25.1273 15.7178 25.23C16.3083 25.4379 16.898 25.5081 16.898 25.5081L12.3351 25.5421C8.82523 25.5069 1.68961 22.5415 3.50964 16.1181C5.45538 9.25017 14.1769 8.04375 14.1769 8.04375C14.1769 8.04375 9.96545 6.80094 6.18486 8.55928C2.3281 10.3553 0 9.31929 0 9.31929L1.67998 7.67337L1.07749 7.83464L2.22304 6.81038L2.3044 6.95969L3.86842 5.30346L3.99579 5.50048L4.11213 5.61466L4.1575 5.41789L4.05409 5.2458L4.54036 4.71781L4.48232 4.67135L4.85301 4.08419L5.13107 4.02666L5.98804 3.11721C5.98804 3.11721 5.46729 3.71646 5.13107 4.32603C4.96847 4.87756 4.63301 5.10757 4.63301 5.10757C4.63301 5.10757 4.65582 5.15453 4.71373 5.25688C5.00345 4.48705 6.61284 3.67001 6.61284 3.67001C6.61284 3.67001 6.26635 3.94647 5.89515 4.32603C6.43947 3.8426 10.2161 1.35762 10.2161 1.35762L10.3776 1.36908L10.3896 1.49509C10.3896 1.49509 8.32729 2.99031 7.34321 4.02666C8.21108 3.76254 9.20822 2.9212 9.20822 2.9212L9.2655 3.09481L9.56713 3.11721L9.67092 3.03778L9.94911 2.85246L10.053 2.78347L10.0884 2.58771L10.4583 2.60068L10.4933 2.69195H10.5864L10.7243 2.63505L10.7712 2.51948L10.6902 2.39296L10.7712 2.28922C10.7712 2.28922 10.8641 2.38125 10.9565 2.50865C11.2815 2.19707 12.6137 1.87491 12.6137 1.87491C12.6137 1.87491 12.5323 1.9901 12.4399 2.09359C16.0297 1.42611 19.0416 0.218171 19.0416 0.218171L19.2839 0.206337L19.3079 0.126396L19.5397 0.10298Z" fill="#E41E26"></path><path d="M19.514 4.13467L19.4478 4.13606L19.5067 4.1523L19.514 4.13467Z" fill="#E41E26"></path><path d="M19.514 4.13467L19.7597 4.13039L19.7939 4.07261L20.9528 3.9802L22.539 3.88818L21.1147 3.80735L20.9985 3.91222L20.8017 3.90001L20.7782 3.86615L20.6581 3.82422L20.4313 3.94646H20.2924L20.2575 3.73874L20.1424 3.86237L19.8058 4.00349L19.6672 4.0147L19.5982 3.99443L19.5612 4.02288L19.514 4.13467Z" fill="#E41E26"></path><path d="M8.3578 35.869H7.93021L7.8517 34.7418H7.83371C7.41505 35.6264 6.57613 35.9998 5.67711 35.9998C3.71231 35.9998 2.73438 34.4644 2.73438 32.7732C2.73438 31.0823 3.71231 29.5469 5.67711 29.5469C6.98666 29.5469 8.0523 30.2495 8.27969 31.6026H7.68549C7.60725 30.8913 6.86444 30.05 5.67711 30.05C4.02647 30.05 3.32831 31.42 3.32831 32.7732C3.32831 34.1263 4.02647 35.4961 5.67711 35.4961C7.05624 35.4961 7.8601 34.5337 7.83371 33.2242H5.71203V32.7207H8.3578V35.869Z" fill="#E41E26"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M9.34051 32.7649C9.39302 31.7155 10.1354 31.2646 11.1658 31.2646C11.9607 31.2646 12.8248 31.5074 12.8248 32.7043V35.0805C12.8248 35.2894 12.9297 35.41 13.1476 35.41C13.2092 35.41 13.2792 35.3928 13.3224 35.3753V35.8348C13.2003 35.861 13.113 35.8693 12.9645 35.8693C12.4057 35.8693 12.3186 35.5572 12.3186 35.0892H12.3008C11.9167 35.6702 11.5238 36.0001 10.6594 36.0001C9.82941 36.0001 9.14844 35.5923 9.14844 34.69C9.14844 33.5196 10.2157 33.4011 11.3209 33.2784C11.4029 33.2693 11.4853 33.2602 11.5672 33.2506C12.0213 33.1986 12.2746 33.1377 12.2746 32.6431C12.2746 31.9067 11.742 31.7244 11.0958 31.7244C10.4144 31.7244 9.90778 32.0364 9.89058 32.7649H9.34051ZM12.2743 33.424H12.2571C12.1871 33.5541 11.9427 33.5973 11.7938 33.6233C11.6408 33.6503 11.4817 33.6727 11.3227 33.695C10.5106 33.809 9.69824 33.9231 9.69824 34.6558C9.69824 35.202 10.187 35.5399 10.7027 35.5399C11.5409 35.5399 12.283 35.0112 12.2743 34.1351V33.424Z" fill="#E41E26"></path><path d="M14.4358 31.3945H13.9297V35.8694H14.48V33.4844C14.48 32.5563 15.1605 31.8285 16.1561 31.8806V31.334C15.3441 31.299 14.7329 31.7244 14.453 32.444H14.4358V31.3945Z" fill="#E41E26"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M16.8472 33.7795C16.8558 34.5776 17.2748 35.5401 18.3312 35.5401C19.1351 35.5401 19.5716 35.0716 19.7462 34.395H20.2963C20.0608 35.41 19.467 36.0001 18.3312 36.0001C16.8993 36.0001 16.2969 34.9069 16.2969 33.6324C16.2969 32.4524 16.8993 31.2646 18.3312 31.2646C19.7813 31.2646 20.3574 32.5219 20.3136 33.7795H16.8472ZM19.7635 33.3202C19.7375 32.4961 19.222 31.7245 18.3312 31.7245C17.432 31.7245 16.9341 32.5047 16.8472 33.3202H19.7635Z" fill="#E41E26"></path><path d="M21.5974 31.3945H21.0469V35.8693H21.5974V33.2595C21.6147 32.3833 22.1381 31.7244 23.0121 31.7244C23.9027 31.7244 24.1556 32.3051 24.1556 33.0768V35.8693H24.7059V32.9902C24.7059 31.9235 24.3218 31.2646 23.0557 31.2646C22.418 31.2646 21.8157 31.6287 21.6147 32.1667H21.5974V31.3945Z" fill="#E41E26"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M25.6921 32.7649C25.7443 31.7155 26.4869 31.2646 27.517 31.2646C28.3116 31.2646 29.1761 31.5074 29.1761 32.7043V35.0805C29.1761 35.2894 29.2808 35.41 29.4989 35.41C29.5602 35.41 29.6303 35.3928 29.6738 35.3753V35.8348C29.5513 35.861 29.464 35.8693 29.3155 35.8693C28.757 35.8693 28.67 35.5572 28.67 35.0892H28.6525C28.2677 35.6702 27.8749 36.0001 27.0102 36.0001C26.1811 36.0001 25.5 35.5923 25.5 34.69C25.5 33.5196 26.5669 33.4011 27.6719 33.2784C27.7538 33.2693 27.8362 33.2602 27.9181 33.2506C28.3729 33.1986 28.6263 33.1377 28.6263 32.6431C28.6263 31.9067 28.0933 31.7244 27.4471 31.7244C26.766 31.7244 26.2597 32.0364 26.2421 32.7649H25.6921ZM28.6261 33.424H28.6084C28.5391 33.5541 28.2944 33.5973 28.146 33.6233C27.9929 33.6503 27.8336 33.6727 27.6744 33.695C26.8619 33.809 26.0498 33.923 26.0498 34.6558C26.0498 35.202 26.5387 35.5399 27.0539 35.5399C27.8924 35.5399 28.6345 35.0112 28.6261 34.1351V33.424Z" fill="#E41E26"></path></g></svg>
              </div>
              <div className="flex items-center gap-2">
                
                <div className="w-px h-8 bg-gray-300"></div>
                <div><h1 className="text-xs font-medium text-gray-800 max-md:max-w-24 md:text-base/5">Canal Oficial de</h1><p className="text-xs font-medium text-gray-800 max-md:max-w-24 md:text-base/5">Recarga</p></div>
              </div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10">
              <img
                src={currentConfig.userIcon}
                alt={`${currentConfig.name} Icon`}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Conteúdo Principal com padding para header e footer */}
        <div className="flex-1 pt-20 pb-32 overflow-y-auto">

        {/* Hero Banner com Carousel */}
        <div className="relative overflow-hidden block leading-none carousel-container">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
          >
            {banners.map((banner, index) => (
              <div key={index} className="w-full flex-shrink-0 relative block">
                <img
                  src={banner.src}
                  alt={banner.alt}
                  className="w-full h-auto object-cover block align-top"
                  style={{ verticalAlign: 'top' }}
                />
              </div>
            ))}
          </div>
          
          {/* Botões de navegação */}
          <button
            onClick={() => setCurrentBannerIndex((prev) => prev === 0 ? banners.length - 1 : prev - 1)}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 sm:p-2 rounded-full transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <button
            onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 sm:p-2 rounded-full transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* Navigation dots - Carousel */}
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                  index === currentBannerIndex ? 'bg-red-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Background decorativo abaixo do carousel */}
        <div className="relative bg-[#EFEFEF]">
          <div className="absolute inset-0 bg-[#EFEFEF] rtl:-scale-x-100 dark:bg-[linear-gradient(180deg,#16162B_0%,#242443_76.1%,#333356_100%)]" role="none">
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:opacity-[0.06] md:bg-contain" role="none" style={{ backgroundImage: 'url("/images/abaixodobannercarousel.png")' }}></div>
          </div>
          <div className="pointer-events-none absolute inset-0 flex rtl:-scale-x-100 rtl:flex-row-reverse" role="none">
            <div className="h-[7px] flex-1 bg-[#F2B13E] dark:bg-[#2D337D]/50" role="none"></div>
            <svg width="390" height="27" viewBox="0 0 390 27" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[27px] dark:hidden md:hidden" preserveAspectRatio="xMidYMin" role="none">
              <path d="M390 0H0V7H285L301 27H390V0Z" fill="url(#paint0_linear_2330_34259)" role="none"></path>
              <mask id="mask0_2330_34259" maskUnits="userSpaceOnUse" x="0" y="0" width="390" height="27" role="none" style={{ maskType: 'alpha' }}>
                <path d="M390 0H0V7H285L301 27H390V0Z" fill="url(#paint1_linear_2330_34259)" role="none"></path>
              </mask>
              <g mask="url(#mask0_2330_34259)" role="none">
                <rect x="-15.0254" y="72.4863" width="110.997" height="3" transform="rotate(-45 -15.0254 72.4863)" fill="url(#paint2_linear_2330_34259)" role="none"></rect>
                <rect opacity="0.5" x="232.053" y="58.1582" width="110.997" height="25.9753" transform="rotate(-47 232.053 58.1582)" fill="url(#paint3_linear_2330_34259)" role="none"></rect>
                <rect opacity="0.3" x="298.977" y="69.4863" width="110.997" height="6.3044" transform="rotate(-45 298.977 69.4863)" fill="url(#paint4_linear_2330_34259)" role="none"></rect>
                <path opacity="0.5" d="M192.334 72.0098L268.034 -9.16811L278.223 -7.40131L202.523 73.7766L192.334 72.0098Z" fill="url(#paint5_linear_2330_34259)" role="none"></path>
                <rect opacity="0.15" x="-21" y="123.275" width="179.995" height="4.38032" transform="rotate(-45 -21 123.275)" fill="url(#paint6_linear_2330_34259)" role="none"></rect>
              </g>
              <defs role="none">
                <linearGradient id="paint0_linear_2330_34259" x1="-9" y1="7.61906" x2="387.828" y2="41.0361" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#F2B13E" role="none"></stop>
                  <stop offset="1" stopColor="#FDD373" stopOpacity="0.63" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint1_linear_2330_34259" x1="27" y1="15.2381" x2="388.472" y2="38.7377" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#F3A00C" role="none"></stop>
                  <stop offset="1" stopColor="#FFBB21" stopOpacity="0.76" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint2_linear_2330_34259" x1="9.0067" y1="75.3242" x2="64.1695" y2="74.4301" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#DB910B" stopOpacity="0" role="none"></stop>
                  <stop offset="1" stopColor="#F09F0B" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint3_linear_2330_34259" x1="295.701" y1="78.6918" x2="318.228" y2="69.5067" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                  <stop offset="1" stopColor="#F79F00" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint4_linear_2330_34259" x1="323.009" y1="75.4501" x2="378.183" y2="75.0245" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                  <stop offset="1" stopColor="#F79F00" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint5_linear_2330_34259" x1="218.794" y1="56.0898" x2="255.761" y2="15.1365" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                  <stop offset="1" stopColor="#F79F00" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint6_linear_2330_34259" x1="17.9709" y1="127.419" x2="83.65" y2="126.721" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#F79F00" role="none"></stop>
                  <stop offset="1" stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                </linearGradient>
              </defs>
            </svg>
            <svg width="1024" height="27" viewBox="0 0 1024 27" fill="none" xmlns="http://www.w3.org/2000/svg" className="hidden h-[27px] md:block dark:md:hidden" preserveAspectRatio="xMidYMin" role="none">
              <path d="M1024 0H0V7H516L532 27H1024V0Z" fill="url(#paint0_linear_2339_34301)" role="none"></path>
              <mask id="mask0_2339_34301" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="27" role="none" style={{ maskType: 'alpha' }}>
                <path d="M1024 0H0V7H516L532 27H1024V0Z" fill="url(#paint1_linear_2339_34301)" role="none"></path>
              </mask>
              <g mask="url(#mask0_2339_34301)" role="none">
                <rect x="215.977" y="72.4844" width="110.997" height="3" transform="rotate(-45 215.977 72.4844)" fill="url(#paint2_linear_2339_34301)" role="none"></rect>
                <rect opacity="0.5" x="463.055" y="58.1562" width="110.997" height="25.9753" transform="rotate(-47 463.055 58.1562)" fill="url(#paint3_linear_2339_34301)" role="none"></rect>
                <rect opacity="0.5" x="561.977" y="69.4844" width="110.997" height="3" transform="rotate(-45 561.977 69.4844)" fill="url(#paint4_linear_2339_34301)" role="none"></rect>
                <path opacity="0.5" d="M423.336 72.0078L499.036 -9.17006L509.225 -7.40327L433.525 73.7746L423.336 72.0078Z" fill="url(#paint5_linear_2339_34301)" role="none"></path>
                <rect opacity="0.15" x="210" y="123.273" width="179.995" height="4.38032" transform="rotate(-45 210 123.273)" fill="url(#paint6_linear_2339_34301)" role="none"></rect>
              </g>
              <defs role="none">
                <linearGradient id="paint0_linear_2339_34301" x1="222" y1="7.61902" x2="618.827" y2="41.0361" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#F2B13E" role="none"></stop>
                  <stop offset="1" stopColor="#FDD373" stopOpacity="0.63" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint1_linear_2339_34301" x1="258.001" y1="15.2381" x2="619.473" y2="38.7377" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#F3A00C" role="none"></stop>
                  <stop offset="1" stopColor="#FFBB21" stopOpacity="0.76" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint2_linear_2339_34301" x1="240.009" y1="75.3223" x2="295.171" y2="74.4282" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#DB910B" stopOpacity="0" role="none"></stop>
                  <stop offset="1" stopColor="#F09F0B" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint3_linear_2339_34301" x1="526.703" y1="78.6898" x2="549.23" y2="69.5047" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                  <stop offset="1" stopColor="#F79F00" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint4_linear_2339_34301" x1="586.009" y1="72.3223" x2="641.171" y2="71.4282" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                  <stop offset="1" stopColor="#F79F00" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint5_linear_2339_34301" x1="449.796" y1="56.0878" x2="486.763" y2="15.1345" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                  <stop offset="1" stopColor="#F79F00" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint6_linear_2339_34301" x1="248.971" y1="127.417" x2="314.65" y2="126.719" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#F79F00" role="none"></stop>
                  <stop offset="1" stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="h-[27px] flex-1 bg-[#FDD373]/[0.63] dark:bg-[#3C3E65]/50" role="none"></div>
          </div>
          <div className="bg-white">
            <div className="rounded-t-[14px] bg-white lg:rounded-none"></div>
          </div>
        </div>

        {/* Decorative SVG Background */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="relative bg-[#EFEFEF]">
            <div className="absolute inset-0 bg-[#EFEFEF] rtl:-scale-x-100 dark:bg-[linear-gradient(180deg,#16162B_0%,#242443_76.1%,#333356_100%)]" role="none">
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:opacity-[0.06] md:bg-contain" role="none"></div>
            </div>
            <div className="pointer-events-none absolute inset-0 flex rtl:-scale-x-100 rtl:flex-row-reverse" role="none">
              <div className="h-[7px] flex-1 bg-[#F2B13E] dark:bg-[#2D337D]/50" role="none"></div>
              <svg width="390" height="27" viewBox="0 0 390 27" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[27px] dark:hidden md:hidden" preserveAspectRatio="xMidYMin" role="none">
                <path d="M390 0H0V7H285L301 27H390V0Z" fill="url(#paint0_linear_2330_34259)" role="none"></path>
                <mask id="mask0_2330_34259" maskUnits="userSpaceOnUse" x="0" y="0" width="390" height="27" role="none">
                  <path d="M390 0H0V7H285L301 27H390V0Z" fill="url(#paint1_linear_2330_34259)" role="none"></path>
                </mask>
                <g mask="url(#mask0_2330_34259)" role="none">
                  <rect x="-15.0254" y="72.4863" width="110.997" height="3" transform="rotate(-45 -15.0254 72.4863)" fill="url(#paint2_linear_2330_34259)" role="none"></rect>
                  <rect opacity="0.5" x="232.053" y="58.1582" width="110.997" height="25.9753" transform="rotate(-47 232.053 58.1582)" fill="url(#paint3_linear_2330_34259)" role="none"></rect>
                  <rect opacity="0.3" x="298.977" y="69.4863" width="110.997" height="6.3044" transform="rotate(-45 298.977 69.4863)" fill="url(#paint4_linear_2330_34259)" role="none"></rect>
                  <path opacity="0.5" d="M192.334 72.0098L268.034 -9.16811L278.223 -7.40131L202.523 73.7766L192.334 72.0098Z" fill="url(#paint5_linear_2330_34259)" role="none"></path>
                  <rect opacity="0.15" x="-21" y="123.275" width="179.995" height="4.38032" transform="rotate(-45 -21 123.275)" fill="url(#paint6_linear_2330_34259)" role="none"></rect>
                </g>
                <defs role="none">
                  <linearGradient id="paint0_linear_2330_34259" x1="-9" y1="7.61906" x2="387.828" y2="41.0361" gradientUnits="userSpaceOnUse" role="none">
                    <stop stopColor="#F2B13E" role="none"></stop>
                    <stop offset="1" stopColor="#FDD373" stopOpacity="0.63" role="none"></stop>
                  </linearGradient>
                  <linearGradient id="paint1_linear_2330_34259" x1="27" y1="15.2381" x2="388.472" y2="38.7377" gradientUnits="userSpaceOnUse" role="none">
                    <stop stopColor="#F3A00C" role="none"></stop>
                    <stop offset="1" stopColor="#FFBB21" stopOpacity="0.76" role="none"></stop>
                  </linearGradient>
                  <linearGradient id="paint2_linear_2330_34259" x1="9.0067" y1="75.3242" x2="64.1695" y2="74.4301" gradientUnits="userSpaceOnUse" role="none">
                    <stop stopColor="#DB910B" stopOpacity="0" role="none"></stop>
                    <stop offset="1" stopColor="#F09F0B" role="none"></stop>
                  </linearGradient>
                  <linearGradient id="paint3_linear_2330_34259" x1="295.701" y1="78.6918" x2="318.228" y2="69.5067" gradientUnits="userSpaceOnUse" role="none">
                    <stop stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                    <stop offset="1" stopColor="#F79F00" role="none"></stop>
                  </linearGradient>
                  <linearGradient id="paint4_linear_2330_34259" x1="323.009" y1="75.4501" x2="378.183" y2="75.0245" gradientUnits="userSpaceOnUse" role="none">
                    <stop stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                    <stop offset="1" stopColor="#F79F00" role="none"></stop>
                  </linearGradient>
                  <linearGradient id="paint5_linear_2330_34259" x1="218.794" y1="56.0898" x2="255.761" y2="15.1365" gradientUnits="userSpaceOnUse" role="none">
                    <stop stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                    <stop offset="1" stopColor="#F79F00" role="none"></stop>
                  </linearGradient>
                  <linearGradient id="paint6_linear_2330_34259" x1="17.9709" y1="127.419" x2="83.65" y2="126.721" gradientUnits="userSpaceOnUse" role="none">
                    <stop stopColor="#F79F00" role="none"></stop>
                    <stop offset="1" stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                  </linearGradient>
                </defs>
              </svg>
              <div className="h-[27px] flex-1 bg-[#FDD373]/[0.63] dark:bg-[#3C3E65]/50" role="none"></div>
            </div>
          </div>
        </div>

        {/* Game Selection Section */}
        <div className="relative mx-auto flex max-w-5xl flex-col px-4 sm:px-[22px] pb-3 sm:pb-[14px] pt-4 sm:pt-5 md:px-8 md:pb-4 md:pt-[27px]">
          <h2 className="relative mb-3 sm:mb-4 text-base sm:text-lg font-bold text-gray-800 md:mb-5 md:text-xl">
            Seleção de jogos
          </h2>
          <div className="grid grid-cols-4 gap-3 sm:gap-x-[22px] sm:gap-y-4 sm:grid-cols-6 lg:grid-cols-8">
            <div
              className="cursor-pointer outline-none group"
              role="radio"
              aria-checked={selectedGame === 'freefire'}
              data-state={selectedGame === 'freefire' ? 'checked' : 'unchecked'}
              tabIndex={0}
              onClick={() => {
                setSelectedGame('freefire')
                setIsLoggedIn(false)
                setPlayerId("")
                setUserData(null)
                navigateToGame('100067')
              }}
            >
              <div className="mx-auto max-w-[60px] sm:max-w-[70px] md:max-w-[105px]">
                <div className="mb-1 px-[2px] sm:px-[3px] md:mb-2 md:px-2">
                  <div className="relative">
                    <div className={`relative overflow-hidden rounded-[25%] border-2 sm:border-[3px] md:border-4 transition-colors ${
                      selectedGame === 'freefire' ? 'border-destructive' : 'border-gray-300'
                    }`}>
                      <div className="relative pt-[100%]">
                        <img
                          alt="Free Fire"
                          data-ai-hint="game icon"
                          loading="lazy"
                          decoding="async"
                          className="pointer-events-none absolute inset-0 h-full w-full bg-white object-cover"
                          sizes="(max-width: 640px) 60px, (max-width: 768px) 70px, 105px"
                          src="/images/profile-icon.webp"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center text-[10px] sm:text-xs font-medium text-gray-700 md:text-sm">Free Fire</div>
              </div>
            </div>

            <div
              className="cursor-pointer outline-none group"
              role="radio"
              aria-checked={selectedGame === 'deltaforce'}
              data-state={selectedGame === 'deltaforce' ? 'checked' : 'unchecked'}
              tabIndex={0}
              onClick={() => {
                setSelectedGame('deltaforce')
                setIsLoggedIn(false)
                setPlayerId("")
                setUserData(null)
                navigateToGame('100157')
              }}
            >
              <div className="mx-auto max-w-[60px] sm:max-w-[70px] md:max-w-[105px]">
                <div className="mb-1 px-[2px] sm:px-[3px] md:mb-2 md:px-2">
                  <div className="relative">
                    <div className={`relative overflow-hidden rounded-[25%] border-2 sm:border-[3px] md:border-4 transition-colors ${
                      selectedGame === 'deltaforce' ? 'border-destructive' : 'border-gray-300'
                    }`}>
                      <div className="relative pt-[100%]">
                        <img
                          alt="Delta Force"
                          data-ai-hint="game icon"
                          loading="lazy"
                          decoding="async"
                          className="pointer-events-none absolute inset-0 h-full w-full bg-white object-cover"
                          sizes="(max-width: 640px) 60px, (max-width: 768px) 70px, 105px"
                          src="/images/delta-force-icon.webp"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center text-[10px] sm:text-xs font-medium text-gray-700 md:text-sm">
                  Delta Force
                </div>
              </div>
            </div>

            <div
              className="cursor-pointer outline-none group"
              role="radio"
              aria-checked={selectedGame === 'haikyu'}
              data-state={selectedGame === 'haikyu' ? 'checked' : 'unchecked'}
              tabIndex={0}
              onClick={() => {
                setSelectedGame('haikyu')
                setIsLoggedIn(false)
                setPlayerId("")
                setUserData(null)
                navigateToGame('100153')
              }}
            >
              <div className="mx-auto max-w-[60px] sm:max-w-[70px] md:max-w-[105px]">
                <div className="mb-1 px-[2px] sm:px-[3px] md:mb-2 md:px-2">
                  <div className="relative">
                    <div className={`relative overflow-hidden rounded-[25%] border-2 sm:border-[3px] md:border-4 transition-colors ${
                      selectedGame === 'haikyu' ? 'border-destructive' : 'border-gray-300'
                    }`}>
                      <div className="relative pt-[100%]">
                        <img
                          alt="HAIKYU!! FLY HIGH"
                          data-ai-hint="game icon"
                          loading="lazy"
                          decoding="async"
                          className="pointer-events-none absolute inset-0 h-full w-full bg-white object-cover"
                          sizes="(max-width: 640px) 60px, (max-width: 768px) 70px, 105px"
                          src="/images/HAIKIU FLY HIGH.png"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center text-[10px] sm:text-xs font-medium text-gray-700 md:text-sm whitespace-pre-line">
                  {"HAIKYU!!\nFLY HIGH"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Fixo */}
        <div className="relative mx-auto max-w-5xl px-4 sm:px-[22px] md:px-8 pb-4 sm:pb-6">
          <div className="relative overflow-hidden rounded-t-xl h-40">
            <div 
              className="absolute h-full w-full rounded-t-lg bg-cover bg-center lg:rounded-lg" 
              style={{ backgroundImage: `url("${currentConfig.banner}")` }}
            ></div>
            <div className="relative flex items-center p-4 lg:p-6">
              <img 
                alt={`${currentConfig.name} Icon`}
                data-ai-hint="game icon" 
                loading="lazy" 
                width="72" 
                height="72" 
                decoding="async" 
                data-nimg="1" 
                className="h-11 w-11 lg:h-[72px] lg:w-[72px]" 
                src={currentConfig.icon}
                style={{ color: "transparent" }}
              />
              <div className="ms-3 flex flex-col items-start lg:ms-5">
                <div className="mb-1 text-base/none font-bold text-white lg:text-2xl/none">{currentConfig.name}</div>
                <div className="flex items-center rounded border border-white/50 bg-black/[0.65] px-1.5 py-[5px] text-xs/none font-medium text-white lg:text-sm/none">
                  <svg width="1em" height="1em" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]">
                    <path d="M54.125 34.1211C55.2966 32.9495 55.2966 31.05 54.125 29.8784C52.9534 28.7069 51.0539 28.7069 49.8823 29.8784L38.0037 41.7571L32.125 35.8784C30.9534 34.7069 29.0539 34.7069 27.8823 35.8784C26.7108 37.05 26.7108 38.9495 27.8823 40.1211L35.8823 48.1211C37.0539 49.2926 38.9534 49.2926 40.125 48.1211L54.125 34.1211Z" fill="currentColor"></path>
                    <path fillRule="evenodd" clipRule="evenodd" d="M43.4187 3.4715C41.2965 2.28554 38.711 2.28554 36.5889 3.4715L8.07673 19.4055C6.19794 20.4555 4.97252 22.4636 5.02506 24.7075C5.36979 39.43 10.1986 63.724 37.0183 76.9041C38.8951 77.8264 41.1125 77.8264 42.9893 76.9041C69.809 63.724 74.6377 39.43 74.9825 24.7075C75.035 22.4636 73.8096 20.4555 71.9308 19.4055L43.4187 3.4715ZM39.5159 8.7091C39.8191 8.53968 40.1885 8.53968 40.4916 8.7091L68.9826 24.6313C68.6493 38.3453 64.2154 59.7875 40.343 71.5192C40.135 71.6214 39.8725 71.6214 39.6646 71.5192C15.7921 59.7875 11.3583 38.3453 11.025 24.6313L39.5159 8.7091Z" fill="currentColor"></path>
                  </svg>
                  {" "}Pagamento 100% Seguro
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Item Grátis Section - Apenas para Free Fire */}
        {selectedGame === 'freefire' && (
          <div className="relative mx-auto max-w-5xl px-4 sm:px-[22px] md:px-8 pb-4 sm:pb-6">
            
            <div className="relative mb-4 md:mb-6 md:max-w-[464px] lg:mb-[28px]">
            <img src="/images/fundopgtoseguro.png" alt="Pagamento Seguro" className="absolute inset-0 w-full h-full object-cover object-center payment-secure-img" />
              <div 
                className="absolute h-full w-full rounded-md bg-gradient-to-r imgItemGratis"
              ></div>
              
              <div className="relative flex h-full w-full justify-between px-[18px] py-4">
                <div className="flex flex-col items-start justify-center">
                  
                  <div className="mb-0.5 text-base/none font-bold text-gray-800">Item Grátis</div>
                  <div className="mb-3 text-xs text-gray-600">Resgate aqui seus itens exclusivos grátis</div>
                  <button 
                    onClick={() => setShowFreeItemModal(true)}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90 py-2 h-7 px-3 text-xs font-medium"
                  >
                    Resgatar
                  </button>
                  
                </div>
                <button 
                  onClick={() => setShowFreeItemModal(true)}
                  className="flex flex-col items-center justify-center"
                >
                  <div className="mb-2 flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <img 
                      alt="Pacote de Armas Gabarola" 
                      loading="lazy" 
                      width="60" 
                      height="60" 
                      decoding="async" 
                      className="pointer-events-none h-full w-full object-cover" 
                      src="/images/itemgratisNovo.png"
                    />
                  </div>
                  <div className="flex items-center text-xs">
                    <div className="max-w-20 truncate font-medium text-gray-700">Pacote de Armas Gabarola</div>
                    <svg width="1em" height="1em" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#recharge_clip0_489_1601)">
                        <path d="M4.8999 5.39848C4.89981 4.44579 5.67209 3.67344 6.62478 3.67344H7.37471C8.33038 3.67344 9.09977 4.45392 9.09971 5.40371C9.09967 6.05546 8.73195 6.65677 8.14619 6.94967L7.57416 7.23571C7.49793 7.27382 7.44978 7.35173 7.44978 7.43695V7.49844C7.44978 7.78839 7.21473 8.02344 6.92478 8.02344C6.63483 8.02344 6.39978 7.78839 6.39978 7.49844V7.43695C6.39978 6.95403 6.67262 6.51255 7.10456 6.29657L7.6766 6.01053C7.90385 5.8969 8.0497 5.66087 8.04971 5.40365C8.04973 5.0279 7.74459 4.72344 7.37471 4.72344H6.62478C6.25203 4.72344 5.94987 5.02563 5.9499 5.39838C5.94993 5.68833 5.7149 5.9234 5.42495 5.92343C5.135 5.92346 4.89993 5.68843 4.8999 5.39848Z" fill="currentColor"></path>
                        <path d="M6.9999 10.1484C7.3865 10.1484 7.6999 9.83504 7.6999 9.44844C7.6999 9.06184 7.3865 8.74844 6.9999 8.74844C6.6133 8.74844 6.2999 9.06184 6.2999 9.44844C6.2999 9.83504 6.6133 10.1484 6.9999 10.1484Z" fill="currentColor"></path>
                        <path fillRule="evenodd" clipRule="evenodd" d="M0.524902 6.99844C0.524902 3.42239 3.42386 0.523438 6.9999 0.523438C10.5759 0.523438 13.4749 3.42239 13.4749 6.99844C13.4749 10.5745 10.5759 13.4734 6.9999 13.4734C3.42386 13.4734 0.524902 10.5745 0.524902 6.99844ZM6.9999 1.57344C4.00376 1.57344 1.5749 4.00229 1.5749 6.99844C1.5749 9.99458 4.00376 12.4234 6.9999 12.4234C9.99605 12.4234 12.4249 9.99458 12.4249 6.99844C12.4249 4.00229 9.99605 1.57344 6.9999 1.57344Z" fill="currentColor"></path>
                      </g>
                      <defs>
                        <clipPath id="recharge_clip0_489_1601">
                          <rect width="14" height="14" fill="currentColor"></rect>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Eventos especiais Section - Apenas Free Fire */}
        {selectedGame === 'freefire' && (
          <div className="relative mx-auto max-w-5xl px-4 sm:px-[22px] md:px-8 pb-4 sm:pb-6">
            <div className="flex flex-col gap-6">
              <div>
                <div className="mb-3 text-lg font-bold text-gray-800 md:text-xl">Eventos especiais</div>
                <div className="relative grid gap-4 md:grid-cols-2">
                  <a href="" >
                    <div className="relative mb-3 w-full pt-[28.048%]">
                      <img 
                        className="pointer-events-none absolute inset-0 block h-full w-full rounded-md object-cover" 
                        src="/images/eventosEspeciais.png"
                        alt="Eventos Especiais"
                      />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium md:text-base">
                        Rode ou compre diretamente? Um evento exclusivo está aqui no Recarga Jogo!
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Section */}
        <div className="relative mx-auto max-w-5xl px-4 sm:px-[22px] md:px-8 pb-4 sm:pb-6">
          <div id="login-section" className="group md:max-w-[464px]">
            <div className="mb-2 sm:mb-3 flex items-center justify-between text-base sm:text-lg text-gray-800 md:text-xl">
              <div className="flex items-center gap-2">
                <div className="grid items-center">
                  <svg
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`col-start-1 row-start-1 text-xl sm:text-2xl ${isLoggedIn ? "text-red-500" : "text-destructive"}`}
                  >
                    <path
                      d="M0 3C0 1.34315 1.34315 0 3 0H21C22.6569 0 24 1.34315 24 3V15.7574C24 16.553 23.6839 17.3161 23.1213 17.8787L17.8787 23.1213C17.3161 23.6839 16.553 24 15.7574 24H3C1.34315 24 0 22.6569 0 21V3Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                  <div className="col-start-1 row-start-1 text-center text-sm sm:text-base font-bold text-white">
                    {isLoggedIn ? "✓" : "1"}
                  </div>
                </div>
                <span className="font-bold ">Login</span>

              </div>
              {isLoggedIn && (
                <button
                  onClick={() => {
                    setIsLoggedIn(false)
                    setUserData(null)
                    setAvatarInfo(null)
                    setPlayerId("")
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <svg width="1em" height="1em" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M53.048 11.8069C51.8367 10.6764 49.9383 10.7418 48.8078 11.953C47.6773 13.1643 47.7428 15.0626 48.954 16.1932L58.3898 25H14.0007C12.3439 25 11.0007 26.3432 11.0007 28C11.0007 29.6569 12.3439 31 14.0007 31H66.0007C67.233 31 68.3399 30.2465 68.7917 29.1001C69.2436 27.9538 68.9485 26.6476 68.0477 25.8069L53.048 11.8069ZM26.9539 68.1932C28.1652 69.3237 30.0636 69.2582 31.1941 68.0469C32.3245 66.8356 32.259 64.9373 31.0477 63.8068L21.6114 55H66.0001C67.657 55 69.0001 53.6569 69.0001 52C69.0001 50.3432 67.657 49 66.0001 49H14.0001C12.7679 49 11.6609 49.7535 11.2091 50.8999C10.7572 52.0464 11.0524 53.3525 11.9532 54.1932L26.9539 68.1932Z" fill="currentColor"></path>
                  </svg>
                  Sair
                </button>
              )}
            </div>
            <div
              className="relative p-3 sm:p-4 border rounded-md transition-all bg-[#f4f4f4] border-gray-200"
            >
              {isLoggedIn && (
                <div className="mb-3 sm:mb-4">
                  <div className="relative flex items-center rounded-md p-3 bg-[#f4f4f4]">
                    <div className="me-3 h-9 w-9 shrink-0 overflow-hidden rounded-full">
                      <img 
                        alt={`${currentConfig.name} Icon`}
                        data-ai-hint="game icon" 
                        loading="lazy" 
                        width="36" 
                        height="36" 
                        decoding="async" 
                        data-nimg="1" 
                        className="block h-full w-full object-contain" 
                        src={currentConfig.icon}
                        style={{ color: "transparent" }}
                      />
                    </div>
                    <div className="flex-1 text-sm/none text-gray-800">
                      {userData && userData.nickname ? (
                        <div>
                          <div className="font-medium">Usuário: {userData.nickname}</div>
                          <div className="text-xs text-gray-600 mt-1">ID do jogador: {userData.accountId || playerId}</div>
                        </div>
                      ) : (
                        <div>ID do jogador: {playerId}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

{!isLoggedIn && (
                <form className="mb-3 sm:mb-4" onSubmit={handleLogin}>
                  <label
                    className="mb-2 flex items-center gap-1 text-sm sm:text-[15px] font-medium text-gray-800"
                    htmlFor="player-id"
                  >
                    ID do jogador
                    <button
                      type="button"
                      onClick={() => setShowTutorialModal(true)}
                      className="rounded-full text-sm outline-current transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2"
                    >
                      <svg width="1em" height="1em" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_489_1601)">
                          <path
                            d="M4.8999 5.39848C4.89981 4.44579 5.67209 3.67344 6.62478 3.67344H7.37471C8.33038 3.67344 9.09977 4.45392 9.09971 5.40371C9.09967 6.05546 8.73195 6.65677 8.14619 6.94967L7.57416 7.23571C7.49793 7.27382 7.44978 7.35173 7.44978 7.43695V7.49844C7.44978 7.78839 7.21473 8.02344 6.92478 8.02344C6.63483 8.02344 6.39978 7.78839 6.39978 7.49844V7.43695C6.39978 6.95403 6.67262 6.51255 7.10456 6.29657L7.6766 6.01053C7.90385 5.8969 8.0497 5.66087 8.04971 5.40365C8.04973 5.0279 7.74459 4.72344 7.37471 4.72344H6.62478C6.25203 4.72344 5.94987 5.02563 5.9499 5.39838C5.94993 5.68833 5.7149 5.9234 5.42495 5.92343C5.135 5.92346 4.89993 5.68843 4.8999 5.39848Z"
                            fill="currentColor"
                          ></path>
                          <path
                            d="M6.9999 10.1484C7.3865 10.1484 7.6999 9.83504 7.6999 9.44844C7.6999 9.06184 7.3865 8.74844 6.9999 8.74844C6.6133 8.74844 6.2999 9.06184 6.2999 9.44844C6.2999 9.83504 6.6133 10.1484 6.9999 10.1484Z"
                            fill="currentColor"
                          ></path>
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M0.524902 6.99844C0.524902 3.42239 3.42386 0.523438 6.9999 0.523438C10.5759 0.523438 13.4749 3.42239 13.4749 6.99844C13.4749 10.5745 10.5759 13.4734 6.9999 13.4734C3.42386 13.4734 0.524902 10.5745 0.524902 6.99844ZM6.9999 1.57344C4.00376 1.57344 1.5749 4.00229 1.5749 6.99844C1.5749 9.99458 4.00376 12.4234 6.9999 12.4234C9.99605 12.4234 12.4249 9.99458 12.4249 6.99844C12.4249 4.00229 9.99605 1.57344 6.9999 1.57344Z"
                            fill="currentColor"
                          ></path>
                        </g>
                        <defs>
                          <clipPath id="clip0_489_1601">
                            <rect width="14" height="14" fill="currentColor"></rect>
                          </clipPath>
                        </defs>
                      </svg>
                    </button>
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded border px-2.5 sm:px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 transition-all border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      id="player-id"
                      name="player-id"
                      placeholder="Insira o ID de jogador aqui"
                      type="text"
                      autoComplete="off"
                      value={playerId}
                      onChange={(e) => setPlayerId(e.target.value)}
                    />
                    <button
                      className={`rounded px-3 sm:px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                        isLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600 focus:ring-red-500"
                      }`}
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Carregando..." : "Login"}
                    </button>
                  </div>
                </form>
              )}

              {/* Div de erro de login */}
              {loginError && (
                <div className="mb-3 sm:mb-4 p-3 bg-red-50 border border-red-300 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 18L18 6M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-red-800 font-medium text-xs sm:text-sm">{loginError}</p>
                  </div>
                </div>
              )}

              {/* Botões de login social */}
              {!isLoggedIn && (
                <div className="flex items-center gap-4 text-xs text-gray-500 md:text-sm">
                  <span className="me-auto">Ou entre com sua conta de jogo</span>
                  <button 
                    onClick={() => handleSocialLogin("Facebook")}
                    className="shrink-0 rounded-full p-1.5 transition-opacity hover:opacity-70 bg-[#006AFC]"
                  >
                    <img 
                      src="/images/fb.svg" 
                      alt="Facebook logo" 
                      width="20" 
                      height="20"
                      className="h-5 w-5 brightness-0 invert"
                    />
                  </button>
                  <button 
                    onClick={() => handleSocialLogin("Google")}
                    className="shrink-0 rounded-full p-1.5 transition-opacity hover:opacity-70 border border-gray-200 bg-white"
                  >
                    <img 
                      src="/images/gg.svg" 
                      alt="Google logo" 
                      width="20" 
                      height="20"
                      className="h-5 w-5"
                    />
                  </button>
                  <button 
                    onClick={() => handleSocialLogin("Twitter")}
                    className="shrink-0 rounded-full p-1.5 transition-opacity hover:opacity-70 border border-gray-200 bg-white"
                  >
                    <img 
                      src="/images/ic-twitter-92527e61.svg" 
                      alt="Twitter logo" 
                      width="20" 
                      height="20"
                      className="h-5 w-5"
                    />
                  </button>
                  <button 
                    onClick={() => handleSocialLogin("VK")}
                    className="shrink-0 rounded-full p-1.5 transition-opacity hover:opacity-70 bg-[#0077FF]"
                  >
                    <img 
                      src="/images/ic-vk-abadf989.svg" 
                      alt="VK logo" 
                      width="20" 
                      height="20"
                      className="h-5 w-5 brightness-0 invert"
                    />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Valor de Recarga Section */}
        <div className="relative mx-auto max-w-5xl px-4 sm:px-[22px] md:px-8 pb-4 sm:pb-6">
          <div className="mb-2 sm:mb-3 flex items-center gap-2 text-base sm:text-lg text-gray-800 md:text-xl">
            <div className="grid items-center">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="col-start-1 row-start-1 text-xl sm:text-2xl text-destructive"
              >
                <path
                  d="M0 3C0 1.34315 1.34315 0 3 0H21C22.6569 0 24 1.34315 24 3V15.7574C24 16.553 23.6839 17.3161 23.1213 17.8787L17.8787 23.1213C17.3161 23.6839 16.553 24 15.7574 24H3C1.34315 24 0 22.6569 0 21V3Z"
                  fill="currentColor"
                ></path>
              </svg>
              <div className="col-start-1 row-start-1 text-center text-sm sm:text-base font-bold text-white">2</div>
            </div>
            <span className="font-bold">Valor de Recarga</span>
          </div>
          
          {/* Texto Promocional - Apenas após login */}
          {isLoggedIn && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-bold text-red-600 mb-1">
                  🎉 Você ganhou 80% de desconto na primeira recarga!
                </h3>
                <p className="text-xs sm:text-sm text-red-500 font-medium">
                  Promoção válida somente para os valores destacados
                </p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 sm:grid-cols-4 md:grid-cols-6 md:gap-4">
            {currentConfig.rechargeValues.map((value) => {
              const isPromotional = currentConfig.promotionalValues.includes(value)
              const isDisabled = (selectedGame === 'freefire' && !isPromotional) || 
                                 (selectedGame === 'deltaforce' && !isPromotional) ||
                                 (selectedGame === 'haikyu' && !isPromotional)
              const hasDoubleCoins = (selectedGame === 'deltaforce' || selectedGame === 'haikyu') && isPromotional
              
              return (
                <div
                  key={value}
                  role="radio"
                  aria-checked={selectedRechargeValue === value}
                  tabIndex={isDisabled ? -1 : 0}
                  className={`group relative flex flex-col min-h-[60px] sm:min-h-[70px] overflow-hidden rounded-md p-0 sm:min-h-[80px] md:min-h-[90px] border outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring ${
                    isDisabled
                      ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-50"
                      : selectedRechargeValue === value
                      ? "border-red-500 bg-red-50 text-red-700 cursor-pointer"
                      : "bg-white border-gray-200 cursor-pointer hover:border-red-300"
                  }`}
                  onClick={() => !isDisabled && handleRechargeValueSelect(value)}
                >
                  {/* Badge de Promoção - Coins em Dobro para Delta Force */}
                  {hasDoubleCoins && (
                    <div className="absolute top-0 right-0 left-0 bg-destructive text-white text-[10px] font-bold px-1.5 py-0.5 text-center">
                      COINS EM DOBRO
                    </div>
                  )}
                  
                  <div className={`flex flex-1 items-center justify-center p-1 ${hasDoubleCoins ? 'pt-4' : ''}`}>
                    <img
                      alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                      data-ai-hint="coin"
                      loading="lazy"
                      width="16"
                      height="16"
                      decoding="async"
                      data-nimg="1"
                      className={`coin-icon ${isDisabled ? "grayscale" : ""}`}
                      src={currentConfig.coinIcon}
                      style={{ color: "transparent" }}
                    />
                    <span className={`coin-value-text ${isDisabled ? "text-gray-400" : ""}`}>
                      {value}
                    </span>
                  </div>
                  
                  {/* Overlay para valores desabilitados */}
                  {isDisabled && (
                    <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
                    
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Ofertas especiais Section */}
        <div className="relative mx-auto max-w-5xl px-4 sm:px-[22px] md:px-8 pb-4 sm:pb-6">
          <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-medium text-gray-600">Ofertas especiais</h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-4 md:gap-4">
            {currentConfig.specialOffers.map((offer) => (
              <div
                key={offer.id}
                className="relative"
              >
                <div
                  role="radio"
                  aria-checked={selectedSpecialOffer === offer.name}
                  tabIndex={0}
                  className={`group peer relative flex h-full cursor-pointer flex-col items-center rounded-md bg-white p-1 sm:p-1.5 pb-1.5 sm:pb-2 border transition-all focus-visible:ring-2 focus-visible:ring-ring ${
                    selectedSpecialOffer === offer.name ? "border-red-500 bg-red-50" : "border-gray-200"
                  }`}
                  onClick={() => handleSpecialOfferSelect(offer.name)}
                >
                  <div className="relative mb-1.5 sm:mb-2 w-full overflow-hidden rounded-sm pt-[56.25%]">
                    <img
                      alt={offer.name}
                      data-ai-hint="game offer"
                      loading="lazy"
                      decoding="async"
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      src={offer.image}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="text-center text-sm leading-[18px] font-medium text-gray-700 line-clamp-2">
                      {offer.name}
                    </div>
                    {(selectedGame === 'haikyu' || selectedGame === 'freefire' || selectedGame === 'deltaforce') && offer.description && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedOfferInfo({
                            name: offer.name,
                            image: offer.image,
                            description: offer.description
                          })
                          setShowOfferInfoModal(true)
                        }}
                        className="shrink-0 flex cursor-pointer relative z-10"
                      >
                        <svg width="1em" height="1em" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                          <path d="M44 26C44 23.7909 42.2091 22 40 22C37.7909 22 36 23.7909 36 26C36 28.2091 37.7909 30 40 30C42.2091 30 44 28.2091 44 26Z" fill="currentColor"></path>
                          <path d="M43 54C43 55.6569 41.6569 57 40 57C38.3431 57 37 55.6569 37 54V37C37 35.3431 38.3431 34 40 34C41.6569 34 43 35.3431 43 37V54Z" fill="currentColor"></path>
                          <path fillRule="evenodd" clipRule="evenodd" d="M5 25C5 13.9543 13.9543 5 25 5H55C66.0457 5 75 13.9543 75 25V55C75 66.0457 66.0457 75 55 75H25C13.9543 75 5 66.0457 5 55V25ZM25 11H55C62.732 11 69 17.268 69 25V55C69 62.732 62.732 69 55 69H25C17.268 69 11 62.732 11 55V25C11 17.268 17.268 11 25 11Z" fill="currentColor"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal de Informação da Oferta - Haikyu */}
        {showOfferInfoModal && selectedOfferInfo && (
          <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4" onClick={() => setShowOfferInfoModal(false)}>
            <div className="relative flex h-full w-full items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <div className="flex w-80 flex-col items-center justify-center rounded-lg bg-white p-6 text-center">
                <div className="mb-5 flex w-full items-center justify-center overflow-hidden rounded-[4px]">
                  <img 
                    className="pointer-events-none h-full w-full object-cover" 
                    src={selectedOfferInfo.image} 
                    alt={selectedOfferInfo.name}
                  />
                </div>
                <div className="mb-3 text-base font-bold text-gray-800">{selectedOfferInfo.name}</div>
                <div className="text-sm leading-[22px] text-gray-600">{selectedOfferInfo.description}</div>
                <button 
                  className="mt-5 w-full inline-flex items-center justify-center gap-1.5 rounded-md border py-1 text-center leading-none transition-colors border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600 px-5 text-sm font-bold h-10"
                  onClick={() => setShowOfferInfoModal(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Método de pagamento Section */}
        <div className="relative mx-auto max-w-5xl px-4 sm:px-[22px] md:px-8 pb-4 sm:pb-6">
          <div className="mb-2 sm:mb-3 flex items-center gap-2 text-base sm:text-lg text-gray-800 md:text-xl">
            <div className="grid items-center">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="col-start-1 row-start-1 text-xl sm:text-2xl text-destructive"
              >
                <path
                  d="M0 3C0 1.34315 1.34315 0 3 0H21C22.6569 0 24 1.34315 24 3V15.7574C24 16.553 23.6839 17.3161 23.1213 17.8787L17.8787 23.1213C17.3161 23.6839 16.553 24 15.7574 24H3C1.34315 24 0 22.6569 0 21V3Z"
                  fill="currentColor"
                ></path>
              </svg>
              <div className="col-start-1 row-start-1 text-center text-sm sm:text-base font-bold text-white">3</div>
            </div>
            <span className="font-bold">Método de pagamento</span>
          </div>
          <div role="radiogroup" className="grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-3 md:gap-4">
            {/* PIX */}
            <div
              role="radio"
              aria-checked={selectedPaymentMethod === "PIX"}
              tabIndex={0}
              onClick={() => setSelectedPaymentMethod("PIX")}
              className={`group relative flex h-full min-h-[70px] sm:min-h-[80px] cursor-pointer items-start gap-1.5 sm:gap-2 rounded-md p-2 sm:p-2.5 transition-all focus-visible:ring-2 focus-visible:ring-ring max-md:flex-col max-md:justify-between md:items-center md:gap-3 md:p-3 ${
                selectedPaymentMethod === "PIX" 
                  ? "border-2 border-red-500 bg-red-50" 
                  : "border border-gray-200 bg-white hover:border-red-300"
              }`}
            >
              <div className="shrink-0">
                <img
                  alt="PIX"
                  data-ai-hint="payment logo"
                  loading="lazy"
                  width="75"
                  height="75"
                  decoding="async"
                  data-nimg="1"
                  className="pointer-events-none h-[45px] w-[45px] sm:h-[60px] sm:w-[60px] object-contain object-left md:h-14 md:w-14"
                  src="/images/pix_boa_mb.png"
                  style={{ color: "transparent" }}
                />
              </div>
              <div className="flex w-full flex-col flex-wrap gap-y-1 font-medium md:gap-y-2 text-sm/none md:text-base/none">
                <div className="flex flex-wrap gap-x-0.5 gap-y-1 whitespace-nowrap md:flex-col">
                  <span className="items-center inline-flex font-bold text-gray-800">
                    R$ {selectedRechargeValue ? calculatePrice(selectedRechargeValue).price.toFixed(2).replace('.', ',') : 
                         selectedSpecialOffer ? getSpecialOfferPrice(selectedSpecialOffer).toFixed(2).replace('.', ',') : '0,00'}
                  </span>
                </div>
                {selectedRechargeValue && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {calculatePrice(selectedRechargeValue).bonus}
                    </span>
                  </div>
                )}
                {selectedSpecialOffer && (selectedGame === 'haikyu' || selectedGame === 'deltaforce') && getSpecialOfferBonus(selectedSpecialOffer) > 0 && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'deltaforce' ? 'Coins' : 'Diamantes Estelares'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {getSpecialOfferBonus(selectedSpecialOffer)}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute end-[2px] top-[2px] sm:end-[3px] sm:top-[3px] overflow-hidden rounded-[3px]">
                <div className="flex text-[9px] sm:text-[11px] font-bold uppercase leading-none">
                  <div className="flex items-center gap-0.5 sm:gap-1 bg-destructive p-0.5 pr-0.5 sm:pr-1 text-white">
                    <img
                      alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                      data-ai-hint="coin"
                      loading="lazy"
                      width="12"
                      height="12"
                      decoding="async"
                      data-nimg="1"
                      className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 rounded-sm bg-white object-contain p-0.5"
                      src={currentConfig.coinIcon}
                      style={{ color: "transparent" }}
                    />
                    <span>Promo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cartões de Crédito */}
            <div
              role="radio"
              aria-checked={selectedPaymentMethod === "Cartão de Crédito"}
              tabIndex={0}
              onClick={() => setSelectedPaymentMethod("Cartão de Crédito")}
              className={`group relative flex h-full min-h-[70px] sm:min-h-[80px] cursor-pointer items-start gap-1.5 sm:gap-2 rounded-md p-2 sm:p-2.5 transition-all focus-visible:ring-2 focus-visible:ring-ring max-md:flex-col max-md:justify-between md:items-center md:gap-3 md:p-3 ${
                selectedPaymentMethod === "Cartão de Crédito" 
                  ? "border-2 border-red-500 bg-red-50" 
                  : "border border-gray-200 bg-white hover:border-red-300"
              }`}
            >
              <div className="shrink-0">
                <img
                  alt="Cartões de Crédito"
                  data-ai-hint="payment logo"
                  loading="lazy"
                  width="75"
                  height="75"
                  decoding="async"
                  data-nimg="1"
                  className="pointer-events-none h-[45px] w-[45px] sm:h-[60px] sm:w-[60px] object-contain object-left md:h-14 md:w-14"
                  src="/images/creditcard.webp"
                  style={{ color: "transparent" }}
                />
              </div>
              <div className="flex w-full flex-col flex-wrap gap-y-1 font-medium md:gap-y-2 text-sm/none md:text-base/none">
                <div className="flex flex-wrap gap-x-0.5 gap-y-1 whitespace-nowrap md:flex-col">
                  <span className="items-center inline-flex font-bold text-gray-800">
                    R$ {selectedRechargeValue ? calculatePrice(selectedRechargeValue).price.toFixed(2).replace('.', ',') : 
                         selectedSpecialOffer ? getSpecialOfferPrice(selectedSpecialOffer).toFixed(2).replace('.', ',') : '0,00'}
                  </span>
                </div>
                {selectedRechargeValue && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {calculatePrice(selectedRechargeValue).bonus}
                    </span>
                  </div>
                )}
                {selectedSpecialOffer && (selectedGame === 'haikyu' || selectedGame === 'deltaforce') && getSpecialOfferBonus(selectedSpecialOffer) > 0 && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'deltaforce' ? 'Coins' : 'Diamantes Estelares'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {getSpecialOfferBonus(selectedSpecialOffer)}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute end-[2px] top-[2px] sm:end-[3px] sm:top-[3px] overflow-hidden rounded-[3px]">
                <div className="flex text-[9px] sm:text-[11px] font-bold uppercase leading-none">
                  <div className="flex items-center gap-0.5 sm:gap-1 bg-destructive p-0.5 pr-0.5 sm:pr-1 text-white">
                    <img
                      alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                      data-ai-hint="coin"
                      loading="lazy"
                      width="12"
                      height="12"
                      decoding="async"
                      data-nimg="1"
                      className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 rounded-sm bg-white object-contain p-0.5"
                      src={currentConfig.coinIcon}
                      style={{ color: "transparent" }}
                    />
                    <span>Promo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PicPay */}
            <div
              role="radio"
              aria-checked={selectedPaymentMethod === "PicPay"}
              tabIndex={0}
              onClick={() => setSelectedPaymentMethod("PicPay")}
              className={`group relative flex h-full min-h-[70px] sm:min-h-[80px] cursor-pointer items-start gap-1.5 sm:gap-2 rounded-md p-2 sm:p-2.5 transition-all focus-visible:ring-2 focus-visible:ring-ring max-md:flex-col max-md:justify-between md:items-center md:gap-3 md:p-3 ${
                selectedPaymentMethod === "PicPay" 
                  ? "border-2 border-red-500 bg-red-50" 
                  : "border border-gray-200 bg-white hover:border-red-300"
              }`}
            >
              <div className="shrink-0">
                <img
                  alt="PicPay"
                  data-ai-hint="payment logo"
                  loading="lazy"
                  width="75"
                  height="75"
                  decoding="async"
                  data-nimg="1"
                  className="pointer-events-none h-[45px] w-[45px] sm:h-[60px] sm:w-[60px] object-contain object-left md:h-14 md:w-14"
                  src="/images/picpay.webp"
                  style={{ color: "transparent" }}
                />
              </div>
              <div className="flex w-full flex-col flex-wrap gap-y-1 font-medium md:gap-y-2 text-sm/none md:text-base/none">
                <div className="flex flex-wrap gap-x-0.5 gap-y-1 whitespace-nowrap md:flex-col">
                  <span className="items-center inline-flex font-bold text-gray-800">
                    R$ {selectedRechargeValue ? calculatePrice(selectedRechargeValue).price.toFixed(2).replace('.', ',') : 
                         selectedSpecialOffer ? getSpecialOfferPrice(selectedSpecialOffer).toFixed(2).replace('.', ',') : '0,00'}
                  </span>
                </div>
                {selectedRechargeValue && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {calculatePrice(selectedRechargeValue).bonus}
                    </span>
                  </div>
                )}
                {selectedSpecialOffer && (selectedGame === 'haikyu' || selectedGame === 'deltaforce') && getSpecialOfferBonus(selectedSpecialOffer) > 0 && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'deltaforce' ? 'Coins' : 'Diamantes Estelares'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {getSpecialOfferBonus(selectedSpecialOffer)}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute end-[2px] top-[2px] sm:end-[3px] sm:top-[3px] overflow-hidden rounded-[3px]">
                <div className="flex text-[9px] sm:text-[11px] font-bold uppercase leading-none">
                  <div className="flex items-center gap-0.5 sm:gap-1 bg-destructive p-0.5 pr-0.5 sm:pr-1 text-white">
                    <img
                      alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                      data-ai-hint="coin"
                      loading="lazy"
                      width="12"
                      height="12"
                      decoding="async"
                      data-nimg="1"
                      className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 rounded-sm bg-white object-contain p-0.5"
                      src={currentConfig.coinIcon}
                      style={{ color: "transparent" }}
                    />
                    <span>Promo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* NUPay */}
            <div
              role="radio"
              aria-checked={selectedPaymentMethod === "NUPay"}
              tabIndex={0}
              onClick={() => setSelectedPaymentMethod("NUPay")}
              className={`group relative flex h-full min-h-[70px] sm:min-h-[80px] cursor-pointer items-start gap-1.5 sm:gap-2 rounded-md p-2 sm:p-2.5 transition-all focus-visible:ring-2 focus-visible:ring-ring max-md:flex-col max-md:justify-between md:items-center md:gap-3 md:p-3 ${
                selectedPaymentMethod === "NUPay" 
                  ? "border-2 border-red-500 bg-red-50" 
                  : "border border-gray-200 bg-white hover:border-red-300"
              }`}
            >
              <div className="shrink-0">
                <img
                  alt="NUPay"
                  data-ai-hint="payment logo"
                  loading="lazy"
                  width="75"
                  height="75"
                  decoding="async"
                  data-nimg="1"
                  className="pointer-events-none h-[45px] w-[45px] sm:h-[60px] sm:w-[60px] object-contain object-left md:h-14 md:w-14"
                  src="/images/nupay.webp"
                  style={{ color: "transparent" }}
                />
              </div>
              <div className="flex w-full flex-col flex-wrap gap-y-1 font-medium md:gap-y-2 text-sm/none md:text-base/none">
                <div className="flex flex-wrap gap-x-0.5 gap-y-1 whitespace-nowrap md:flex-col">
                  <span className="items-center inline-flex font-bold text-gray-800">
                    R$ {selectedRechargeValue ? calculatePrice(selectedRechargeValue).price.toFixed(2).replace('.', ',') : 
                         selectedSpecialOffer ? getSpecialOfferPrice(selectedSpecialOffer).toFixed(2).replace('.', ',') : '0,00'}
                  </span>
                </div>
                {selectedRechargeValue && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {calculatePrice(selectedRechargeValue).bonus}
                    </span>
                  </div>
                )}
                {selectedSpecialOffer && (selectedGame === 'haikyu' || selectedGame === 'deltaforce') && getSpecialOfferBonus(selectedSpecialOffer) > 0 && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'deltaforce' ? 'Coins' : 'Diamantes Estelares'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {getSpecialOfferBonus(selectedSpecialOffer)}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute end-[2px] top-[2px] sm:end-[3px] sm:top-[3px] overflow-hidden rounded-[3px]">
                <div className="flex text-[9px] sm:text-[11px] font-bold uppercase leading-none">
                  <div className="flex items-center gap-0.5 sm:gap-1 bg-destructive p-0.5 pr-0.5 sm:pr-1 text-white">
                    <img
                      alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                      data-ai-hint="coin"
                      loading="lazy"
                      width="12"
                      height="12"
                      decoding="async"
                      data-nimg="1"
                      className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 rounded-sm bg-white object-contain p-0.5"
                      src={currentConfig.coinIcon}
                      style={{ color: "transparent" }}
                    />
                    <span>Promo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mercado Pago */}
            <div
              role="radio"
              aria-checked={selectedPaymentMethod === "Mercado Pago"}
              tabIndex={0}
              onClick={() => setSelectedPaymentMethod("Mercado Pago")}
              className={`group relative flex h-full min-h-[70px] sm:min-h-[80px] cursor-pointer items-start gap-1.5 sm:gap-2 rounded-md p-2 sm:p-2.5 transition-all focus-visible:ring-2 focus-visible:ring-ring max-md:flex-col max-md:justify-between md:items-center md:gap-3 md:p-3 ${
                selectedPaymentMethod === "Mercado Pago" 
                  ? "border-2 border-red-500 bg-red-50" 
                  : "border border-gray-200 bg-white hover:border-red-300"
              }`}
            >
              <div className="shrink-0">
                <img
                  alt="Mercado Pago"
                  data-ai-hint="payment logo"
                  loading="lazy"
                  width="75"
                  height="75"
                  decoding="async"
                  data-nimg="1"
                  className="pointer-events-none h-[45px] w-[45px] sm:h-[60px] sm:w-[60px] object-contain object-left md:h-14 md:w-14"
                  src="/images/mercado-pago.webp"
                  style={{ color: "transparent" }}
                />
              </div>
              <div className="flex w-full flex-col flex-wrap gap-y-1 font-medium md:gap-y-2 text-sm/none md:text-base/none">
                <div className="flex flex-wrap gap-x-0.5 gap-y-1 whitespace-nowrap md:flex-col">
                  <span className="items-center inline-flex font-bold text-gray-800">
                    R$ {selectedRechargeValue ? calculatePrice(selectedRechargeValue).price.toFixed(2).replace('.', ',') : 
                         selectedSpecialOffer ? getSpecialOfferPrice(selectedSpecialOffer).toFixed(2).replace('.', ',') : '0,00'}
                  </span>
                </div>
                {selectedRechargeValue && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {calculatePrice(selectedRechargeValue).bonus}
                    </span>
                  </div>
                )}
                {selectedSpecialOffer && (selectedGame === 'haikyu' || selectedGame === 'deltaforce') && getSpecialOfferBonus(selectedSpecialOffer) > 0 && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'deltaforce' ? 'Coins' : 'Diamantes Estelares'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {getSpecialOfferBonus(selectedSpecialOffer)}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute end-[2px] top-[2px] sm:end-[3px] sm:top-[3px] overflow-hidden rounded-[3px]">
                <div className="flex text-[9px] sm:text-[11px] font-bold uppercase leading-none">
                  <div className="flex items-center gap-0.5 sm:gap-1 bg-destructive p-0.5 pr-0.5 sm:pr-1 text-white">
                    <img
                      alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                      data-ai-hint="coin"
                      loading="lazy"
                      width="12"
                      height="12"
                      decoding="async"
                      data-nimg="1"
                      className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 rounded-sm bg-white object-contain p-0.5"
                      src={currentConfig.coinIcon}
                      style={{ color: "transparent" }}
                    />
                    <span>Promo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {(selectedRechargeValue || selectedSpecialOffer) && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[60] safe-area-bottom">
            <div className="pointer-events-auto relative mx-auto flex w-full max-w-5xl items-center justify-between gap-4 p-4 md:justify-end md:gap-10 lg:px-10">
              <div className="flex flex-col md:items-end">
                {selectedRechargeValue ? (
                  <>
                    <div className="flex items-center gap-1 text-sm/none font-bold md:text-end md:text-base/none">
                      <img 
                        alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="16" 
                        height="16" 
                        decoding="async" 
                        data-nimg="1" 
                        className="h-4 w-4 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      <span dir="ltr">{selectedRechargeValue} + {calculatePrice(selectedRechargeValue).bonus}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-sm/none md:text-end md:text-base/none">
                      <span className="font-medium text-gray-600">Total:</span>
                      <span className="font-bold text-destructive">R$ {calculatePrice(selectedRechargeValue).price.toFixed(2).replace(".", ",")}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1 text-sm/none font-bold md:text-end md:text-base/none">
                      <span dir="ltr">{selectedSpecialOffer}</span>
                    </div>
                    {(selectedGame === 'haikyu' || selectedGame === 'deltaforce') && selectedSpecialOffer && getSpecialOfferBonus(selectedSpecialOffer) > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-xs/none md:text-sm/none text-red-500">
                        <span>+ Bônus</span>
                        <img 
                          alt={selectedGame === 'deltaforce' ? 'Coins' : 'Diamantes Estelares'}
                          data-ai-hint="coin" 
                          loading="lazy" 
                          width="12" 
                          height="12" 
                          decoding="async" 
                          data-nimg="1" 
                          className="h-3 w-3 object-contain" 
                          src={currentConfig.coinIcon}
                          style={{ color: "transparent" }}
                        />
                        <span>{getSpecialOfferBonus(selectedSpecialOffer)}</span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-sm/none md:text-end md:text-base/none">
                      <span className="font-medium text-gray-600">Total:</span>
                      <span className="font-bold text-destructive">R$ {getSpecialOfferPrice(selectedSpecialOffer!).toFixed(2).replace(".", ",")}</span>
                    </div>
                  </>
                )}
              </div>
              <button 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90 py-2 px-5 text-base font-bold h-11"
                onClick={isLoggedIn ? handleBuyNow : () => {
                  const loginSection = document.getElementById('login-section');
                  if (loginSection) {
                    loginSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
              >
                <svg width="1em" height="1em" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]">
                  <path d="M54.125 34.1211C55.2966 32.9495 55.2966 31.05 54.125 29.8784C52.9534 28.7069 51.0539 28.7069 49.8823 29.8784L38.0037 41.7571L32.125 35.8784C30.9534 34.7069 29.0539 34.7069 27.8823 35.8784C26.7108 37.05 26.7108 38.9495 27.8823 40.1211L35.8823 48.1211C37.0539 49.2926 38.9534 49.2926 40.125 48.1211L54.125 34.1211Z" fill="currentColor"></path>
                  <path fillRule="evenodd" clipRule="evenodd" d="M43.4187 3.4715C41.2965 2.28554 38.711 2.28554 36.5889 3.4715L8.07673 19.4055C6.19794 20.4555 4.97252 22.4636 5.02506 24.7075C5.36979 39.43 10.1986 63.724 37.0183 76.9041C38.8951 77.8264 41.1125 77.8264 42.9893 76.9041C69.809 63.724 74.6377 39.43 74.9825 24.7075C75.035 22.4636 73.8096 20.4555 71.9308 19.4055L43.4187 3.4715ZM39.5159 8.7091C39.8191 8.53968 40.1885 8.53968 40.4916 8.7091L68.9826 24.6313C68.6493 38.3453 64.2154 59.7875 40.343 71.5192C40.135 71.6214 39.8725 71.6214 39.6646 71.5192C15.7921 59.7875 11.3583 38.3453 11.025 24.6313L39.5159 8.7091Z" fill="currentColor"></path>
                </svg>
                Compre agora
              </button>
            </div>
          </div>
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
                  <a href={mounted ? addUtmsToUrl('/politica-privacidade') : '/politica-privacidade'} target="_blank" className="transition-opacity hover:opacity-70">Política de Privacidade</a>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Modal de Tutorial */}
        {showTutorialModal && (
          <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4" onClick={() => setShowTutorialModal(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    Como encontrar seu ID - {selectedGame === 'freefire' ? 'Free Fire' : selectedGame === 'deltaforce' ? 'Delta Force' : 'Haikyu'}
                  </h3>
                  <button onClick={() => setShowTutorialModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {selectedGame === 'freefire' && (
                    <div>
                      <p className="text-sm text-gray-700 mb-3">
                        Veja onde encontrar seu ID no Free Fire:
                      </p>
                      <img src="/images/tutorialff.jpg" alt="Tutorial Free Fire" className="w-full rounded-lg border border-gray-200" />
                    </div>
                  )}
                  
                  {selectedGame === 'deltaforce' && (
                    <div>
                      <p className="text-sm text-gray-700 mb-3">
                        Veja onde encontrar seu ID no Delta Force:
                      </p>
                      <img src="/images/tutorialdf.jpg" alt="Tutorial Delta Force" className="w-full rounded-lg border border-gray-200" />
                    </div>
                  )}
                  
                  {selectedGame === 'haikyu' && (
                    <div>
                      <p className="text-sm text-gray-700 mb-3 font-semibold">
                        Como encontrar seu ID no Haikyu:
                      </p>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                        <li>Clique no seu <strong>perfil/profile</strong> dentro do jogo</li>
                        <li>Ao lado da sua foto você verá o <strong>ID</strong></li>
                        <li>Clique no ID para copiar automaticamente</li>
                        <li>Cole o ID copiado no campo de login acima</li>
                      </ol>
                    </div>
                  )}
                  
                 
                </div>
                
                <button
                  onClick={() => setShowTutorialModal(false)}
                  className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Login Social Indisponível */}
        {showSocialError && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-red-600 mb-3">Login Social Indisponível</h3>
                <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                  Estamos com instabilidade neste tipo de login. Por favor, use o login com ID do jogador.
                </p>
                <button
                  onClick={() => setShowSocialError(false)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Item Grátis */}
        {showFreeItemModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="flex w-full max-w-sm flex-col items-center justify-center rounded-lg bg-white p-6 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-[14px] border border-gray-300 bg-white">
                <img 
                  className="pointer-events-none h-full w-full object-cover" 
                  src="/images/itemgratisNovo.png"
                  alt="Pacote de Armas Gabarola"
                />
              </div>
              <div className="mb-3 text-base font-bold text-gray-800">Pacote de Armas Gabarola</div>
              <div className="px-4 text-sm text-gray-600 mb-5">Pacote de Armas Gabarola</div>
              <button 
                onClick={() => setShowFreeItemModal(false)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border py-1 text-center leading-none transition-colors border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700 px-5 text-sm font-bold h-10"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Banner de Consentimento de Cookies */}
        {showCookieBanner && (
          <div className="fixed inset-x-0 bottom-8 z-10 flex justify-center px-3">
            <div className="w-full max-w-5xl px-4 md:px-8 lg:px-10">
              <div className="flex flex-col items-start rounded-md bg-black/75 px-3.5 py-4 text-white md:flex-row md:items-center">
                <div className="grow">
                  <div className="mb-1 text-base">Consentimento de Cookie</div>
                  <div className="text-sm">
                    <span className="text-white/70">
                      A gente usa cookies para melhorar a sua experiência no site. Ao continuar navegando, você concorda com a nossa
                    </span>{' '}
                    <a 
                      href={mounted ? addUtmsToUrl('/politica-privacidade') : '/politica-privacidade'} 
                      target="_blank"
                      className="underline hover:text-white/80"
                    >
                      Política de Privacidade.
                    </a>
                  </div>
                </div>
                <button 
                  onClick={handleAcceptCookies}
                  className="mt-3 shrink-0 md:ms-3 md:mt-0 inline-flex items-center justify-center gap-1.5 rounded-md border py-1 text-center leading-none transition-colors border-[rgb(216,26,13)] bg-[rgb(216,26,13)] text-white hover:bg-[rgb(205,18,20)] hover:border-[rgb(205,18,20)] px-5 text-base font-bold h-11"
                >
                  Continuar e Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  

  return (
    <>
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Carregando...</h2>
          <p className="text-gray-600">Preparando sua experiência de recarga</p>
        </div>
      </div>

        {/* Modal de Login Social Indisponível */}
        {showSocialError && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-red-600 mb-3">Login Social Indisponível</h3>
                <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                  Estamos com instabilidade neste tipo de login. Por favor, use o login com ID do jogador.
                </p>
                <button
                  onClick={() => setShowSocialError(false)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Modal de Login Obrigatório */}
      <LoginModal 
        isOpen={!authLoading && !isAuthenticated} 
        onSuccess={login}
      />
    </>
  )
}
