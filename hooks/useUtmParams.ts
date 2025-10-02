"use client"

import { useEffect, useState } from 'react'

export const useUtmParams = () => {
  const [utmParams, setUtmParams] = useState<string>('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      
      // Capturar todos os parâmetros UTM e relacionados
      const utmParameters = [
        'utm_source',
        'utm_medium', 
        'utm_campaign',
        'utm_content',
        'utm_term',
        'src',
        'sck',
        'fbclid',
        'gclid',
        'ttclid',
        'xcod',
        'keyword',
        'device',
        'network',
        'gad_source',
        'gbraid'
      ]

      const params = new URLSearchParams()
      
      utmParameters.forEach(param => {
        const value = urlParams.get(param)
        if (value) {
          params.set(param, value)
        }
      })

      const utmString = params.toString()
      setUtmParams(utmString)
      
      // Armazenar no localStorage para persistir
      if (utmString) {
        localStorage.setItem('utmParams', utmString)
      }
    }
  }, [])

  useEffect(() => {
    // Recuperar do localStorage se não houver na URL
    if (typeof window !== 'undefined' && !utmParams) {
      const stored = localStorage.getItem('utmParams')
      if (stored) {
        setUtmParams(stored)
      }
    }
  }, [utmParams])

  // Função para adicionar UTM params a uma URL
  const addUtmToUrl = (url: string): string => {
    if (!utmParams) return url
    
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}${utmParams}`
  }

  // Função para criar objeto de parâmetros para router.push
  const getUtmObject = (): Record<string, string> => {
    if (!utmParams) return {}
    
    const params = new URLSearchParams(utmParams)
    const obj: Record<string, string> = {}
    
    params.forEach((value, key) => {
      obj[key] = value
    })
    
    return obj
  }

  return {
    utmParams,
    addUtmToUrl,
    getUtmObject
  }
}
