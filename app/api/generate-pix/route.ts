import { type NextRequest, NextResponse } from "next/server"

// Função para obter o IP real do cliente
function getClientIp(req: NextRequest): string {
  const headers = [
    'cf-connecting-ip',        // Cloudflare
    'x-real-ip',              // Nginx
    'x-forwarded-for',        // Proxy padrão
    'x-client-ip',            // Apache
  ];
  
  for (const header of headers) {
    const value = req.headers.get(header);
    if (value) {
      const ip = value.split(',')[0].trim();
      if (ip && ip !== 'unknown') {
        return ip;
      }
    }
  }
  
  return req.ip || 'unknown';
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const authToken = process.env.BLACKCAT_API_AUTH
    console.log("\n🐈 [BlackCat] Verificando autenticação:", authToken ? "✓ Token presente" : "✗ Token ausente")
    
    if (!authToken) {
      console.error("❌ [BlackCat] BLACKCAT_API_AUTH não configurado")
      return NextResponse.json({ error: "Configuração de API não encontrada" }, { status: 500 })
    }

    const body = await request.json()
    console.log("📤 [BlackCat] REQUEST BODY:", JSON.stringify(body, null, 2))
    
    // Log dos parâmetros UTM recebidos para análise
    console.log("🔗 [UTM PARAMS] Parâmetros recebidos para PIX:")
    console.log("📊 [UTM PARAMS] UTM Source:", body.utmParams?.utm_source || 'N/A')
    console.log("📊 [UTM PARAMS] UTM Medium:", body.utmParams?.utm_medium || 'N/A')
    console.log("📊 [UTM PARAMS] UTM Campaign:", body.utmParams?.utm_campaign || 'N/A')
    console.log("📊 [UTM PARAMS] UTM Term:", body.utmParams?.utm_term || 'N/A')
    console.log("📊 [UTM PARAMS] UTM Content:", body.utmParams?.utm_content || 'N/A')
    console.log("📊 [UTM PARAMS] GCLID:", body.utmParams?.gclid || 'N/A')
    console.log("📊 [UTM PARAMS] FBCLID:", body.utmParams?.fbclid || 'N/A')
    console.log("📊 [UTM PARAMS] Todos os UTMs:", JSON.stringify(body.utmParams || {}, null, 2))

    // Obter URL atual dinamicamente
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const baseUrl = `${protocol}://${host}`
    
    console.log("🌐 [BlackCat] URL dinâmica detectada:", baseUrl)

    const blackcatPayload = {
      amount: body.amount,
      paymentMethod: "pix",
      postbackUrl: `${baseUrl}/api/webhook`,
      metadata: JSON.stringify({
        orderId: body.orderId || null,
        utmParams: body.utmParams || {}
      }),
      items: [
        {
          title: "Recarga",
          unitPrice: body.amount,
          tangible: false,
          quantity: 1,
        },
      ],
      customer: body.customer,
    }
    
    console.log("📦 [BlackCat] PAYLOAD ENVIADO:", JSON.stringify(blackcatPayload, null, 2))
    console.log("🎯 [BlackCat] URL:", "https://api.blackcatpagamentos.com/v1/transactions")
    console.log("🔑 [BlackCat] Auth Token:", authToken.substring(0, 10) + "...")
    
    const response = await fetch("https://api.blackcatpagamentos.com/v1/transactions", {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: authToken,
        "content-type": "application/json",
      },
      body: JSON.stringify(blackcatPayload),
    })

    console.log("📡 [BlackCat] RESPONSE STATUS:", response.status)
    console.log("📊 [BlackCat] RESPONSE HEADERS:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ [BlackCat] ERROR RESPONSE:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      // Retornar erro mais detalhado
      return NextResponse.json({ 
        error: `Erro na API de pagamento: ${response.status}`,
        details: errorText,
        status: response.status
      }, { status: response.status })
    }

    const data = await response.json()
    console.log("✅ [BlackCat] SUCCESS RESPONSE:", JSON.stringify(data, null, 2))

    // Extrair informações importantes da resposta
    const transactionId = data.id || data.transaction_id || data.transactionId || data.payment_id
    const pixCode = data.pix?.qrcode || data.pixCode || data.pix_code || data.code || data.qr_code_text || data.payment_code
    const qrCodeImage = data.qrCode || data.qr_code || data.qr_code_url || data.pix?.qr_code_url
    
    console.log("🔍 [BlackCat] DADOS EXTRAÍDOS:", {
      transactionId,
      pixCode: pixCode ? `${pixCode.substring(0, 50)}...` : null,
      qrCodeImage: qrCodeImage ? "Presente" : "Ausente"
    })

    // Retornar dados normalizados
    // Registrar conversão de QR gerado
    try {
      console.log('✅ [PIX] QR Code gerado com sucesso')
    } catch (error) {
      console.error('[PIX] Erro ao registrar conversão QR:', error)
    }
    
    const normalizedResponse = {
      ...data,
      transactionId,
      pixCode,
      qrCode: qrCodeImage,
      success: true
    }
    
    console.log("🎉 [BlackCat] RESPOSTA NORMALIZADA:", JSON.stringify(normalizedResponse, null, 2))
    
    return NextResponse.json(normalizedResponse)
  } catch (error) {
    console.error("💥 [BlackCat] EXCEPTION:", error)
    console.error("🔍 [BlackCat] Error details:", error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: "Erro ao gerar pagamento PIX" }, { status: 500 })
  }
}
