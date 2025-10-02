import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const tokenCheck = {
      UTMIFY_ENABLED: process.env.UTMIFY_ENABLED,
      UTMIFY_TEST_MODE: process.env.UTMIFY_TEST_MODE,
      UTMIFY_API_TOKEN: process.env.UTMIFY_API_TOKEN ? "✅ Configurado" : "❌ Não encontrado",
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: "Teste de token UTMify",
      tokens: tokenCheck
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Erro ao verificar token UTMify",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
