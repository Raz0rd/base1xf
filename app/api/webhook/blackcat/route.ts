import { NextRequest, NextResponse } from 'next/server'

// Webhook do BlackCat para registrar pagamentos
export async function POST(request: NextRequest) {
  try {
    console.log('[BLACKCAT-WEBHOOK] Recebido webhook de pagamento')
    
    const body = await request.json()
    console.log('[BLACKCAT-WEBHOOK] Dados:', JSON.stringify(body, null, 2))
    
    // Extrair dados do webhook do BlackCat
    const {
      orderId,
      transactionId,
      amount,
      status,
      customerInfo
    } = body
    
    // Verificar se é um pagamento aprovado
    if (status === 'paid' || status === 'approved' || status === 'completed') {
      console.log(`[BLACKCAT-WEBHOOK] Pagamento aprovado: ${orderId}`)
      
      console.log(`[BLACKCAT-WEBHOOK] Pagamento processado: ${orderId}`)
      
      // Aqui você pode adicionar outras lógicas:
      // - Enviar email de confirmação
      // - Atualizar status do pedido
      // - Processar entrega do produto
      
      return NextResponse.json({ 
        success: true, 
        message: 'Pagamento processado com sucesso',
        orderId 
      })
    } else {
      console.log(`[BLACKCAT-WEBHOOK] Status não processado: ${status}`)
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook recebido mas não processado',
        status 
      })
    }
    
  } catch (error) {
    console.error('[BLACKCAT-WEBHOOK] Erro ao processar webhook:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

// Método GET para testar se o webhook está funcionando
export async function GET() {
  return NextResponse.json({ 
    message: 'BlackCat Webhook está funcionando',
    timestamp: new Date().toISOString()
  })
}
