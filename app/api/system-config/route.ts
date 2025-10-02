import { NextRequest, NextResponse } from 'next/server';

// Configuração compartilhada entre middleware e admin
let sharedConfig = {
  antibotEnabled: true
};

export async function GET(request: NextRequest) {
  // Esta API é usada pelo middleware para obter a configuração atual
  return NextResponse.json({
    success: true,
    config: sharedConfig
  });
}

export async function POST(request: NextRequest) {
  // Esta API é usada pelo admin para atualizar a configuração
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  if (token !== 'arzadmin123') {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    if (body.antibotEnabled !== undefined) {
      sharedConfig.antibotEnabled = body.antibotEnabled;
      console.log(`[SYSTEM CONFIG] Antibot atualizado: ${sharedConfig.antibotEnabled ? 'ATIVADO' : 'DESATIVADO'}`);
    }

    return NextResponse.json({
      success: true,
      config: sharedConfig
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
