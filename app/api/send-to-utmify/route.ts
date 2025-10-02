import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const orderData = await request.json()
    
    console.log("\n🎯 [UTMify API] Recebendo dados do pedido:")
    console.log("📦 [UTMify API] Order ID:", orderData.orderId)
    console.log("💰 [UTMify API] Amount:", orderData.commission?.totalPriceInCents / 100)
    console.log("📊 [UTMify API] Status:", orderData.status)
    console.log("👤 [UTMify API] Customer:", {
      name: orderData.customer?.name,
      email: orderData.customer?.email,
      phone: orderData.customer?.phone
    })
    console.log("🔗 [UTMify API] Tracking parameters:", orderData.trackingParameters)
    console.log("🎯 [UTMify API] GCLID específico:", orderData.trackingParameters?.gclid)
    
    // VALIDAÇÃO: Garantir que temos parâmetros UTM
    if (!orderData.trackingParameters || Object.keys(orderData.trackingParameters).length === 0) {
      console.warn("⚠️ [UTMify API] ATENÇÃO: Nenhum parâmetro UTM encontrado!")
      console.warn("⚠️ [UTMify API] Isso pode afetar o tracking. Verifique se os UTMs estão sendo capturados.")
    }

    // Preparar dados para UTMify no formato correto da documentação
    const utmifyPayload = {
      orderId: orderData.orderId,
      platform: "RecarGames", // Nome da nossa plataforma
      paymentMethod: "pix",
      status: orderData.status === "pending" ? "waiting_payment" : "paid",
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      approvedDate: orderData.status === "paid" ? new Date().toISOString().replace('T', ' ').substring(0, 19) : null,
      refundedAt: null,
      customer: {
        name: orderData.customerData?.name || "",
        email: orderData.customerData?.email || "",
        phone: orderData.customerData?.phone || "",
        document: orderData.customerData?.document || "",
        country: "BR",
        ip: "unknown" // Será preenchido pelo middleware se disponível
      },
      products: [
        {
          id: "recarga-free-fire",
          name: "Recarga Free Fire",
          planId: null,
          planName: null,
          quantity: 1,
          priceInCents: orderData.amount || 1899
        }
      ],
      trackingParameters: {
        src: orderData.trackingParameters?.src || null,
        sck: orderData.trackingParameters?.sck || null,
        utm_source: orderData.trackingParameters?.utm_source || null,
        utm_campaign: orderData.trackingParameters?.utm_campaign || null,
        utm_medium: orderData.trackingParameters?.utm_medium || null,
        utm_content: orderData.trackingParameters?.utm_content || null,
        utm_term: orderData.trackingParameters?.utm_term || null,
        gclid: orderData.trackingParameters?.gclid || null,
        xcod: orderData.trackingParameters?.xcod || null,
        keyword: orderData.trackingParameters?.keyword || null,
        device: orderData.trackingParameters?.device || null,
        network: orderData.trackingParameters?.network || null,
        gad_source: orderData.trackingParameters?.gad_source || null,
        gbraid: orderData.trackingParameters?.gbraid || null
      },
      commission: {
        totalPriceInCents: orderData.amount || 1899,
        gatewayFeeInCents: Math.round((orderData.amount || 1899) * 0.04), // 4% taxa gateway
        userCommissionInCents: Math.round((orderData.amount || 1899) * 0.96) // 96% comissão
      },
      isTest: process.env.UTMIFY_TEST_MODE === 'true'
    }

    console.log("🎯 [UTMify API] FINAL UTMs sendo enviados para UTMify (PENDING):", JSON.stringify(utmifyPayload.trackingParameters, null, 2))
    console.log("📤 [UTMify API] PAYLOAD COMPLETO:", JSON.stringify(utmifyPayload, null, 2))
    console.log("🎯 [UTMify API] URL:", "https://api.utmify.com.br/api-credentials/orders")
    console.log("🔑 [UTMify API] Token:", process.env.UTMIFY_API_TOKEN ? `Presente (${process.env.UTMIFY_API_TOKEN.substring(0, 8)}...)` : "Ausente")
    console.log("🧪 [UTMify API] Test Mode:", process.env.UTMIFY_TEST_MODE)

    // Verificar se o token existe
    if (!process.env.UTMIFY_API_TOKEN) {
      throw new Error("UTMIFY_API_TOKEN não configurado no .env")
    }

    // Enviar para UTMify com URL e headers corretos
    const utmifyResponse = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": process.env.UTMIFY_API_TOKEN
      },
      body: JSON.stringify(utmifyPayload),
    })

    console.log("📡 [UTMify API] RESPONSE STATUS:", utmifyResponse.status)
    console.log("📊 [UTMify API] RESPONSE HEADERS:", Object.fromEntries(utmifyResponse.headers.entries()))

    const data = await utmifyResponse.json()
    
    if (utmifyResponse.ok) {
      console.log("✅ [UTMify API] SUCCESS RESPONSE:", JSON.stringify(data, null, 2))
    } else {
      console.error("❌ [UTMify API] ERROR RESPONSE:", {
        status: utmifyResponse.status,
        statusText: utmifyResponse.statusText,
        body: data
      })
    }

    return NextResponse.json({
      success: true,
      utmifyResponse: data,
      orderData,
      testMode: process.env.UTMIFY_TEST_MODE === 'true'
    })
  } catch (error) {
    console.error("💥 [UTMify API] EXCEPTION:", error)
    console.error("🔍 [UTMify API] Error details:", error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ 
      success: false,
      error: "Erro ao enviar dados para UTMify",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
