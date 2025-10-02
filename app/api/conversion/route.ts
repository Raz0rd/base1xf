import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, orderId, amount } = body;
    
    // Validar tipo de conversão
    if (!['qr_generated', 'paid'].includes(type)) {
      return NextResponse.json({ error: 'Tipo de conversão inválido' }, { status: 400 });
    }

    // Registrar conversão no sistema de configuração
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const configResponse = await fetch(`${baseUrl}/api/admin-config`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer arzadmin123',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        action: 'increment_conversion',
        conversionType: type,
        orderId: orderId,
        amount: amount
      })
    });

    if (!configResponse.ok) {
      console.error('[CONVERSION ERROR] Falha ao registrar conversão');
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }

    // Log detalhado da conversão
    const ip = request.ip || 
               request.headers.get('x-real-ip') || 
               request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
               'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    console.log(`[CONVERSION] ${new Date().toISOString()} - Type: ${type} - Order: ${orderId} - Amount: ${amount} - IP: ${ip}`);

    return NextResponse.json({
      success: true,
      message: `Conversão ${type} registrada com sucesso`,
      orderId: orderId
    });
  } catch (error) {
    console.error('[CONVERSION ERROR]', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
