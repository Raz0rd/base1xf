import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 [TEST UTMify EXTERNAL] Testando chamada direta para UTMify API")
    
    // Verificar variáveis de ambiente
    const utmifyToken = process.env.UTMIFY_API_TOKEN
    const whitepageUrl = process.env.UTMIFY_WHITEPAGE_URL
    
    if (!utmifyToken) {
      return NextResponse.json({
        success: false,
        error: "UTMIFY_API_TOKEN não configurado"
      }, { status: 400 })
    }

    // Dados de teste no formato UTMify
    const utmifyPayload = {
      orderId: "test-external-" + Date.now(),
      platform: "RecarGames",
      paymentMethod: "pix",
      status: "waiting_payment",
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      approvedDate: null,
      refundedAt: null,
      customer: {
        name: "Teste Externo UTMify",
        email: "teste@external.com",
        phone: "11999999999",
        document: "12345678901",
        country: "BR",
        ip: "unknown"
      },
      products: [
        {
          id: "test-product",
          name: "Teste Recarga",
          planId: null,
          planName: null,
          quantity: 1,
          priceInCents: 8780
        }
      ],
      trackingParameters: {
        src: null,
        sck: null,
        utm_source: "google",
        utm_campaign: "CampanhaTesteUtms",
        utm_medium: "adsetTesteUtms",
        utm_content: "ContentTesteUtms",
        utm_term: "PlacementTesteUtms",
        gclid: null,
        xcod: null,
        keyword: "keyword",
        device: "device",
        network: "network",
        gad_source: null,
        gbraid: null
      },
      commission: {
        totalPriceInCents: 8780,
        gatewayFeeInCents: 8780,
        userCommissionInCents: 8780
      },
      isTest: process.env.UTMIFY_TEST_MODE === 'true'
    }

    console.log("🧪 [TEST UTMify EXTERNAL] Payload:", JSON.stringify(utmifyPayload, null, 2))

    // Headers para UTMify
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-api-token": utmifyToken
    }

    if (whitepageUrl) {
      headers["Referer"] = whitepageUrl
    }

    console.log("🧪 [TEST UTMify EXTERNAL] Headers:", headers)

    // Chamar UTMify diretamente
    const utmifyResponse = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method: "POST",
      headers,
      body: JSON.stringify(utmifyPayload),
    })

    console.log("🧪 [TEST UTMify EXTERNAL] Status resposta:", utmifyResponse.status)
    console.log("🧪 [TEST UTMify EXTERNAL] Headers resposta:", Object.fromEntries(utmifyResponse.headers.entries()))

    const responseText = await utmifyResponse.text()
    console.log("🧪 [TEST UTMify EXTERNAL] Resposta texto:", responseText)

    let utmifyResult
    try {
      utmifyResult = JSON.parse(responseText)
    } catch (e) {
      utmifyResult = { rawResponse: responseText }
    }

    return NextResponse.json({
      success: utmifyResponse.ok,
      message: utmifyResponse.ok ? "UTMify respondeu com sucesso" : "UTMify retornou erro",
      testPayload: utmifyPayload,
      utmifyResponse: {
        status: utmifyResponse.status,
        statusText: utmifyResponse.statusText,
        ok: utmifyResponse.ok,
        headers: Object.fromEntries(utmifyResponse.headers.entries()),
        data: utmifyResult
      },
      environment: {
        hasToken: !!utmifyToken,
        hasWhitepage: !!whitepageUrl,
        testMode: process.env.UTMIFY_TEST_MODE
      }
    })
  } catch (error) {
    console.error("🧪 [TEST UTMify EXTERNAL] Erro:", error)
    return NextResponse.json({
      success: false,
      error: "Erro ao testar UTMify externo",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
