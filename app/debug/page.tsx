'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [systemInfo, setSystemInfo] = useState<any>({})
  const [testResults, setTestResults] = useState<any>({})

  useEffect(() => {
    // Carregar logs do localStorage
    const loadLogs = () => {
      try {
        const savedLogs = localStorage.getItem('mobile_debug_logs')
        if (savedLogs) {
          setLogs(JSON.parse(savedLogs))
        }
      } catch (error) {
        console.error('Erro ao carregar logs:', error)
      }
    }

    // Coletar informações do sistema
    const collectSystemInfo = () => {
      setSystemInfo({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screen: {
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight,
        },
        window: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          outerWidth: window.outerWidth,
          outerHeight: window.outerHeight,
        },
        location: {
          href: window.location.href,
          origin: window.location.origin,
          pathname: window.location.pathname,
          search: window.location.search,
        },
        localStorage: {
          available: typeof Storage !== 'undefined',
          itemCount: localStorage.length,
        },
        crypto: {
          available: typeof crypto !== 'undefined',
          randomUUID: typeof crypto?.randomUUID === 'function',
        }
      })
    }

    loadLogs()
    collectSystemInfo()

    // Atualizar logs a cada 2 segundos
    const interval = setInterval(loadLogs, 2000)
    return () => clearInterval(interval)
  }, [])

  const clearLogs = () => {
    try {
      localStorage.removeItem('mobile_debug_logs')
      setLogs([])
    } catch (error) {
      console.error('Erro ao limpar logs:', error)
    }
  }

  const testPixAPI = async () => {
    try {
      setTestResults({ ...testResults, pixTest: 'Testando...' })
      
      const testPayload = {
        amount: 1899, // R$ 18,99
        orderId: 'test-' + Date.now(),
        utmParams: {
          utm_source: 'test',
          utm_medium: 'debug',
          utm_campaign: 'mobile_test'
        },
        customer: {
          name: 'Teste Mobile',
          email: 'teste@mobile.com',
          phone: '11999999999',
          document: {
            number: '12345678901',
            type: 'cpf'
          }
        }
      }

      console.log('[DEBUG] Testando API PIX:', testPayload)
      
      const response = await fetch('/api/generate-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      })

      const data = await response.json()
      
      setTestResults({ 
        ...testResults, 
        pixTest: {
          status: response.status,
          ok: response.ok,
          data: data,
          hasPixCode: !!data.pixCode,
          hasQrCode: !!data.qrCode,
          hasTransactionId: !!data.transactionId
        }
      })
      
    } catch (error) {
      setTestResults({ 
        ...testResults, 
        pixTest: { error: error instanceof Error ? error.message : 'Erro desconhecido' }
      })
    }
  }

  const testIPAPI = async () => {
    try {
      setTestResults({ ...testResults, ipTest: 'Testando...' })
      
      const response = await fetch('/api/get-user-ip')
      const data = await response.json()
      
      setTestResults({ 
        ...testResults, 
        ipTest: {
          status: response.status,
          ok: response.ok,
          data: data
        }
      })
      
    } catch (error) {
      setTestResults({ 
        ...testResults, 
        ipTest: { error: error instanceof Error ? error.message : 'Erro desconhecido' }
      })
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug - Testes de API</CardTitle>
          <CardDescription>Testar APIs críticas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testPixAPI} size="sm">
              Testar API PIX
            </Button>
            <Button onClick={testIPAPI} size="sm">
              Testar API IP
            </Button>
          </div>
          
          {Object.keys(testResults).length > 0 && (
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Debug - Sistema</CardTitle>
          <CardDescription>Informações do sistema e navegador</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(systemInfo, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Debug - Logs ({logs.length})</CardTitle>
            <CardDescription>Logs de debug do sistema</CardDescription>
          </div>
          <Button onClick={clearLogs} variant="outline" size="sm">
            Limpar Logs
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">Nenhum log encontrado</p>
            ) : (
              logs.slice(-20).reverse().map((log, index) => (
                <div key={index} className="text-xs bg-gray-50 p-2 rounded border-l-2 border-blue-200">
                  {log}
                </div>
              ))
            )}
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Total de logs: {logs.length} | Última atualização: {new Date().toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
