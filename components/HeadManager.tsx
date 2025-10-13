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

  // Desabilitar tracking no modo de desenvolvimento
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    setMounted(true);
    if (isDevelopment) {
      console.log('🔧 [DEV MODE] Todos os scripts de tracking estão DESABILITADOS no desenvolvimento');
    }
  }, [isDevelopment]);

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

          // Carregar scripts de rastreamento do Ratoeira ADS apenas se habilitado e não estiver em desenvolvimento
          const ratoeiraEnabled = process.env.NEXT_PUBLIC_RATOEIRA_ENABLED === 'true';
          if (ratoeiraEnabled && !isDevelopment) {
            loadTrackingScripts();
          } else if (isDevelopment) {
            console.log('🔧 [DEV] Ratoeira ADS desabilitado no modo desenvolvimento');
          }
        }
      } catch (error) {
        //console.error('Erro ao carregar configurações do cabeçalho:', error);
      }
    };

    loadHeadContent();
  }, [mounted, isDevelopment]);

  // Scripts do Ratoeira ADS (adicionados diretamente no head) - apenas se habilitado
  const ratoeiraEnabled = process.env.NEXT_PUBLIC_RATOEIRA_ENABLED === 'true' && !isDevelopment;
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
    
    // Desabilitar no desenvolvimento
    if (isDevelopment) {
      console.log('🔧 [DEV] UTMify desabilitado no modo desenvolvimento');
      return;
    }
    
    // Verificar se Pixel ID está configurado
    if (!utmifyPixelId) {
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

    // Cleanup: remover scripts ao desmontar
    return () => {
      const pixelInit = document.getElementById('utmify-pixel-init');
      const googlePixel = document.getElementById('utmify-google-pixel');
      const utms = document.getElementById('utmify-utms-script');
      
      if (pixelInit) pixelInit.remove();
      if (googlePixel) googlePixel.remove();
      if (utms) utms.remove();
    };
  }, [mounted, pathname, utmifyPixelId, isDevelopment]);

  // Google Ads Conversion Tracking - Injeção Direta no DOM
  const googleAdsEnabled = process.env.NEXT_PUBLIC_GOOGLE_ADS_ENABLED === 'true';
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17554136774';
  const adsIndividual = process.env.NEXT_PUBLIC_ADS_INDIVIDUAL === 'true';
  
  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || !googleAdsEnabled) return;

    // Desabilitar no desenvolvimento
    if (isDevelopment) {
      console.log('🔧 [DEV] Google Ads desabilitado no modo desenvolvimento');
      return;
    }

    // Remover scripts antigos se existirem
    const oldGtagScript = document.getElementById('google-gtag-script');
    const oldGtagInit = document.getElementById('google-gtag-init');
    const oldGtagFunctions = document.getElementById('google-gtag-functions');
    
    if (oldGtagScript) oldGtagScript.remove();
    if (oldGtagInit) oldGtagInit.remove();
    if (oldGtagFunctions) oldGtagFunctions.remove();

    // 1. Injetar script do Google Tag Manager
    const gtagScript = document.createElement('script');
    gtagScript.id = 'google-gtag-script';
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`;
    gtagScript.async = true;
    document.head.appendChild(gtagScript);

    // 2. Injetar inicialização do gtag
    const gtagInit = document.createElement('script');
    gtagInit.id = 'google-gtag-init';
    gtagInit.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${googleAdsId}');
    `;
    document.head.appendChild(gtagInit);

    // 3. Se ADS_INDIVIDUAL=true, injetar funções gtag_report_conversion
    if (adsIndividual) {
      const gtagFunctions = document.createElement('script');
      gtagFunctions.id = 'google-gtag-functions';
      gtagFunctions.innerHTML = `
        // Função para conversão: Iniciar Checkout (QR Code gerado)
        window.gtag_report_conversion_checkout = function() {
          console.log('[Google Ads] 🎯 Disparando conversão: Iniciar Checkout');
          gtag('event', 'conversion', {
            'send_to': 'AW-17554136774/8pfZCPegsKobEMa9u7JB'
          });
          console.log('[Google Ads] ✅ Conversão "Iniciar Checkout" enviada');
          return false;
        };

        // Função para conversão: Compra (Pagamento confirmado)
        window.gtag_report_conversion_purchase = function(transactionId, value) {
          console.log('[Google Ads] 🎯 Disparando conversão: Compra');
          console.log('[Google Ads] Transaction ID:', transactionId);
          console.log('[Google Ads] Valor: R$', value);
          gtag('event', 'conversion', {
            'send_to': 'AW-17554136774/S9KKCL7Qo6obEMa9u7JB',
            'value': value || 1.0,
            'currency': 'BRL',
            'transaction_id': transactionId || ''
          });
          console.log('[Google Ads] ✅ Conversão "Compra" enviada');
          return false;
        };
      `;
      document.head.appendChild(gtagFunctions);
      console.log('[Google Ads] ✅ Funções gtag_report_conversion injetadas no client-side');
    }

    // Cleanup
    return () => {
      const gtag = document.getElementById('google-gtag-script');
      const init = document.getElementById('google-gtag-init');
      const funcs = document.getElementById('google-gtag-functions');
      
      if (gtag) gtag.remove();
      if (init) init.remove();
      if (funcs) funcs.remove();
    };
  }, [mounted, pathname, googleAdsEnabled, googleAdsId, adsIndividual, isDevelopment]);

  // Injetar Meta Tags SEO no DOM
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    // Remover meta tags antigas se existirem
    const oldMetas = document.querySelectorAll('meta[data-seo="true"]');
    oldMetas.forEach(meta => meta.remove());

    // Criar e injetar novas meta tags
    const metaTags = [
      { 
        name: 'description', 
        content: 'Central de recargas para Free Fire. Site de recargas pro Free Fire com entrega instantânea. Recarregue Free Fire e turbine seu jogo com diamantes!' 
      },
      { 
        name: 'keywords', 
        content: 'central de recargas, recargas pro ff, site de recargas pro free fire, recarregue freefire, turbine seu jogo, diamantes free fire, recarga ff instantânea, comprar diamantes ff' 
      }
    ];

    metaTags.forEach(({ name, content }) => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', name);
      meta.setAttribute('content', content);
      meta.setAttribute('data-seo', 'true');
      document.head.appendChild(meta);
    });

    console.log('✅ [SEO] Meta tags injetadas no DOM');

    // Cleanup
    return () => {
      const metas = document.querySelectorAll('meta[data-seo="true"]');
      metas.forEach(meta => meta.remove());
    };
  }, [mounted]);

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
      
      {/* Outros Scripts de Rastreamento - Desabilitado no desenvolvimento */}
      {!isDevelopment && headContent.trackingScripts && (
        <div dangerouslySetInnerHTML={{ __html: headContent.trackingScripts }} />
      )}
    </Head>
  );
}
