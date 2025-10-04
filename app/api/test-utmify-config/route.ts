import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const utmifyEnabled = process.env.UTMIFY_ENABLED === 'true'
    const utmifyToken = process.env.UTMIFY_API_TOKEN
    const utmifyTestMode = process.env.UTMIFY_TEST_MODE === 'true'

    return NextResponse.json({
      success: true,
      config: {
        UTMIFY_ENABLED: process.env.UTMIFY_ENABLED,
        utmifyEnabled: utmifyEnabled,
        hasToken: !!utmifyToken,
        tokenLength: utmifyToken ? utmifyToken.length : 0,
        UTMIFY_TEST_MODE: process.env.UTMIFY_TEST_MODE,
        utmifyTestMode: utmifyTestMode,
        willSendToUtmify: utmifyEnabled && !!utmifyToken
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
