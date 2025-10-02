import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import "./globals.css"
import HeadManager from "@/components/HeadManager"
import ClickTracker from "@/components/ClickTracker"
import PWAInstaller from "@/components/PWAInstaller"
import DynamicTheme from "@/components/DynamicTheme"

export const metadata: Metadata = {
  title: "Recargas Jogo BR - Centro Oficial",
  description: "Centro de recarga oficial! Recarregue com segurança e ganhe bônus exclusivos em diamantes para Free Fire.",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Recargas Jogo BR"
  },
  formatDetection: {
    telephone: false
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans">
        <HeadManager />
        <DynamicTheme />
        <PWAInstaller />
        <ClickTracker>
          <Suspense fallback={null}>{children}</Suspense>
        </ClickTracker>
      </body>
    </html>
  )
}
