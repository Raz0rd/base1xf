import { NextRequest, NextResponse } from 'next/server'
import { orderStorageService } from '@/lib/order-storage'
import { getBrazilTimestamp } from '@/lib/brazil-time'

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
    const isPaid = status === 'paid' || status === 'approved' || status === 'PAID' // Umbrela usa PAID
    const isWaitingPayment = status === 'waiting_payment' || status === 'WAITING_PAYMENT'

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
          console.log("col-start-1 row-start-1 text-center text-sm sm:text-base font-bold text-white ✅ UTMs já recuperados do metadata, não precisa do fallback")
        }
        
      } catch (error) {
        console.error("[v0] Error parsing metadata:", error)
      }
      
      // Criar dados para enviar para UTMify no formato EXATO da documentação
      const utmifyData = {
        orderId,
        platform: "RecarGames",
        paymentMethod: "pix",
        status: isPaid ? "paid" : "waiting_payment", // Status correto do UTMify
        createdAt: getBrazilTimestamp(new Date(transaction.createdAt)),
        approvedDate: isPaid && transaction.paidAt ? getBrazilTimestamp(new Date(transaction.paidAt)) : null,
        refundedAt: null,
        customer: {
          name: transaction.customer.name,
          email: transaction.customer.email,
          phone: transaction.customer.phone,
          document: transaction.customer.document.number,
          country: "BR",
          ip: transaction.ip || "unknown"
        },
        products: [
          {
            id: `recarga-${transactionId}`,
            name: "Recarga Free Fire",
            planId: null,
            planName: null,
            quantity: 1,
            priceInCents: transaction.amount
          }
        ],
        trackingParameters: {
          src: trackingParameters.src,
          sck: trackingParameters.sck,
          utm_source: trackingParameters.utm_source,
          utm_campaign: trackingParameters.utm_campaign,
          utm_medium: trackingParameters.utm_medium,
          utm_content: trackingParameters.utm_content,
          utm_term: trackingParameters.utm_term,
          gclid: trackingParameters.gclid,
          xcod: trackingParameters.xcod,
          keyword: trackingParameters.keyword,
          device: trackingParameters.device,
          network: trackingParameters.network,
          gad_source: trackingParameters.gad_source,
          gbraid: trackingParameters.gbraid
        },
        commission: {
          totalPriceInCents: transaction.amount,
          gatewayFeeInCents: transaction.amount,
          userCommissionInCents: transaction.amount
        },
        isTest: process.env.UTMIFY_TEST_MODE === 'true'
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

      // Enviar para UTMify se habilitado
      const utmifyEnabled = process.env.UTMIFY_ENABLED === 'true'
      const utmifyToken = process.env.UTMIFY_API_TOKEN
      console.log(`[v0] 🔍 DEBUG UTMify: ENABLED=${utmifyEnabled}, TOKEN=${!!utmifyToken}`)
      
      try {
        if (utmifyToken && utmifyEnabled) {
          console.log(`[v0] 🎯FINAL UTMs being sent to UTMify (${isPaid ? 'PAID' : 'PENDING'}):`, JSON.stringify(trackingParameters, null, 2))
          console.log("[v0] Sending data to UTMify:", JSON.stringify(utmifyData, null, 2))
          
          const utmifyResponse = await fetch("https://api.utmify.com.br/api-credentials/orders", {
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
