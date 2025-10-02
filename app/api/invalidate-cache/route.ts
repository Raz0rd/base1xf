import { NextRequest, NextResponse } from 'next/server';

// API para invalidar cache do middleware em tempo real
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (token !== 'arzadmin123') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Invalidar todos os caches
    (global as any).__CACHE_INVALIDATED__ = true;
    (global as any).__IP_CACHE_TIME__ = 0; // Forçar reload das listas de IP
    
    console.log('[CACHE-INVALIDATOR] ⚡ Cache invalidado - próxima requisição será atualizada');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache invalidado com sucesso',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[CACHE-INVALIDATOR] Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// Bloquear GET
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
