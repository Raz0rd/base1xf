import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Verificar variáveis de ambiente
    const envCheck = {
      UTMIFY_ENABLED: process.env.UTMIFY_ENABLED,
      UTMIFY_TEST_MODE: process.env.UTMIFY_TEST_MODE,
      UTMIFY_API_TOKEN: process.env.UTMIFY_API_TOKEN ? "✅ Configurado" : "❌ Não encontrado",
      COMPANY_NAME: process.env.COMPANY_NAME,
      COMPANY_EMAIL: process.env.COMPANY_EMAIL,
      NODE_ENV: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: "Teste de variáveis de ambiente",
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
