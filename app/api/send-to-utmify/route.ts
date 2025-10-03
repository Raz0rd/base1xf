import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const orderData = await request.json()
    
    console.log("\n🎯 [UTMify API] Processando pedido para UTMify")
    console.log("📊 [UTMify API] Status:", orderData.status)
    console.log("💰 [UTMify API] Valor:", orderData.amount)
    
    // VALIDAÇÃO: Garantir que temos valor obrigatório
    if (!orderData.amount || orderData.amount <= 0) {
      throw new Error("Amount é obrigatório e deve ser maior que 0")
    }
    
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
          priceInCents: Math.round(orderData.amount * 100)
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
        totalPriceInCents: Math.round(orderData.amount * 100),
        gatewayFeeInCents: Math.round(orderData.amount * 100),
        userCommissionInCents: Math.round(orderData.amount * 100)
      },
      isTest: process.env.UTMIFY_TEST_MODE === 'true'
    }

    console.log("🎯 [UTMify API] Enviando dados para UTMify...")
    console.log("📊 [UTMify API] Status:", utmifyPayload.status)
    console.log("💰 [UTMify API] Valor em centavos:", utmifyPayload.commission.totalPriceInCents)

    // Verificar se o token existe
    if (!process.env.UTMIFY_API_TOKEN) {
      throw new Error("UTMIFY_API_TOKEN não configurado no .env")
    }

    // Obter URL da whitepage para o Referer
    const whitepageUrl = process.env.UTMIFY_WHITEPAGE_URL;
    
    // Preparar headers com Referer da whitepage
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-api-token": process.env.UTMIFY_API_TOKEN
    };
    
    // Adicionar Referer se whitepage URL estiver configurada
    if (whitepageUrl) {
      headers["Referer"] = whitepageUrl;
      console.log("🔗 [UTMify API] Usando Referer:", whitepageUrl);
    } else {
      console.warn("⚠️ [UTMify API] UTMIFY_WHITEPAGE_URL não configurada - Referer não será enviado");
    }

    // Enviar para UTMify com URL e headers corretos
    const utmifyResponse = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method: "POST",
      headers,
      body: JSON.stringify(utmifyPayload),
    })

    const data = await utmifyResponse.json()
    
    if (utmifyResponse.ok) {
      console.log("✅ [UTMify API] Dados enviados com sucesso")
    } else {
      console.error("❌ [UTMify API] Erro ao enviar dados:", utmifyResponse.status)
    }

    return NextResponse.json({
      success: utmifyResponse.ok,
      message: utmifyResponse.ok ? "Dados enviados para UTMify" : "Erro ao enviar para UTMify"
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
