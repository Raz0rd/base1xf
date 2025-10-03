import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Verificar todas as variáveis importantes
    const envCheck = {
      // BlackCat
      BLACKCAT_API_AUTH: process.env.BLACKCAT_API_AUTH ? "✅ Configurado" : "❌ Não encontrado",
      
      // UTMify
      UTMIFY_ENABLED: process.env.UTMIFY_ENABLED,
      UTMIFY_TEST_MODE: process.env.UTMIFY_TEST_MODE,
      UTMIFY_API_TOKEN: process.env.UTMIFY_API_TOKEN ? "✅ Configurado" : "❌ Não encontrado",
      UTMIFY_WHITEPAGE_URL: process.env.UTMIFY_WHITEPAGE_URL ? "✅ Configurado" : "❌ Não encontrado",
      
      // Pixel UTMify
      NEXT_PUBLIC_PIXELID_UTMFY: process.env.NEXT_PUBLIC_PIXELID_UTMFY ? "✅ Configurado" : "❌ Não encontrado",
      
      // Ratoeira
      RATOEIRA_ENABLED: process.env.RATOEIRA_ENABLED,
      
      // Sistema
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      
      // Timestamp
      timestamp: new Date().toISOString(),
      
      // URL atual
      currentUrl: request.url,
      host: request.headers.get('host'),
      protocol: request.headers.get('x-forwarded-proto') || 'https'
    }

    return NextResponse.json({
      success: true,
      message: "Debug de variáveis de ambiente",
      environment: envCheck
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Erro ao verificar variáveis de ambiente",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
