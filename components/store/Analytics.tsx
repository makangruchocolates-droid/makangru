'use client';

import Script from 'next/script';
import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { GA_ID, META_PIXEL_ID, trackPageview } from '@/lib/analytics';

/**
 * Carga los scripts de GA4 y Meta Pixel una sola vez (en el layout raíz)
 * y dispara un pageview cada vez que cambia la ruta (App Router no recarga
 * la página en la navegación interna, así que gtag/fbq no lo detectan solos).
 *
 * Si falta alguna variable de entorno, ese script directamente no se
 * inyecta — no rompe nada ni tira errores en consola.
 */
function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    trackPageview(url);
  }, [pathname, searchParams]);

  return null;
}

export function Analytics() {
  // No cargar nada en desarrollo local (npm run dev) — evita registrar
  // tu propio tráfico de pruebas en GA4/Meta mientras trabajas en el sitio.
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) return null;

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { send_page_view: true });
              window.gtag = gtag;
            `}
          </Script>
        </>
      )}

      {META_PIXEL_ID && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {META_PIXEL_ID && (
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      )}

      {(GA_ID || META_PIXEL_ID) && (
        <Suspense fallback={null}>
          <RouteChangeTracker />
        </Suspense>
      )}
    </>
  );
}
