import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json()
    
    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID é obrigatório" }, { status: 400 })
    }

    console.log("[v0] Simulating payment approval for transaction:", transactionId)

    // Simular webhook de pagamento aprovado
    // Obter URL atual dinamicamente
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const baseUrl = `${protocol}://${host}`
    
    const webhookResponse = await fetch(`${baseUrl}/api/payment-webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transactionId,
        orderId: `764e779c-c5a0-484b-be71-d4a4567c98c4`, // Usar o ID real do exemplo
        status: "paid",
        amount: 18.99,
        customerData: {
          name: "Libridia Gomares Difunabes",
          email: "ddswds@gmail.com",
          phone: "37999822783",
          document: "012.345.678-90"
        },
        trackingParameters: {
          gclid: "CjwKCAiA1L2jBhBPEiwA0GP9UHxYz1234567890",
          utm_source: "google",
          utm_medium: "cpc",
          utm_campaign: "23056478620",
          utm_term: "recarga+free+fire",
          utm_content: "775683396409"
        }
      }),
    })

    if (webhookResponse.ok) {
      const webhookData = await webhookResponse.json()
      console.log("[v0] Simulated payment webhook processed successfully:", webhookData)
      
      return NextResponse.json({
        success: true,
        message: "Payment simulated and conversion processed",
        transactionId,
        webhookResult: webhookData
      })
    } else {
      const errorText = await webhookResponse.text()
      console.error("[v0] Error processing simulated webhook:", errorText)
      
      return NextResponse.json({
        success: false,
        error: "Error processing simulated webhook",
        details: errorText
      }, { status: 500 })
    }

  } catch (error) {
    console.error("[v0] Error simulating payment:", error)
    
    return NextResponse.json({
      success: false,
      error: "Error simulating payment",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
