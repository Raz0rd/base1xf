import { NextRequest, NextResponse } from 'next/server'
import { orderStorageService } from '@/lib/order-storage'

interface BlackCatTransaction {
  id: string
  tenantId: string
  companyId: number
  amount: number
  currency: string
  paymentMethod: string
  status: string
  installments: number
  paidAt: string | null
  paidAmount: number
  refundedAt: string | null
  refundedAmount: number
  postbackUrl: string
  metadata: string
  ip: string
  externalRef: string
  secureId: string
  secureUrl: string
  createdAt: string
  updatedAt: string
  customer: {
    id: number
    name: string
    email: string
    phone: string
    birthdate: string
    document: {
      type: string
      number: string
    }
  }
  pix?: {
    qrcode: string
    end2EndId: string | null
    receiptUrl: string | null
    expirationDate: string
  }
}

interface BlackCatWebhookPayload {
  type: string
  data: BlackCatTransaction
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚨🚨🚨 [WEBHOOK DEBUG] BlackCat webhook received! 🚨🚨🚨")
    console.log("🚨🚨🚨 [WEBHOOK DEBUG] Timestamp:", new Date().toISOString())
    
    const body: BlackCatWebhookPayload = await request.json()
    console.log("🚨🚨🚨 [WEBHOOK DEBUG] Payload recebido:", JSON.stringify(body, null, 2))

    // Verificar se é uma transação do BlackCat
    if (body.type !== "transaction" || !body.data) {
      console.log("[v0] Not a transaction webhook, ignoring")
      return NextResponse.json({ success: true, message: "Not a transaction webhook" })
    }

    const transaction = body.data
    const transactionId = transaction.id.toString()
    const status = transaction.status
    const isPaid = status === 'paid' || status === 'approved'
    const isWaitingPayment = status === 'waiting_payment'

    console.log("🚨🚨🚨 [WEBHOOK DEBUG] Transaction details:", {
      id: transactionId,
      status,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      customer: transaction.customer.name,
      isPaid,
      isWaitingPayment
    })

    if (isPaid || isWaitingPayment) {
      console.log(`[v0] Payment ${isPaid ? 'confirmed' : 'pending'} via BlackCat webhook:`, transactionId)
      console.log(`[v0] 🚨 DEBUG: isPaid=${isPaid}, isWaitingPayment=${isWaitingPayment}, status=${status}`)
      
      // Recuperar tracking parameters do metadata OU do order storage
      let trackingParameters: Record<string, string | null> = {
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
        gbraid: null
      }
      
      let orderId = transaction.externalRef || transactionId
      
      try {
        if (transaction.metadata) {
          const metadata = JSON.parse(transaction.metadata)
          
          // Tentar recuperar UTMs do metadata primeiro
          if (metadata.utmParams) {
            trackingParameters = { ...trackingParameters, ...metadata.utmParams }
            console.log("[v0] Recovered UTM parameters from metadata:", trackingParameters)
          }
          
          if (metadata.orderId) {
            orderId = metadata.orderId
          }
        }
        
        // Fallback: tentar recuperar do order storage
        if (!trackingParameters.utm_source && !trackingParameters.gclid) {
          console.log("[v0] Tentando recuperar UTMs do order storage para:", { transactionId, orderId })
          const storedOrder = orderStorageService.getOrder(transactionId) || orderStorageService.getOrder(orderId)
          if (storedOrder && storedOrder.trackingParameters) {
            trackingParameters = { ...trackingParameters, ...storedOrder.trackingParameters }
            console.log("[v0] ✅ Recovered UTM parameters from order storage:", trackingParameters)
          } else {
            console.log("[v0] ❌ Nenhum pedido encontrado no order storage")
          }
        } else {
          console.log("[v0] ✅ UTMs já recuperados do metadata, não precisa do fallback")
        }
        
      } catch (error) {
        console.error("[v0] Error parsing metadata:", error)
      }
      
      // Criar dados para enviar para UTMify
      const utmifyData = {
        orderId,
        platform: "GlobalPay",
        paymentMethod: "pix",
        status: isPaid ? "paid" : "pending",
        createdAt: new Date(transaction.createdAt).toISOString().replace('T', ' ').substring(0, 19),
        approvedDate: transaction.paidAt ? new Date(transaction.paidAt).toISOString().replace('T', ' ').substring(0, 19) : new Date().toISOString().replace('T', ' ').substring(0, 19),
        refundedAt: null,
        customer: {
          name: transaction.customer.name,
          email: transaction.customer.email,
          phone: transaction.customer.phone,
          document: transaction.customer.document.number,
          country: "BR",
          ip: transaction.ip
        },
        products: [
          {
            id: Math.random().toString(36).substring(2, 15), // ID simples para mobile
            name: "Recarga",
            planId: null,
            planName: null,
            quantity: 1,
            priceInCents: transaction.amount
          }
        ],
        trackingParameters,
        commission: {
          totalPriceInCents: transaction.amount,
          gatewayFeeInCents: Math.round(transaction.amount * 0.04),
          userCommissionInCents: Math.round(transaction.amount * 0.96)
        },
        isTest: process.env.NODE_ENV !== 'production'
      }

      // Registrar conversão de pagamento no analytics
      try {
        // Obter URL atual dinamicamente
        const host = request.headers.get('host')
        const protocol = request.headers.get('x-forwarded-proto') || 'https'
        const baseUrl = `${protocol}://${host}`
        
        await fetch(`${baseUrl}/api/admin-analytics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'log_conversion', 
            conversionType: 'paid',
            orderId: orderId,
            amount: transaction.amount,
            utmParams: trackingParameters,
            ip: transaction.ip,
            userAgent: 'webhook'
          })
        }).catch(err => console.error('[WEBHOOK] Erro ao registrar conversão:', err))
      } catch (error) {
        console.error('[WEBHOOK] Erro ao registrar conversão de pagamento:', error)
      }

      // Enviar para UTMify
      const utmifyEnabled = process.env.UTMIFY_ENABLED === 'true'
      console.log(`[v0] 🚨 DEBUG UTMify: ENABLED=${utmifyEnabled}, TOKEN=${!!process.env.UTMIFY_API_TOKEN}`)
      
      try {
        const utmifyToken = process.env.UTMIFY_API_TOKEN
        if (utmifyToken && utmifyEnabled) {
          console.log(`[v0] 🎯 FINAL UTMs sendo enviados para UTMify (${isPaid ? 'PAID' : 'PENDING'}):`, JSON.stringify(trackingParameters, null, 2))
          console.log("[v0] Enviando dados para UTMify:", JSON.stringify(utmifyData, null, 2))
          
          const utmifyResponse = await fetch("https://api.utmify.com.br/api-credentials/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-token": utmifyToken,
            },
            body: JSON.stringify(utmifyData),
          })

          if (utmifyResponse.ok) {
            console.log(`[v0] ✅ Successfully sent payment ${isPaid ? 'confirmation' : 'pending'} to UTMify`)
          } else {
            const errorText = await utmifyResponse.text()
            console.error("[v0] ❌ Failed to send to UTMify:", utmifyResponse.status, errorText)
          }
        } else {
          console.warn(`[v0] ⚠️ UTMify não enviado: ENABLED=${utmifyEnabled}, TOKEN=${!!utmifyToken}`)
        }
      } catch (error) {
        console.error("[v0] ❌ Error sending to UTMify:", error)
      }

      // Aqui você pode adicionar outras ações quando o pagamento for confirmado
      // Por exemplo: atualizar banco de dados, enviar email, etc.
    }

    // Sempre retornar 200 para confirmar recebimento do webhook
    return NextResponse.json({ 
      success: true, 
      message: "BlackCat webhook processed successfully",
      transactionId,
      status,
      isPaid 
    })
  } catch (error) {
    console.error("[v0] Error processing BlackCat webhook:", error)
    
    // Mesmo com erro, retornar 200 para evitar reenvios desnecessários
    return NextResponse.json({ 
      success: false, 
      error: "Error processing webhook" 
    })
  }
}
