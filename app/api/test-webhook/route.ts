import { type NextRequest, NextResponse } from "next/server"

// Endpoint para testar o webhook localmente
export async function POST(request: NextRequest) {
  try {
    const { transactionId, status = "paid" } = await request.json()
    
    if (!transactionId) {
      return NextResponse.json({ error: "transactionId é obrigatório" }, { status: 400 })
    }

    // Simular payload do BlackCat
    const mockPayload = {
      type: "transaction",
      url: "https://webhook.exemplo.com",
      objectId: transactionId,
      data: {
        id: parseInt(transactionId),
        tenantId: "abcd1234-5678-90ab-cdef-1234567890ab",
        companyId: 99,
        amount: 5000, // R$ 50,00 em centavos
        currency: "BRL",
        paymentMethod: "pix",
        status: status,
        installments: 1,
        paidAt: status === "paid" ? new Date().toISOString() : null,
        paidAmount: status === "paid" ? 5000 : 0,
        refundedAt: null,
        refundedAmount: 0,
        postbackUrl: "https://webhook.exemplo.com",
        metadata: "{ orderId: 123 }",
        ip: "192.168.1.1",
        externalRef: `pedido-${transactionId}`,
        secureId: `fake-secure-id-${transactionId}`,
        secureUrl: `https://pagamento.exemplo.com/pagar/fake-secure-id-${transactionId}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customer: {
          id: 789,
          name: "Carlos Teste",
          email: "carlos.teste@exemplo.com",
          phone: "11987654321",
          birthdate: "1995-08-20",
          document: {
            type: "cpf",
            number: "00011122233"
          }
        },
        pix: {
          qrcode: "00020101021226870014br.gov.bcb.pix2569pix.pagamento.exemplo.com/pix/v2/abc1234504000053039865802BR5909Carlos EX6008EXEMPLO62070503***6304FAKE",
          end2EndId: null,
          receiptUrl: null,
          expirationDate: "2025-04-30"
        }
      }
    }

    console.log("[v0] Sending test webhook to /api/webhook")

    // Enviar para o webhook real
    // Obter URL atual dinamicamente
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const baseUrl = `${protocol}://${host}`
    
    const webhookResponse = await fetch(`${baseUrl}/api/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockPayload),
    })

    const webhookResult = await webhookResponse.json()

    return NextResponse.json({
      success: true,
      message: "Test webhook sent successfully",
      mockPayload,
      webhookResponse: webhookResult
    })
  } catch (error) {
    console.error("[v0] Error sending test webhook:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Error sending test webhook" 
    }, { status: 500 })
  }
}
