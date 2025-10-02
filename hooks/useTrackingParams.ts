import { useState, useEffect } from 'react'

export interface TrackingParameters {
  src: string | null
  sck: string | null
  utm_source: string | null
  utm_campaign: string | null
  utm_medium: string | null
  utm_content: string | null
  utm_term: string | null
  xcod: string | null
  keyword: string | null
  device: string | null
  network: string | null
  gclid: string | null
  gad_source: string | null
  gbraid: string | null
}

export interface CustomerData {
  name: string
  email: string
  phone: string
  document: string
  country: string
  ip: string
}

export interface ProductData {
  id: string
  name: string
  planId: string | null
  planName: string | null
  quantity: number
  priceInCents: number
}

export interface OrderData {
  orderId: string
  platform: string
  paymentMethod: string
  status: 'waiting_payment' | 'paid' | 'refunded'
  createdAt: string
  approvedDate: string | null
  refundedAt: string | null
  customer: CustomerData
  products: ProductData[]
  trackingParameters: TrackingParameters
  commission: {
    totalPriceInCents: number
    gatewayFeeInCents: number
    userCommissionInCents: number
  }
  isTest: boolean
}

export const useTrackingParams = () => {
  const [trackingParams, setTrackingParams] = useState<TrackingParameters>({
    src: null,
    sck: null,
    utm_source: null,
    utm_campaign: null,
    utm_medium: null,
    utm_content: null,
    utm_term: null,
    xcod: null,
    keyword: null,
    device: null,
    network: null,
    gclid: null,
    gad_source: null,
    gbraid: null,
  })

  const [userIP, setUserIP] = useState<string>('')

  useEffect(() => {
    // Capturar parâmetros da URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      
      const params: TrackingParameters = {
        src: urlParams.get('src'),
        sck: urlParams.get('sck'),
        utm_source: urlParams.get('utm_source'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_medium: urlParams.get('utm_medium'),
        utm_content: urlParams.get('utm_content'),
        utm_term: urlParams.get('utm_term'),
        xcod: urlParams.get('xcod'),
        keyword: urlParams.get('keyword'),
        device: urlParams.get('device'),
        network: urlParams.get('network'),
        gclid: urlParams.get('gclid'),
        gad_source: urlParams.get('gad_source'),
        gbraid: urlParams.get('gbraid'),
      }

      setTrackingParams(params)

      // Armazenar no localStorage para persistir durante a sessão
      localStorage.setItem('trackingParams', JSON.stringify(params))

      console.log('[v0] Tracking parameters captured:', params)
    }
  }, [])

  useEffect(() => {
    // Recuperar parâmetros do localStorage se disponível
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('trackingParams')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setTrackingParams(parsed)
        } catch (error) {
          console.error('[v0] Error parsing stored tracking params:', error)
        }
      }
    }
  }, [])

  useEffect(() => {
    // Capturar IP do usuário
    const fetchUserIP = async () => {
      try {
        const response = await fetch('/api/get-user-ip')
        if (response.ok) {
          const data = await response.json()
          setUserIP(data.ip)
        } else {
          setUserIP('unknown')
        }
      } catch (error) {
        console.error('[v0] Error fetching user IP:', error)
        setUserIP('unknown')
      }
    }

    fetchUserIP()
  }, [])

  const generateOrderId = () => {
    // Fallback para navegadores que não suportam crypto.randomUUID()
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    
    // Fallback manual para mobile
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  const createOrderData = (
    customerData: { name: string; email: string; phone: string; document?: string },
    amount: number,
    productName: string = 'Recarga'
  ): OrderData => {
    const orderId = generateOrderId()
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19)
    
    return {
      orderId,
      platform: 'GlobalPay',
      paymentMethod: 'pix',
      status: 'waiting_payment',
      createdAt: now,
      approvedDate: null,
      refundedAt: null,
      customer: {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone.replace(/\D/g, ''),
        document: customerData.document || '00000000000',
        country: 'BR',
        ip: userIP || '0.0.0.0'
      },
      products: [
        {
          id: generateOrderId(), // Usar a mesma função com fallback
          name: productName,
          planId: null,
          planName: null,
          quantity: 1,
          priceInCents: Math.round(amount * 100)
        }
      ],
      trackingParameters: trackingParams,
      commission: {
        totalPriceInCents: Math.round(amount * 100),
        gatewayFeeInCents: Math.round(amount * 100 * 0.04), // 4% de taxa
        userCommissionInCents: Math.round(amount * 100 * 0.96) // 96% para o usuário
      },
      isTest: process.env.NODE_ENV !== 'production'
    }
  }

  return {
    trackingParams,
    userIP,
    generateOrderId,
    createOrderData
  }
}
