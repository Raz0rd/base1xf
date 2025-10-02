import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()
    
    console.log('[CONTACT FORM] Dados recebidos:', {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message?.substring(0, 50) + '...'
    })
    
    // Simular processamento do formulário
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Sempre retornar sucesso (simulação)
    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('[CONTACT FORM] Erro:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Erro ao enviar mensagem. Tente novamente.'
    }, { status: 500 })
  }
}
