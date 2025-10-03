import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 [SIMULATE REAL BLACKCAT] Simulando webhook EXATO do BlackCat")
    
    // Dados EXATOS que o BlackCat enviou
    const exactBlackCatData = {
      id: '20925584',
      type: 'transaction',
      url: 'https://www.garena-recargadigital.vip/api/webhook',
      objectId: '20925584',
      data: {
        id: 20925584,
        tenantId: 'ccaca050-bd57-4c10-a050-55d7f8e492e6',
        companyId: 18498,
        amount: 8780,
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
        postbackUrl: 'https://www.garena-recargadigital.vip/api/webhook',
        metadata: '{"utmParams":{"src":null,"sck":null,"utm_source":"google","utm_campaign":"CampanhaTesteUtms","utm_medium":"adsetTesteUtms","utm_content":"ContentTesteUtms","utm_term":"PlacementTesteUtms","xcod":null,"keyword":"keyword","device":"device","network":"network","gclid":null,"gad_source":null,"gbraid":null}}',
        ip: null,
        externalRef: null,
        secureId: '7bea93d3-5b03-472f-a909-efc86e45675f',
        secureUrl: '7bea93d3-5b03-472f-a909-efc86e45675f',
        createdAt: '2025-10-03T03:36:23.985Z',
        updatedAt: '2025-10-03T03:36:23.985Z',
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
            price: 8780
          }
        ],
        customer: {
          id: 17305860,
          name: 'NEUZELIDES TEIXEIRA DE FIGUEREDO',
          email: 'marciobueno4777@gmail.com',
          phone: '85985687458',
          birthdate: null,
          createdAt: '2025-09-06T14:51:53.194Z',
          externalRef: null,
          document: {
            number: '12345678901',
            type: 'cpf'
          },
          address: null
        },
        fee: {
          netAmount: 7966,
          estimatedFee: 813,
          fixedAmount: 200,
          spreadPercent: 699,
          currency: 'BRL'
        },
        splits: [{}],
        refunds: [],
        pix: {
          qrcode: '00020126860014br.gov.bcb.pix2564pix.ecomovi.com.br/qr/v3/at/7d80fe0c-92d9-4065-b2fb-7f1c572423c15204000053039865802BR5925KAPTPAY_TECNOLOGIA_DE_PAG6009ARAPONGAS62070503***63048F3F',
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

    console.log("🧪 [SIMULATE REAL BLACKCAT] Payload completo:", JSON.stringify(exactBlackCatData, null, 2))

    // Enviar para nossa rota webhook REAL
    const webhookUrl = `https://${request.headers.get('host')}/api/webhook`
    console.log("🧪 [SIMULATE REAL BLACKCAT] Enviando para:", webhookUrl)

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "BlackCat-Webhook/2.0",
        "X-Webhook-Source": "blackcat-exact-simulation",
        "X-Webhook-Event": "transaction.waiting_payment"
      },
      body: JSON.stringify(exactBlackCatData),
    })

    console.log("🧪 [SIMULATE REAL BLACKCAT] Status resposta:", response.status)
    console.log("🧪 [SIMULATE REAL BLACKCAT] Headers resposta:", Object.fromEntries(response.headers.entries()))
    
    const responseText = await response.text()
    console.log("🧪 [SIMULATE REAL BLACKCAT] Resposta texto:", responseText)

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      responseData = { rawResponse: responseText }
    }

    return NextResponse.json({
      success: response.ok,
      message: response.ok ? "Simulação BlackCat EXATA executada com sucesso" : "Erro na simulação BlackCat EXATA",
      simulatedData: exactBlackCatData,
      webhookResponse: {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        rawResponse: responseText
      },
      expectedBehavior: {
        shouldProcess: true,
        expectedStatus: "waiting_payment",
        expectedUTMs: {
          utm_source: "google",
          utm_campaign: "CampanhaTesteUtms",
          utm_medium: "adsetTesteUtms",
          utm_content: "ContentTesteUtms",
          utm_term: "PlacementTesteUtms",
          keyword: "keyword",
          device: "device",
          network: "network"
        },
        shouldSendToUTMify: true,
        utmifyStatus: "waiting_payment"
      },
      debugInfo: {
        webhookUrl,
        transactionId: "20925584",
        amount: 8780,
        status: "waiting_payment",
        hasMetadata: true,
        hasUTMs: true
      }
    })
  } catch (error) {
    console.error("🧪 [SIMULATE REAL BLACKCAT] Erro:", error)
    return NextResponse.json({
      success: false,
      error: "Erro ao simular BlackCat EXATO",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
