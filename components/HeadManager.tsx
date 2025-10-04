'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { usePathname } from 'next/navigation';
import { loadTrackingScripts } from '@/lib/tracking';

export default function HeadManager() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [headContent, setHeadContent] = useState({
    metaTags: '',
    trackingScripts: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Carregar configurações do localStorage
    const loadHeadContent = () => {
      try {
        if (typeof window !== 'undefined') {
          const metaTags = localStorage.getItem('head_meta_tags') || '';
          const trackingScripts = localStorage.getItem('head_tracking_scripts') || '';
          
          setHeadContent({
            metaTags,
            trackingScripts
          });

          // Carregar scripts de rastreamento do Ratoeira ADS apenas se habilitado
          const ratoeiraEnabled = process.env.NEXT_PUBLIC_RATOEIRA_ENABLED === 'true';
          if (ratoeiraEnabled) {
            loadTrackingScripts();
          } else {
            //console.log('[v0] HeadManager - Ratoeira ADS disabled, skipping tracking scripts');
          }
        }
      } catch (error) {
        //console.error('Erro ao carregar configurações do cabeçalho:', error);
      }
    };

    loadHeadContent();
  }, [mounted]);

  // Scripts do Ratoeira ADS (adicionados diretamente no head) - apenas se habilitado
  const ratoeiraEnabled = process.env.NEXT_PUBLIC_RATOEIRA_ENABLED === 'true';
  const ratoeiraScripts = ratoeiraEnabled ? (
    <>
      <script 
        key="ratoeira-main"
        src="https://cdn.fortittutitrackin.site/code/7289/7289-01530a2b-3c0c-4a69-bd7e-c97d74d11b4b.min.js" 
        defer 
        async
      />
      <script 
        key="ratoeira-base"
        src="https://cdn.fortittutitrackin.site/code/base.min.js" 
        defer 
        async
      />
    </>
  ) : null;

  // Scripts UTMify - APENAS OFFERPAGE E CHECKOUT (NÃO na whitepage)
  const isOfferpage = pathname === '/';
  const isCheckout = pathname === '/checkout';
  const isWhitepage = pathname === '/whitepage';
  const needsUtmifyScripts = (isOfferpage || isCheckout) && !isWhitepage;
  
  // Obter Pixel ID do UTMify da variável de ambiente
  const utmifyPixelId = process.env.NEXT_PUBLIC_PIXELID_UTMFY;
  
  // Debug: Log quando UTMify scripts são carregados
  useEffect(() => {
    if (!mounted) return;
    
    if (needsUtmifyScripts) {
      if (utmifyPixelId) {
        //console.log(`[UTMify Scripts] Carregando scripts na página: ${pathname} com Pixel ID: ${utmifyPixelId}`);
      } else {
        //console.warn(`[UTMify Scripts] ATENÇÃO: NEXT_PUBLIC_PIXELID_UTMFY não configurado! Scripts não serão carregados.`);
      }
    }
  }, [mounted, pathname, needsUtmifyScripts, utmifyPixelId]);
  
  const utmifyScripts = needsUtmifyScripts && utmifyPixelId ? (
    <>
      <script 
        key="utmify-pixel"
        dangerouslySetInnerHTML={{
          __html: `
            window.googlePixelId = "${utmifyPixelId}";
            var a = document.createElement("script");
            a.setAttribute("async", "");
            a.setAttribute("defer", "");
            a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel-google.js");
            document.head.appendChild(a);
          `
        }}
      />
      <script 
        key="utmify-utms"
        src="https://cdn.utmify.com.br/scripts/utms/latest.js"
        data-utmify-prevent-xcod-sck
        data-utmify-prevent-subids
        async
        defer
      />
    </>
  ) : null;

  return (
    <Head>
      {/* Meta Tags Padrão */}
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Meta Tags Dinâmicas */}
      {headContent.metaTags && (
        <div dangerouslySetInnerHTML={{ __html: headContent.metaTags }} />
      )}
      
      {/* Scripts de Rastreamento do Ratoeira ADS */}
      {ratoeiraScripts}
      
      {/* Scripts UTMify - OFFERPAGE E CHECKOUT */}
      {utmifyScripts}
      
      {/* Outros Scripts de Rastreamento */}
      {headContent.trackingScripts && (
        <div dangerouslySetInnerHTML={{ __html: headContent.trackingScripts }} />
      )}
    </Head>
  );
}
