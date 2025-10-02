import { NextRequest, NextResponse } from "next/server"
import { orderStorageService } from "@/lib/order-storage"
import { adminLogger } from "@/lib/admin-logger"

interface PaymentWebhookData {
  transactionId: string
  orderId: string
  status: "paid" | "pending" | "cancelled" | "failed"
  amount: number
  customerData?: {
    name: string
    email: string
    phone: string
    document: string
  }
  trackingParameters?: Record<string, string>
}

export async function POST(request: NextRequest) {
  try {
    const webhookData: PaymentWebhookData = await request.json()
    
    console.log("[v0] Payment Webhook - Received data:", webhookData)

    // Verificar se o pagamento foi aprovado
    if (webhookData.status === "paid") {
      console.log("[v0] Payment Webhook - Payment confirmed for order:", webhookData.orderId)
      
      // Buscar dados do pedido no storage
      let storedOrder = orderStorageService.getOrder(webhookData.orderId)
      if (!storedOrder && webhookData.transactionId) {
        storedOrder = orderStorageService.getOrder(webhookData.transactionId)
      }
      
      if (!storedOrder) {
        console.error("[v0] Payment Webhook - Order not found in storage:", webhookData.orderId)
        
        // Se não encontrar no storage e não tiver dados completos no webhook, retornar erro
        if (!webhookData.customerData || !webhookData.customerData.email) {
          return NextResponse.json({
            success: false,
            error: "Order not found in storage and webhook data incomplete",
            orderId: webhookData.orderId
          }, { status: 404 })
        }
        
        // Usar apenas dados reais do webhook se disponíveis
        storedOrder = {
          orderId: webhookData.orderId,
          transactionId: webhookData.transactionId,
          amount: webhookData.amount,
          customerData: webhookData.customerData,
          trackingParameters: webhookData.trackingParameters || {},
          createdAt: new Date().toISOString(),
          status: 'pending' as const
        }
        
        console.log("[v0] Payment Webhook - Using webhook data:", storedOrder)
      }
      
      // Atualizar status do pedido
      orderStorageService.updateOrderStatus(webhookData.orderId, "paid")
      
      // Log detalhado para admin
      adminLogger.addLog({
        type: 'order_paid',
        message: `Pagamento confirmado - ID: ${webhookData.orderId}`,
        details: {
          orderId: webhookData.orderId,
          transactionId: webhookData.transactionId,
          amount: webhookData.amount,
          email: storedOrder.customerData.email,
          gclid: storedOrder.trackingParameters.gclid,
          utm_source: storedOrder.trackingParameters.utm_source,
          utm_campaign: storedOrder.trackingParameters.utm_campaign,
          status: 'paid'
        }
      })
      
      // Usar dados do storage (mais completos) combinados com dados do webhook
      const orderData = {
        orderId: storedOrder.orderId,
        amount: storedOrder.amount,
        customerData: storedOrder.customerData,
        trackingParameters: storedOrder.trackingParameters,
        status: "paid"
      }

      // Enviar conversão para UTMify apenas se habilitado
      const utmifyEnabled = process.env.UTMIFY_ENABLED === 'true'
      if (utmifyEnabled) {
        try {
          console.log("[v0] Payment Webhook - Sending conversion to UTMify:", orderData)
          
          const utmifyResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-to-utmify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...orderData,
              status: "paid" // Status atualizado para pago
            }),
          })

          if (utmifyResponse.ok) {
            const utmifyData = await utmifyResponse.json()
            console.log("[v0] Payment Webhook - UTMify conversion sent successfully:", utmifyData)
          } else {
            const errorText = await utmifyResponse.text()
            console.error("[v0] Payment Webhook - UTMify error:", utmifyResponse.status, errorText)
          }
        } catch (error) {
          console.error("[v0] Payment Webhook - Error sending to UTMify:", error)
        }
      } else {
        console.log("[v0] Payment Webhook - UTMify disabled, skipping conversion")
      }

      // Enviar evento de conversão para Ratoeira ADS apenas se habilitado
      const ratoeiraEnabled = process.env.RATOEIRA_ENABLED === 'true'
      if (ratoeiraEnabled) {
        try {
          console.log('[v0] Payment Webhook - Sending conversion to Ratoeira ADS')
          
          const ratoeiraResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ratoeira-conversion`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: webhookData.orderId,
              amount: webhookData.amount,
              gclid: storedOrder.trackingParameters.gclid,
              utm_source: storedOrder.trackingParameters.utm_source,
              utm_campaign: storedOrder.trackingParameters.utm_campaign,
              utm_medium: storedOrder.trackingParameters.utm_medium,
              utm_term: storedOrder.trackingParameters.utm_term,
              utm_content: storedOrder.trackingParameters.utm_content,
              customerData: {
                name: storedOrder.customerData.name,
                email: storedOrder.customerData.email
              }
            }),
          })

          if (ratoeiraResponse.ok) {
            const ratoeiraData = await ratoeiraResponse.json()
            console.log('[v0] Payment Webhook - Ratoeira ADS conversion sent successfully:', ratoeiraData)
          } else {
            const errorText = await ratoeiraResponse.text()
            console.error('[v0] Payment Webhook - Ratoeira ADS error:', ratoeiraResponse.status, errorText)
          }
        } catch (error) {
          console.error('[v0] Payment Webhook - Error sending to Ratoeira ADS:', error)
        }
      } else {
        console.log("[v0] Payment Webhook - Ratoeira ADS disabled, skipping conversion")
      }

      return NextResponse.json({
        success: true,
        message: "Payment processed and conversion sent",
        orderId: webhookData.orderId
      })
    } else {
      console.log("[v0] Payment Webhook - Payment not confirmed, status:", webhookData.status)
      
      return NextResponse.json({
        success: true,
        message: "Payment status updated but not paid",
        status: webhookData.status
      })
    }
  } catch (error) {
    console.error("[v0] Payment Webhook - Error processing webhook:", error)
    
    return NextResponse.json({
      success: false,
      error: "Error processing payment webhook",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
