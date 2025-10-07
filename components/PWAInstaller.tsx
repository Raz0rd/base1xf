"use client"

import { useEffect, useState } from "react"

export default function PWAInstaller() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          // Service Worker registrado
        })
        .catch(() => {
          // Erro ao registrar Service Worker
        })
    }
  }, [mounted])

  return null
}
