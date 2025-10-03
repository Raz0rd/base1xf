import { NextRequest, NextResponse } from "next/server"
import { orderStorageService } from "@/lib/order-storage"

export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json()
    
    if (!transactionId) {
      return NextResponse.json({
        success: false,
        error: "transactionId é obrigatório"
      }, { status: 400 })
    }

    console.log(`[FALLBACK] Verificando status da transação: ${transactionId}`)

    // Verificar se já processamos esta transação como paid
    const storedOrder = orderStorageService.getOrder(transactionId.toString())
    if (storedOrder && storedOrder.status === 'paid') {
      console.log(`[FALLBACK] Transação ${transactionId} já processada como paid`)
      return NextResponse.json({
        success: true,
        status: 'paid',
        message: 'Transação já processada como paid',
        alreadyProcessed: true
      })
    }

    // Consultar API do BlackCat
    const blackcatUrl = `https://api.blackcatpagamentos.com/v1/transactions/${transactionId}`
    const blackcatAuth = process.env.BLACKCAT_API_AUTH

    if (!blackcatAuth) {
      throw new Error("BLACKCAT_API_AUTH não configurado")
    }

    console.log(`[FALLBACK] Consultando BlackCat: ${blackcatUrl}`)

    const response = await fetch(blackcatUrl, {
      method: "GET",
      headers: {
        "accept": "application/json",
        "authorization": blackcatAuth
      }
    })

    if (!response.ok) {
      console.error(`[FALLBACK] Erro na API BlackCat: ${response.status}`)
      return NextResponse.json({
        success: false,
        error: `Erro na API BlackCat: ${response.status}`,
        status: response.status
      }, { status: 500 })
    }

    const transactionData = await response.json()
    console.log(`[FALLBACK] Status atual: ${transactionData.status}`)

    const currentStatus = transactionData.status
    const isNowPaid = currentStatus === 'paid'
    const isWaitingPayment = currentStatus === 'waiting_payment'

    // Se mudou para paid e ainda não processamos, processar agora
    if (isNowPaid && (!storedOrder || storedOrder.status !== 'paid')) {
      console.log(`[FALLBACK] Status mudou para PAID! Processando...`)

      // Recuperar UTMs do storage ou usar fallback
      let trackingParameters = {}
      if (storedOrder && storedOrder.trackingParameters) {
        trackingParameters = storedOrder.trackingParameters
        console.log(`[FALLBACK] UTMs recuperados do storage:`, trackingParameters)
      } else {
        console.warn(`[FALLBACK] Nenhum UTM encontrado no storage para ${transactionId}`)
      }

      // Atualizar status no storage
      if (storedOrder) {
        orderStorageService.saveOrder({
          ...storedOrder,
          status: 'paid',
          paidAt: transactionData.paidAt || new Date().toISOString()
        })
      }

      // Enviar para UTMify
      const utmifyEnabled = process.env.UTMIFY_ENABLED === 'true'
      if (utmifyEnabled) {
        try {
          console.log(`[FALLBACK] Enviando status PAID para UTMify`)

          const utmifyData = {
            orderId: transactionId.toString(),
            platform: "GlobalPay",
            paymentMethod: "pix",
            status: "paid",
            createdAt: new Date(transactionData.createdAt).toISOString().replace('T', ' ').substring(0, 19),
            approvedDate: new Date(transactionData.paidAt).toISOString().replace('T', ' ').substring(0, 19),
            refundedAt: null,
            customer: {
              name: transactionData.customer.name,
              email: transactionData.customer.email,
              phone: transactionData.customer.phone,
              document: transactionData.customer.document.number,
              country: "BR",
              ip: transactionData.ip
            },
            products: [
              {
                id: "recarga-free-fire",
                name: "Recarga Free Fire",
                planId: null,
                planName: null,
                quantity: 1,
                priceInCents: transactionData.amount
              }
            ],
            trackingParameters,
            commission: {
              totalPriceInCents: transactionData.amount,
              gatewayFeeInCents: transactionData.amount,
              userCommissionInCents: transactionData.amount
            },
            isTest: process.env.UTMIFY_TEST_MODE === 'true'
          }

          // Obter URL atual dinamicamente
          const host = request.headers.get('host')
          const protocol = request.headers.get('x-forwarded-proto') || 'https'
          const baseUrl = `${protocol}://${host}`

          const utmifyResponse = await fetch(`${baseUrl}/api/send-to-utmify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(utmifyData),
          })

          if (utmifyResponse.ok) {
            console.log(`[FALLBACK] ✅ UTMify notificado com sucesso (PAID)`)
          } else {
            console.error(`[FALLBACK] ❌ Erro ao notificar UTMify:`, utmifyResponse.status)
          }
        } catch (error) {
          console.error(`[FALLBACK] Erro ao enviar para UTMify:`, error)
        }
      }

      return NextResponse.json({
        success: true,
        status: 'paid',
        message: 'Pagamento confirmado via fallback',
        transactionData: {
          id: transactionData.id,
          status: transactionData.status,
          amount: transactionData.amount,
          paidAt: transactionData.paidAt,
          customer: transactionData.customer.name
        },
        utmifySent: utmifyEnabled
      })
    }

    // Retornar status atual (sem processar)
    return NextResponse.json({
      success: true,
      status: currentStatus,
      message: `Status atual: ${currentStatus}`,
      transactionData: {
        id: transactionData.id,
        status: transactionData.status,
        amount: transactionData.amount,
        paidAt: transactionData.paidAt,
        customer: transactionData.customer.name
      },
      needsProcessing: false
    })

  } catch (error) {
    console.error("[FALLBACK] Erro:", error)
    return NextResponse.json({
      success: false,
      error: "Erro ao verificar status da transação",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
