import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import "./globals.css"
import HeadManager from "@/components/HeadManager"
import ClickTracker from "@/components/ClickTracker"
import PWAInstaller from "@/components/PWAInstaller"
import DynamicTheme from "@/components/DynamicTheme"
import VerificationWrapper from "@/components/VerificationWrapper"

export const metadata: Metadata = {
  title: "Recarga Free Fire, Delta Force, Haikyu - Site Oficial de Diamantes",
  description: "Site oficial de recarga para jogos! Compre diamantes Free Fire, créditos Delta Force e moedas Haikyu com segurança. Recarga rápida, bônus exclusivos e preços promocionais. Centro de recarga oficial de jogos mobile.",
  keywords: [
    // Free Fire
    "recarga free fire",
    "comprar diamantes free fire", 
    "diamantes free fire barato",
    "free fire recarga oficial",
    "site recarga free fire",
    "diamantes ff",
    "recarga ff oficial",
    
    // Delta Force
    "recarga delta force",
    "comprar creditos delta force",
    "delta force recarga oficial",
    "site recarga delta force",
    
    // Haikyu  
    "recarga haikyu",
    "comprar moedas haikyu",
    "haikyu recarga oficial",
    "site recarga haikyu",
    
    // Geral
    "recarga jogo",
    "site de recarga de jogos",
    "recarga jogos mobile",
    "comprar creditos jogos",
    "recarga oficial jogos",
    "centro de recarga",
    "recarga segura jogos",
    "recarga rapida jogos",
    "bonus recarga jogos",
    "promocao recarga jogos"
  ],
  authors: [{ name: "Centro Oficial de Recarga" }],
  generator: "Next.js",
  applicationName: "Centro de Recarga Oficial",
  referrer: "origin-when-cross-origin",
  creator: "Centro de Recarga",
  publisher: "Centro de Recarga Oficial",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Recarga Free Fire, Delta Force, Haikyu - Site Oficial",
    description: "🔥 Compre diamantes Free Fire, créditos Delta Force e moedas Haikyu com segurança! Recarga oficial com bônus exclusivos e preços promocionais.",
    url: "/",
    siteName: "Centro de Recarga Oficial",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Centro de Recarga Oficial - Free Fire, Delta Force, Haikyu"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Recarga Free Fire, Delta Force, Haikyu - Site Oficial",
    description: "🔥 Compre diamantes Free Fire, créditos Delta Force e moedas Haikyu com segurança! Recarga oficial.",
    images: ["/images/twitter-card.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Centro de Recarga Oficial"
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
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
        <VerificationWrapper>
          <ClickTracker>
            <Suspense fallback={null}>{children}</Suspense>
          </ClickTracker>
        </VerificationWrapper>
      </body>
    </html>
  )
}
