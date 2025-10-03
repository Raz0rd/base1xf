import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 [TEST WEBHOOK DIRECT] Testando webhook diretamente")
    
    // Dados EXATOS que o BlackCat envia
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

    console.log("🧪 [TEST WEBHOOK DIRECT] Processando dados como se fosse o webhook...")

    // Simular o processamento do webhook diretamente (sem fetch)
    const transaction = exactBlackCatData.data
    const transactionId = transaction.id.toString()
    const status = transaction.status
    const isPaid = status === 'paid' || status === 'approved'
    const isWaitingPayment = status === 'waiting_payment'

    console.log("🧪 [TEST WEBHOOK DIRECT] Transaction details:", {
      id: transactionId,
      status,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      customer: transaction.customer.name,
      isPaid,
      isWaitingPayment
    })

    // Verificar se deve processar
    if (!isPaid && !isWaitingPayment) {
      return NextResponse.json({
        success: false,
        message: "Status não processável: " + status,
        status,
        shouldProcess: false
      })
    }

    // Extrair UTMs do metadata
    let utmParams = {}
    try {
      if (transaction.metadata) {
        const metadata = JSON.parse(transaction.metadata)
        utmParams = metadata.utmParams || {}
        console.log("🧪 [TEST WEBHOOK DIRECT] UTMs extraídos:", utmParams)
      }
    } catch (e) {
      console.error("🧪 [TEST WEBHOOK DIRECT] Erro ao parsear metadata:", e)
    }

    // Verificar variáveis de ambiente
    const utmifyToken = process.env.UTMIFY_API_TOKEN
    const utmifyEnabled = process.env.UTMIFY_ENABLED === 'true'

    console.log("🧪 [TEST WEBHOOK DIRECT] Configuração UTMify:", {
      enabled: utmifyEnabled,
      hasToken: !!utmifyToken,
      UTMIFY_ENABLED: process.env.UTMIFY_ENABLED
    })

    return NextResponse.json({
      success: true,
      message: "Teste webhook direto executado",
      testData: {
        transactionId,
        status,
        amount: transaction.amount,
        customer: transaction.customer.name,
        isPaid,
        isWaitingPayment,
        shouldProcess: isPaid || isWaitingPayment
      },
      utmData: {
        hasMetadata: !!transaction.metadata,
        utmParams,
        utmCount: Object.keys(utmParams).length
      },
      environment: {
        utmifyEnabled,
        hasToken: !!utmifyToken,
        UTMIFY_ENABLED: process.env.UTMIFY_ENABLED,
        NODE_ENV: process.env.NODE_ENV
      },
      nextSteps: {
        shouldSendToUTMify: utmifyEnabled && (isPaid || isWaitingPayment),
        utmifyStatus: isPaid ? "paid" : "waiting_payment"
      }
    })
  } catch (error) {
    console.error("🧪 [TEST WEBHOOK DIRECT] Erro:", error)
    return NextResponse.json({
      success: false,
      error: "Erro no teste webhook direto",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
