import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 [TEST REAL WEBHOOK] Testando webhook com dados reais do BlackCat")
    
    // Dados EXATOS que o BlackCat enviou (baseado no seu exemplo)
    const realBlackCatData = {
      id: '20924386',
      type: 'transaction',
      url: 'https://www.garena-recargadigital.vip/api/payment-webhook',
      objectId: '20924386',
      data: {
        id: 20924386,
        tenantId: 'ccaca050-bd57-4c10-a050-55d7f8e492e6',
        companyId: 18498,
        amount: 1999, // R$ 19,99 em centavos
        currency: 'BRL',
        paymentMethod: 'pix',
        status: 'waiting_payment',
        installments: 1,
        paidAt: null,
        paidAmount: 0,
        refundedAt: null,
        refundedAmount: 0,
        redirectUrl: null,
        returnUrl: null,
        postbackUrl: 'https://www.garena-recargadigital.vip/api/payment-webhook',
        metadata: '{"utmParams":{"src":null,"sck":null,"utm_source":"google","utm_campaign":"22956871596","utm_medium":"182499181377","utm_content":"771788200935","utm_term":null,"xcod":null,"keyword":"recarga diamante free fire","device":"m","network":"g","gclid":"Cj0KCQjwwsrFBhD6ARIsAPnUFD3OZzxkdZykE1LyzoymIr8DfIwp2m0uDxiF3Ud5y8OJqNvwIHDiqN0aAlI6EALw_wcB","gad_source":"1","gbraid":"0AAAABBAMAH0FQ_ZcMGoP3ztOI1QIBToEQ"}}',
        ip: null,
        externalRef: null,
        secureId: 'cc0f0098-b8a5-4287-921c-34fb71db8ac8',
        secureUrl: 'cc0f0098-b8a5-4287-921c-34fb71db8ac8',
        createdAt: '2025-10-03T03:10:16.818Z',
        updatedAt: '2025-10-03T03:10:16.818Z',
        payer: null,
        traceable: false,
        authorizationCode: null,
        basePrice: null,
        interestRate: null,
        items: [
          {
            id: 'recarga-free-fire',
            name: 'Recarga Free Fire',
            quantity: 1,
            price: 1999
          }
        ],
        customer: {
          id: 18065436,
          name: 'Thiago teste',
          email: 'neuzelidesteixeira@gmail.com',
          phone: '85981471273',
          birthdate: null,
          createdAt: '2025-09-11T01:33:15.651Z',
          externalRef: null,
          document: {
            number: '12345678901',
            type: 'cpf'
          },
          address: null
        },
        fee: {
          netAmount: 1194,
          estimatedFee: 304,
          fixedAmount: 200,
          spreadPercent: 699,
          currency: 'BRL'
        },
        splits: [{}],
        refunds: [],
        pix: {
          qrcode: '00020126860014br.gov.bcb.pix2564pix.ecomovi.com.br/qr/v3/at/a84af388-195a-4024-bee5-2f30a634bbd85204000053039865802BR5925KAPTPAY_TECNOLOGIA_DE_PAG6009ARAPONGAS62070503***6304F371',
          end2EndId: null,
          receiptUrl: null,
          expirationDate: '2025-10-05'
        },
        boleto: null,
        card: null,
        refusedReason: null,
        shipping: null,
        delivery: null,
        threeDS: null
      }
    }

    console.log("🧪 [TEST REAL WEBHOOK] Dados simulados:", JSON.stringify(realBlackCatData, null, 2))

    // Testar nossa rota de webhook diretamente
    const webhookUrl = `https://${request.headers.get('host')}/api/payment-webhook`
    console.log("🧪 [TEST REAL WEBHOOK] Testando rota:", webhookUrl)

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "BlackCat-Webhook/1.0",
        "X-Webhook-Source": "blackcat-real-test"
      },
      body: JSON.stringify(realBlackCatData),
    })

    console.log("🧪 [TEST REAL WEBHOOK] Status resposta:", response.status)
    
    const responseText = await response.text()
    console.log("🧪 [TEST REAL WEBHOOK] Resposta texto:", responseText)

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      responseData = { rawResponse: responseText }
    }

    return NextResponse.json({
      success: response.ok,
      message: response.ok ? "Webhook real testado com sucesso" : "Erro no webhook real",
      testData: realBlackCatData,
      webhookResponse: {
        status: response.status,
        ok: response.ok,
        data: responseData,
        rawResponse: responseText
      },
      instructions: {
        message: "Verifique o console para logs detalhados",
        expectedLogs: [
          "🚨 [DEBUG WEBHOOK] Webhook foi chamado!",
          "🚨 [DEBUG WEBHOOK] Detectado formato BlackCat",
          "🚨 [DEBUG UTMify] Tentando enviar pending para UTMify",
          "🎉 [WEBHOOK SUCCESS] Processamento completo!"
        ]
      }
    })
  } catch (error) {
    console.error("🧪 [TEST REAL WEBHOOK] Erro:", error)
    return NextResponse.json({
      success: false,
      error: "Erro ao testar webhook real",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
