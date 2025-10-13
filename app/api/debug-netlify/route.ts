import { NextRequest, NextResponse } from "next/server"

// Forçar Node.js runtime também aqui
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const debug = {
      // Environment Info
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL || 'false',
        NETLIFY: process.env.NETLIFY || 'false',
        runtime: typeof globalThis !== 'undefined' ? 'edge' : 'nodejs'
      },
      
      // Headers Info
      headers: {
        host: request.headers.get('host'),
        'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
        'x-forwarded-for': request.headers.get('x-forwarded-for'),
        'user-agent': request.headers.get('user-agent'),
        'x-nf-request-id': request.headers.get('x-nf-request-id'), // Netlify specific
      },
      
      // URL Info  
      url: {
        origin: request.nextUrl.origin,
        pathname: request.nextUrl.pathname,
        protocol: request.nextUrl.protocol,
        host: request.nextUrl.host
      },
      
      // Environment Variables (sem expor valores)
      envVars: {
        PAYMENT_GATEWAY: process.env.PAYMENT_GATEWAY || 'not_set',
        UMBRELA_API_KEY: process.env.UMBRELA_API_KEY ? `present_${process.env.UMBRELA_API_KEY.length}chars` : 'not_set',
        BLACKCAT_API_AUTH: process.env.BLACKCAT_API_AUTH ? `present_${process.env.BLACKCAT_API_AUTH.length}chars` : 'not_set',
        GHOSTPAY_API_KEY: process.env.GHOSTPAY_API_KEY ? `present_${process.env.GHOSTPAY_API_KEY.length}chars` : 'not_set'
      },
      
      // Debug raw env access
      rawEnvDebug: {
        processEnvKeys: Object.keys(process.env).length,
        hasProcessEnv: typeof process !== 'undefined',
        netlifyDetected: !!(process.env.DEPLOY_PRIME_URL || process.env.NETLIFY_BUILD_BASE),
        deployContext: process.env.CONTEXT || 'unknown',
        // Listar algumas env vars específicas do Netlify
        netlifySpecificVars: {
          DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL || 'not_set',
          NETLIFY_BUILD_BASE: process.env.NETLIFY_BUILD_BASE || 'not_set', 
          CONTEXT: process.env.CONTEXT || 'not_set',
          BRANCH: process.env.BRANCH || 'not_set'
        },
        // Testar leitura direta das nossas vars
        directEnvTest: {
          PAYMENT_GATEWAY_direct: process.env.PAYMENT_GATEWAY || 'missing',
          UMBRELA_API_KEY_direct: process.env.UMBRELA_API_KEY ? 'present' : 'missing',
          NODE_ENV_direct: process.env.NODE_ENV || 'missing'
        }
      },
      
      // Timestamp
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
    
    return NextResponse.json(debug, { 
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Teste simples de conectividade com Umbrela
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.UMBRELA_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'UMBRELA_API_KEY not configured',
        hasKey: false 
      }, { status: 400 })
    }
    
    // Teste básico de conectividade (sem criar transação)
    const testResponse = await fetch("https://api-gateway.umbrellapag.com/healthcheck", {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "User-Agent": "UMBRELLAB2B/1.0"
      }
    })
    
    return NextResponse.json({
      connectivity: {
        status: testResponse.status,
        ok: testResponse.ok,
        headers: Object.fromEntries(testResponse.headers.entries())
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      connectivity: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
