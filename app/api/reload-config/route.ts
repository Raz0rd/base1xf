import { NextRequest, NextResponse } from 'next/server'

// Cache das configurações
let configCache: any = null
let lastReload = 0

export async function GET(request: NextRequest) {
  try {
    // Forçar reload das variáveis de ambiente
    delete require.cache[require.resolve('process')]
    
    // Recarregar configurações
    const config = {
      companyName: process.env.COMPANY_NAME || 'R. GAMES',
      companyLegalName: process.env.COMPANY_LEGAL_NAME || 'R. GAMES - DIVERSOES ELETRONICAS SS LTDA',
      companyCnpj: process.env.COMPANY_CNPJ || '06.077.548/0001-16',
      companyAddress: process.env.COMPANY_ADDRESS || 'R SANTA URSULA, 102 - VILA MINEIRO, SAO PAULO - SP, 04459-320',
      companyPhone: process.env.COMPANY_PHONE || '(11) 2645-4223',
      companyEmail: process.env.COMPANY_EMAIL || 'ronaldo_rgames@hotmail.com',
      companyWebsite: process.env.COMPANY_WEBSITE || 'www.recarga-premiumgames.it.com',
      
      service1Title: process.env.SERVICE_1_TITLE || 'Exploração de Jogos Eletronicos',
      service1Desc: process.env.SERVICE_1_DESC || 'Oferecemos entretenimento através da exploração de jogos eletrônicos recreativos, com foco em diversão e interatividade.',
      service2Title: process.env.SERVICE_2_TITLE || 'Consultoria em Games',
      service2Desc: process.env.SERVICE_2_DESC || 'Apoiamos empreendedores e entusiastas na implementação de soluções para o setor de diversões eletrônicas.',
      service3Title: process.env.SERVICE_3_TITLE || 'Suporte Técnico',
      service3Desc: process.env.SERVICE_3_DESC || 'Atendimento e manutenção para garantir o funcionamento contínuo dos equipamentos e sistemas de jogos.',
      
      primaryColor: process.env.PRIMARY_COLOR || '2563eb',
      secondaryColor: process.env.SECONDARY_COLOR || '1e40af',
      accentColor: process.env.ACCENT_COLOR || 'dc2626',
      
      lastReload: new Date().toISOString()
    }
    
    configCache = config
    lastReload = Date.now()
    
    // Configurações recarregadas silenciosamente
    
    return NextResponse.json({
      success: true,
      message: 'Configurações recarregadas com sucesso',
      config: config,
      timestamp: config.lastReload
    })
    
  } catch (error) {
    console.error('[CONFIG RELOAD] Erro:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Erro ao recarregar configurações',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

// Função para obter configurações (com cache)
export function getConfig() {
  // Se não tem cache ou é muito antigo (mais de 30 segundos), recarregar
  if (!configCache || (Date.now() - lastReload) > 30000) {
    configCache = {
      companyName: process.env.COMPANY_NAME || 'R. GAMES',
      companyLegalName: process.env.COMPANY_LEGAL_NAME || 'R. GAMES - DIVERSOES ELETRONICAS SS LTDA',
      companyCnpj: process.env.COMPANY_CNPJ || '06.077.548/0001-16',
      companyAddress: process.env.COMPANY_ADDRESS || 'R SANTA URSULA, 102 - VILA MINEIRO, SAO PAULO - SP, 04459-320',
      companyPhone: process.env.COMPANY_PHONE || '(11) 2645-4223',
      companyEmail: process.env.COMPANY_EMAIL || 'ronaldo_rgames@hotmail.com',
      companyWebsite: process.env.COMPANY_WEBSITE || 'www.recarga-premiumgames.it.com',
      
      service1Title: process.env.SERVICE_1_TITLE || 'Exploração de Jogos Eletronicos',
      service1Desc: process.env.SERVICE_1_DESC || 'Oferecemos entretenimento através da exploração de jogos eletrônicos recreativos, com foco em diversão e interatividade.',
      service2Title: process.env.SERVICE_2_TITLE || 'Consultoria em Games',
      service2Desc: process.env.SERVICE_2_DESC || 'Apoiamos empreendedores e entusiastas na implementação de soluções para o setor de diversões eletrônicas.',
      service3Title: process.env.SERVICE_3_TITLE || 'Suporte Técnico',
      service3Desc: process.env.SERVICE_3_DESC || 'Atendimento e manutenção para garantir o funcionamento contínuo dos equipamentos e sistemas de jogos.',
      
      primaryColor: process.env.PRIMARY_COLOR || '2563eb',
      secondaryColor: process.env.SECONDARY_COLOR || '1e40af',
      accentColor: process.env.ACCENT_COLOR || 'dc2626'
    }
    lastReload = Date.now()
  }
  
  return configCache
}
