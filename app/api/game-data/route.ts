import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const uid = searchParams.get('uid')
    
    if (!uid) {
      return NextResponse.json({ 
        success: false, 
        error: 'UID é obrigatório' 
      }, { status: 400 })
    }

    // Validar UID (apenas números)
    if (!/^\d+$/.test(uid)) {
      return NextResponse.json({ 
        success: false, 
        error: 'UID deve conter apenas números' 
      }, { status: 400 })
    }

    // URL e chave escondidas no servidor
    const API_URL = 'https://api.recargatop.sbs/api/data/br'
    const API_KEY = 'razord'
    
    // Fazer requisição para a API externa
    const response = await fetch(`${API_URL}?uid=${uid}&key=${API_KEY}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'RecargaJogo/1.0',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao consultar dados do jogador' 
      }, { status: response.status })
    }

    const data = await response.json()
    
    // Retornar apenas os dados necessários (filtrar se necessário)
    return NextResponse.json({ 
      success: true, 
      data: data 
    })

  } catch (error) {
    console.error('Erro na API game-data:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}
