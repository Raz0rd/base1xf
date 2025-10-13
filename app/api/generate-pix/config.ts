// Configuração para runtime Edge no Netlify
export const runtime = 'nodejs' // Forçar Node.js runtime ao invés de Edge

// Helper para ler variáveis de ambiente de forma robusta
export function getEnvVar(key: string, fallback: string = ''): string {
  // Tentar diferentes formas de acessar env vars
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key]
    if (value) return value
  }
  
  // Fallback para globalThis (Edge Runtime)
  if (typeof globalThis !== 'undefined') {
    const globalEnv = (globalThis as any).process?.env
    if (globalEnv && globalEnv[key]) {
      return globalEnv[key]
    }
  }
  
  return fallback
}

// Configurações específicas por ambiente
export const config = {
  // Gateway de pagamento
  paymentGateway: getEnvVar('PAYMENT_GATEWAY', 'umbrela'),
  
  // API Keys
  umbrelaApiKey: getEnvVar('UMBRELA_API_KEY'),
  blackcatAuth: getEnvVar('BLACKCAT_API_AUTH'),
  ghostpayKey: getEnvVar('GHOSTPAY_API_KEY'),
  
  // Debug
  isProduction: getEnvVar('NODE_ENV') === 'production',
  isNetlify: !!(getEnvVar('NETLIFY') || getEnvVar('DEPLOY_PRIME_URL')),
}
