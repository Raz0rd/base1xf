import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { transactionId, status = "pending" } = await request.json()
    
    if (!transactionId) {
      return NextResponse.json({
        success: false,
        error: "transactionId é obrigatório"
      }, { status: 400 })
    }

    console.log("🧪 [SIMULATE BLACKCAT] Simulando webhook BlackCat")
    console.log("🧪 [SIMULATE BLACKCAT] Transaction ID:", transactionId)
    console.log("🧪 [SIMULATE BLACKCAT] Status:", status)

    // Simular dados exatos que o BlackCat enviaria
    const blackcatWebhookData = {
      orderId: transactionId,
      transactionId: transactionId,
      status: status,
      amount: 8780, // R$ 87,80 em centavos
      customerData: {
        name: "Cliente Teste",
        email: "cliente@teste.com",
        phone: "11999999999",
        document: "12345678901"
      },
      // Dados extras que BlackCat pode enviar
      paymentMethod: "pix",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log("🧪 [SIMULATE BLACKCAT] Dados do webhook:", blackcatWebhookData)

    // Fazer requisição POST direta para nosso webhook
    const webhookUrl = `https://${request.headers.get('host')}/api/payment-webhook`
    console.log("🧪 [SIMULATE BLACKCAT] Enviando para:", webhookUrl)

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "BlackCat-Webhook/1.0",
        "X-Webhook-Source": "blackcat-simulation"
      },
      body: JSON.stringify(blackcatWebhookData),
    })

    const responseData = await response.json()

    console.log("🧪 [SIMULATE BLACKCAT] Resposta webhook:", response.status, responseData)

    return NextResponse.json({
      success: true,
      message: "Webhook BlackCat simulado com sucesso",
      simulatedData: blackcatWebhookData,
      webhookResponse: {
        status: response.status,
        ok: response.ok,
        data: responseData
      },
      instructions: {
        message: "Verifique o console para logs do webhook",
        expectedLogs: [
          "🚨 [DEBUG WEBHOOK] Webhook foi chamado!",
          "🚨 [DEBUG UTMify] Tentando enviar " + status + " para UTMify",
          "🎉 [WEBHOOK SUCCESS] Processamento completo!"
        ]
      }
    })
  } catch (error) {
    console.error("🧪 [SIMULATE BLACKCAT] Erro:", error)
    return NextResponse.json({
      success: false,
      error: "Erro ao simular webhook BlackCat",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
