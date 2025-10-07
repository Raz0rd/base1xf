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

  // Scripts UTMify - Injeção Direta no DOM (TODAS AS PÁGINAS)
  const utmifyPixelId = process.env.NEXT_PUBLIC_PIXELID_UTMFY;
  
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    // Verificar se Pixel ID está configurado
    if (!utmifyPixelId) {
      console.warn('[UTMify] NEXT_PUBLIC_PIXELID_UTMFY não configurado');
      return;
    }

    // Remover scripts antigos se existirem
    const oldPixelScript = document.getElementById('utmify-pixel-init');
    const oldGoogleScript = document.getElementById('utmify-google-pixel');
    const oldUtmsScript = document.getElementById('utmify-utms-script');
    
    if (oldPixelScript) oldPixelScript.remove();
    if (oldGoogleScript) oldGoogleScript.remove();
    if (oldUtmsScript) oldUtmsScript.remove();

    // 1. Injetar script de inicialização do Pixel Google
    const pixelInitScript = document.createElement('script');
    pixelInitScript.id = 'utmify-pixel-init';
    pixelInitScript.innerHTML = `
      window.googlePixelId = "${utmifyPixelId}";
      var a = document.createElement("script");
      a.id = "utmify-google-pixel";
      a.setAttribute("async", "");
      a.setAttribute("defer", "");
      a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel-google.js");
      document.head.appendChild(a);
    `;
    document.head.appendChild(pixelInitScript);

    // 2. Injetar script de UTMs
    const utmsScript = document.createElement('script');
    utmsScript.id = 'utmify-utms-script';
    utmsScript.src = 'https://cdn.utmify.com.br/scripts/utms/latest.js';
    utmsScript.setAttribute('data-utmify-prevent-xcod-sck', '');
    utmsScript.setAttribute('data-utmify-prevent-subids', '');
    utmsScript.async = true;
    utmsScript.defer = true;
    document.head.appendChild(utmsScript);

    console.log(`[UTMify] Scripts injetados com sucesso | Página: ${pathname} | Pixel ID: ${utmifyPixelId}`);

    // Cleanup: remover scripts ao desmontar
    return () => {
      const pixelInit = document.getElementById('utmify-pixel-init');
      const googlePixel = document.getElementById('utmify-google-pixel');
      const utms = document.getElementById('utmify-utms-script');
      
      if (pixelInit) pixelInit.remove();
      if (googlePixel) googlePixel.remove();
      if (utms) utms.remove();
    };
  }, [mounted, pathname, utmifyPixelId]);

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
      
      {/* Scripts UTMify - Injetados via useEffect diretamente no DOM */}
      
      {/* Outros Scripts de Rastreamento */}
      {headContent.trackingScripts && (
        <div dangerouslySetInnerHTML={{ __html: headContent.trackingScripts }} />
      )}
    </Head>
  );
}
