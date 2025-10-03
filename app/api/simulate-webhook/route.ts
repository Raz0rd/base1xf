import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { transactionId, status } = await request.json()
    
    if (!transactionId) {
      return NextResponse.json({
        success: false,
        error: "transactionId é obrigatório"
      }, { status: 400 })
    }

    // Simular dados de webhook do BlackCat
    const simulatedWebhookData = {
      orderId: transactionId,
      transactionId: transactionId,
      status: status || "pending",
      amount: 8780, // R$ 87,80 em centavos
      customerData: {
        name: "Teste Simulado",
        email: "teste@teste.com",
        phone: "11999999999",
        document: "12345678901"
      }
    }

    console.log("🧪 [SIMULATE WEBHOOK] Simulando webhook:", simulatedWebhookData)

    // Chamar nosso próprio webhook
    const webhookResponse = await fetch(`${request.nextUrl.origin}/api/payment-webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(simulatedWebhookData),
    })

    const webhookResult = await webhookResponse.json()

    return NextResponse.json({
      success: true,
      message: "Webhook simulado enviado",
      simulatedData: simulatedWebhookData,
      webhookResponse: {
        status: webhookResponse.status,
        data: webhookResult
      }
    })
  } catch (error) {
    console.error("🧪 [SIMULATE WEBHOOK] Erro:", error)
    return NextResponse.json({
      success: false,
      error: "Erro ao simular webhook",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
