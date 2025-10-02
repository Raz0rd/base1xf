"use client"

import { useState, useEffect } from 'react'
import { mobileDebug } from '@/lib/mobile-debug'

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [autoRefresh, setAutoRefresh] = useState(true)

  const loadLogs = () => {
    const currentLogs = mobileDebug.getLogs()
    setLogs([...currentLogs])
  }

  const clearLogs = () => {
    mobileDebug.clearLogs()
    setLogs([])
  }

  useEffect(() => {
    loadLogs()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadLogs, 2000) // Atualizar a cada 2 segundos
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">📱 Debug Mobile</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  autoRefresh 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
              </button>
              <button
                onClick={loadLogs}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
              >
                🔄 Atualizar
              </button>
              <button
                onClick={clearLogs}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
              >
                🗑️ Limpar
              </button>
            </div>
          </div>

          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                Nenhum log encontrado. Use o sistema e os logs aparecerão aqui.
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1 break-words">
                  {log}
                </div>
              ))
            )}
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">📋 Como usar:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Esta página mostra logs em tempo real do sistema</li>
              <li>• Acesse pelo mobile: <code className="bg-blue-200 px-1 rounded">http://[IP]:3000/debug</code></li>
              <li>• Use o sistema normalmente e volte aqui para ver os logs</li>
              <li>• Os logs são salvos no localStorage do navegador</li>
            </ul>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Total de logs: {logs.length} | Última atualização: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}
