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
      // CONTROLE RIGOROSO: Sempre força verificação quando habilitada
      console.log('[Verification] Sistema de verificação ATIVO - verificando usuário...')
      const userVerified = checkUserVerification()
      console.log('[Verification] Resultado da verificação:', userVerified)
      setIsVerified(userVerified)
    } else {
      // Se verificação está desabilitada, permitir acesso direto
      console.log('[Verification] Sistema de verificação DESABILITADO - acesso livre')
      setIsVerified(true)
    }

    setIsLoading(false)
  }, [])

  // Função para verificar se o usuário tem verificação válida
  const checkUserVerification = (): boolean => {
    try {
      console.log('[Verification] Iniciando verificação detalhada...')
      
      const userVerified = localStorage.getItem('userVerified')
      const userPlayerId = localStorage.getItem('userPlayerId')
      const userData = localStorage.getItem('userData')
      const verificationData = localStorage.getItem('verificationData')
      const verificationExpiry = localStorage.getItem('verificationExpiry')
      const userAuthenticated = localStorage.getItem('user_authenticated')

      console.log('[Verification] Dados encontrados:', {
        userVerified,
        userPlayerId,
        hasUserData: !!userData,
        hasExpiry: !!verificationExpiry,
        userAuthenticated
      })

      // Verificações obrigatórias
      if (!userVerified || userVerified !== 'true') {
        console.log('[Verification] ❌ userVerified não é true')
        return false
      }

      if (!userPlayerId || !userData || !verificationData) {
        console.log('[Verification] ❌ userPlayerId, userData ou verificationData ausentes')
        return false
      }

      if (!userAuthenticated || userAuthenticated !== 'true') {
        console.log('[Verification] ❌ user_authenticated não é true')
        return false
      }

      // Verificar se a verificação não expirou (24h)
      if (verificationExpiry) {
        const expiryTime = parseInt(verificationExpiry)
        if (Date.now() > expiryTime) {
          console.log('[Verification] ❌ Verificação expirada')
          clearVerificationData()
          return false
        }
      }

      // Validar dados de verificação
      const verification = JSON.parse(verificationData)
      if (!verification.verified || !verification.playerId || !verification.verifiedAt) {
        console.log('[Verification] ❌ Dados de verificação inválidos:', verification)
        return false
      }

      // Verificar se não passou mais de 24h desde a verificação
      const timeSinceVerification = Date.now() - verification.verifiedAt
      const maxAge = 24 * 60 * 60 * 1000 // 24h em milliseconds
      
      if (timeSinceVerification > maxAge) {
        console.log('[Verification] ❌ Verificação expirou por tempo')
        clearVerificationData()
        return false
      }

      // Validar dados do usuário (mesmo que no sistema normal)
      const gameData = JSON.parse(userData)
      if (!gameData.nickname || gameData.nickname === 'LOGADO') {
        console.log('[Verification] ❌ Dados do usuário inválidos:', gameData)
        return false
      }

      console.log('[Verification] ✅ Usuário válido e verificado!')
      return true
    } catch (error) {
      console.error('[Verification] ❌ Erro na verificação:', error)
      clearVerificationData()
      return false
    }
  }

  // Função para limpar dados de verificação
  const clearVerificationData = () => {
    console.log('[Verification] 🧹 Limpando todos os dados de verificação e autenticação...')
    
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
    console.log('[Verification] ✅ Verificação completa! Recarregando página...')
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
