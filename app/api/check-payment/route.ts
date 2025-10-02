import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const authToken = process.env.BLACKCAT_API_AUTH
    if (!authToken) {
      console.error("❌ [Check Payment] BLACKCAT_API_AUTH não configurado")
      return NextResponse.json({ error: "Configuração de API não encontrada" }, { status: 500 })
    }

    const { transactionId } = await request.json()
    
    if (!transactionId) {
      console.error("❌ [Check Payment] Transaction ID ausente")
      return NextResponse.json({ error: "ID da transação é obrigatório" }, { status: 400 })
    }

    console.log("\n🔍 [Check Payment] Verificando status do pagamento:", transactionId)
    console.log("🎯 [Check Payment] URL:", `https://api.blackcatpagamentos.com/v1/transactions/${transactionId}`)

    const response = await fetch(`https://api.blackcatpagamentos.com/v1/transactions/${transactionId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: authToken,
      },
    })

    console.log("📡 [Check Payment] Response Status:", response.status)
    console.log("📊 [Check Payment] Response Headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ [Check Payment] ERROR RESPONSE:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()
    console.log("✅ [Check Payment] SUCCESS RESPONSE:", JSON.stringify(data, null, 2))

    // Normalizar o status de pagamento
    const status = data.status || data.payment_status || data.state || 'pending'
    const isPaid = status === 'paid' || status === 'approved' || status === 'completed' || status === 'success'
    
    console.log("🔍 [Check Payment] Status Analysis:", {
      originalStatus: data.status,
      normalizedStatus: status,
      isPaid: isPaid
    })

    // Se o pagamento foi aprovado, processar conversão
    if (isPaid) {
      console.log("✅ [Check Payment] Pagamento confirmado para transação:", transactionId)
      
      // Tentar processar webhook interno para conversão
      try {
        const webhookPayload = {
          transactionId,
          orderId: data.orderId || data.reference || transactionId,
          status: "paid",
          amount: data.amount || data.value || 0,
          customerData: data.customer || data.payer,
          trackingParameters: data.trackingParameters || {}
        }
        
        console.log("🔄 [Check Payment] Enviando webhook interno:", JSON.stringify(webhookPayload, null, 2))
        
        const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment-webhook`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookPayload),
        })

        if (webhookResponse.ok) {
          const webhookData = await webhookResponse.json()
          console.log("✅ [Check Payment] Webhook processado com sucesso:", webhookData)
        } else {
          const errorText = await webhookResponse.text()
          console.error("❌ [Check Payment] Erro no webhook:", {
            status: webhookResponse.status,
            body: errorText
          })
        }
      } catch (error) {
        console.error("💥 [Check Payment] Exceção no webhook:", error)
      }
    }

    return NextResponse.json({
      transactionId,
      status,
      isPaid,
      originalData: data
    })
  } catch (error) {
    console.error("💥 [Check Payment] EXCEPTION:", error)
    console.error("🔍 [Check Payment] Error details:", error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: "Erro ao verificar status do pagamento" }, { status: 500 })
  }
}
