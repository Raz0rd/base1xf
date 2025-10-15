'use client'

import { useState, useEffect } from 'react'
import UserVerification from './UserVerification'

interface VerificationWrapperProps {
  children: React.ReactNode
}

export default function VerificationWrapper({ children }: VerificationWrapperProps) {
  const [isVerificationEnabled, setIsVerificationEnabled] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se a verificação está habilitada
    const verificationEnabled = process.env.NEXT_PUBLIC_ENABLE_USER_VERIFICATION === 'true'
    setIsVerificationEnabled(verificationEnabled)

    if (verificationEnabled) {
      const userVerified = checkUserVerification()
      setIsVerified(userVerified)
    } else {
      setIsVerified(true)
    }

    setIsLoading(false)
  }, [])

  // Função para verificar se o usuário tem verificação válida
  const checkUserVerification = (): boolean => {
    try {
      const userVerified = localStorage.getItem('userVerified')
      const userPlayerId = localStorage.getItem('userPlayerId')
      const userData = localStorage.getItem('userData')
      const verificationData = localStorage.getItem('verificationData')
      const verificationExpiry = localStorage.getItem('verificationExpiry')
      const userAuthenticated = localStorage.getItem('user_authenticated')

      // Verificações obrigatórias
      if (!userVerified || userVerified !== 'true') {
        return false
      }

      if (!userPlayerId || !userData || !verificationData) {
        return false
      }

      if (!userAuthenticated || userAuthenticated !== 'true') {
        return false
      }

      // Verificar expiração
      if (verificationExpiry) {
        const expiryTime = parseInt(verificationExpiry)
        if (Date.now() > expiryTime) {
          clearVerificationData()
          return false
        }
      }

      // Validar dados de verificação
      const verification = JSON.parse(verificationData)
      if (!verification.verified || !verification.playerId || !verification.verifiedAt) {
        return false
      }

      // Verificar idade da verificação
      const timeSinceVerification = Date.now() - verification.verifiedAt
      const maxAge = 24 * 60 * 60 * 1000 // 24h em milliseconds
      
      if (timeSinceVerification > maxAge) {
        clearVerificationData()
        return false
      }

      // Validar dados do usuário
      const gameData = JSON.parse(userData)
      if (!gameData.nickname || gameData.nickname === 'LOGADO') {
        return false
      }

      return true
    } catch (error) {
      console.error('[Verification] Erro na verificação:', error)
      clearVerificationData()
      return false
    }
  }

  // Função para limpar dados de verificação
  const clearVerificationData = () => {
    
    // Dados de verificação
    localStorage.removeItem('userVerified')
    localStorage.removeItem('userPlayerId')
    localStorage.removeItem('userData')
    localStorage.removeItem('verificationData')
    localStorage.removeItem('verificationExpiry')
    
    // Dados de autenticação (para forçar nova verificação)
    localStorage.removeItem('user_authenticated')
    localStorage.removeItem('user_data')
    localStorage.removeItem('terms_accepted')
    localStorage.removeItem('terms_accepted_at')
  }

  const handleVerificationComplete = () => {
    setIsVerified(true)
    
    // Forçar reload da página para que o sistema principal detecte o login
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  // Loading inicial
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-100" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(229, 231, 235, 0.8) 0%, transparent 50%),
          radial-gradient(circle at 70% 20%, rgba(243, 244, 246, 0.6) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(229, 231, 235, 0.7) 0%, transparent 60%),
          radial-gradient(circle at 30% 90%, rgba(243, 244, 246, 0.5) 0%, transparent 45%)
        `
      }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-800">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent mb-4"></div>
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  // Se verificação está habilitada e usuário não está verificado
  if (isVerificationEnabled && !isVerified) {
    return <UserVerification onVerificationComplete={handleVerificationComplete} />
  }

  // Se verificação está desabilitada ou usuário já está verificado
  return <>{children}</>
}
