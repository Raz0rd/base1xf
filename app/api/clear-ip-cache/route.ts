import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = "arzadmin123"

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Limpar cache de IP do middleware
    if ((global as any).__IP_CACHE__) {
      delete (global as any).__IP_CACHE__
      console.log('[CLEAR-CACHE] Cache de IP limpo')
    }

    return NextResponse.json({
      success: true,
      message: 'Cache de IP limpo com sucesso'
    })
  } catch (error) {
    console.error('[CLEAR-CACHE] Erro:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
