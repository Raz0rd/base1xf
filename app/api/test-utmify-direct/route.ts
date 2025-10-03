import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 [TEST UTMify] Testando envio direto para UTMify")
    
    // Dados de teste
    const testOrderData = {
      orderId: "test-" + Date.now(),
      amount: 87.80,
      customerData: {
        name: "Teste UTMify",
        email: "teste@utmify.com",
        phone: "11999999999",
        document: "12345678901"
      },
      trackingParameters: {
        utm_source: "google",
        utm_campaign: "CampanhaTesteUtms",
        utm_medium: "adsetTesteUtms",
        utm_content: "ContentTesteUtms",
        utm_term: "PlacementTesteUtms",
        keyword: "keyword",
        device: "device",
        network: "network"
      },
      status: "pending"
    }

    console.log("🧪 [TEST UTMify] Dados de teste:", testOrderData)

    // Chamar API send-to-utmify diretamente
    const utmifyUrl = `https://${request.headers.get('host')}/api/send-to-utmify`
    console.log("🧪 [TEST UTMify] Chamando:", utmifyUrl)

    const utmifyResponse = await fetch(utmifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testOrderData),
    })

    console.log("🧪 [TEST UTMify] Status resposta:", utmifyResponse.status)
    
    const utmifyResult = await utmifyResponse.json()
    console.log("🧪 [TEST UTMify] Resultado:", utmifyResult)

    return NextResponse.json({
      success: true,
      message: "Teste UTMify direto executado",
      testData: testOrderData,
      utmifyResponse: {
        status: utmifyResponse.status,
        ok: utmifyResponse.ok,
        data: utmifyResult
      }
    })
  } catch (error) {
    console.error("🧪 [TEST UTMify] Erro:", error)
    return NextResponse.json({
      success: false,
      error: "Erro ao testar UTMify",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
