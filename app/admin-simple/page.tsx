"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

interface LogEntry {
  id: number
  ip_address: string
  user_agent: string
  destination: string
  user_type: string
  message: string
  created_at: string
  utm_params: any
}

interface Analytics {
  realUserClicks: number
  botClicks: number
  antibotEnabled: boolean
  logs: LogEntry[]
}

export default function AdminSimplePage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [campaignEnabled, setCampaignEnabled] = useState(false)

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin-analytics', {
        headers: { 'Authorization': 'Bearer arzadmin123' }
      })
      const data = await response.json()
      setAnalytics(data.analytics)
      setCampaignEnabled(data.analytics.antibotEnabled)
    } catch (error) {
      console.error('Erro ao buscar analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCampaign = async () => {
    try {
      const newStatus = !campaignEnabled
      const response = await fetch('/api/admin-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer arzadmin123'
        },
        body: JSON.stringify({
          action: 'toggle_antibot',
          enabled: newStatus
        })
      })

      if (response.ok) {
        setCampaignEnabled(newStatus)
        fetchAnalytics()
      }
    } catch (error) {
      console.error('Erro ao alterar campanha:', error)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Simples - Depuração</h1>
          <p className="text-gray-600">Controle da campanha e monitoramento em tempo real</p>
        </div>

        {/* Controle Principal */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Controle da Campanha</span>
              <Badge variant={campaignEnabled ? "default" : "destructive"}>
                {campaignEnabled ? "ATIVA" : "INATIVA"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {campaignEnabled ? "🟢 Campanha ATIVA" : "🔴 Campanha INATIVA"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {campaignEnabled 
                    ? "✅ Verificando usuários reais → Offerpage | Bots → Whitepage"
                    : "❌ TODOS os usuários → Whitepage (campanha pausada)"
                  }
                </p>
              </div>
              <Switch
                checked={campaignEnabled}
                onCheckedChange={toggleCampaign}
                className="scale-150"
              />
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">👤 Usuários Reais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {analytics?.realUserClicks || 0}
              </div>
              <p className="text-gray-600">Acessos para Offerpage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">🤖 Bots Detectados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {analytics?.botClicks || 0}
              </div>
              <p className="text-gray-600">Bloqueados na Whitepage</p>
            </CardContent>
          </Card>
        </div>

        {/* Logs Detalhados */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Logs de Depuração (Últimos 50)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {analytics?.logs?.slice(0, 50).map((log) => (
                <div 
                  key={log.id} 
                  className={`p-4 rounded-lg border-l-4 ${
                    log.user_type === 'real' 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={log.user_type === 'real' ? "default" : "destructive"}>
                          {log.user_type === 'real' ? '👤 REAL' : '🤖 BOT'}
                        </Badge>
                        <Badge variant="outline">
                          {log.destination === 'offerpage' ? '✅ OFFER' : '❌ WHITE'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div><strong>IP:</strong> {log.ip_address}</div>
                        <div><strong>Motivo:</strong> {log.message}</div>
                        <div><strong>User-Agent:</strong> {log.user_agent.substring(0, 100)}...</div>
                        {log.utm_params && Object.keys(log.utm_params).length > 0 && (
                          <div><strong>UTM:</strong> {JSON.stringify(log.utm_params)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button onClick={fetchAnalytics} variant="outline">
            🔄 Atualizar Dados
          </Button>
        </div>
      </div>
    </div>
  )
}
