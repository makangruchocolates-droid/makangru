'use client';

/**
 * Utilidad central de analítica: envía eventos a Google Analytics 4 (gtag)
 * y Meta Pixel (fbq) al mismo tiempo, con una sola llamada.
 *
 * Ambos scripts se cargan (o no) según las variables de entorno
 * NEXT_PUBLIC_GA_ID y NEXT_PUBLIC_META_PIXEL_ID — si falta alguna,
 * simplemente no se dispara ese evento para esa plataforma (sin errores).
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/** Envía un pageview manual a GA4 (además del automático que ya dispara gtag config) */
export function trackPageview(url: string) {
  if (typeof window === 'undefined') return;
  if (GA_ID && window.gtag) {
    window.gtag('config', GA_ID, { page_path: url });
  }
  if (META_PIXEL_ID && window.fbq) {
    window.fbq('track', 'PageView');
  }
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_name: 'pageview', event_params: {}, page_path: url }),
    keepalive: true,
  }).catch(() => {});
}

type EventName = 'click_pedir_whatsapp' | 'abrir_catalogo' | 'consultar_producto_whatsapp';

function fireGA4(name: EventName, params?: Record<string, any>) {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, params || {});
}

function fireMetaPixel(name: EventName, params?: Record<string, any>) {
  if (!META_PIXEL_ID || typeof window === 'undefined' || !window.fbq) return;
  switch (name) {
    case 'click_pedir_whatsapp':
    case 'consultar_producto_whatsapp':
      // "Contact" es el evento estándar de Meta para "el usuario nos contactó"
      window.fbq('track', 'Contact', params || {});
      break;
    case 'abrir_catalogo':
      // "ViewContent" es el estándar para "vio el catálogo/producto"
      window.fbq('track', 'ViewContent', { content_name: 'catalogo', ...params });
      break;
  }
}

function fireInternal(name: EventName, params?: Record<string, any>) {
  if (typeof window === 'undefined') return
  // "Fire and forget" — no bloquea ni rompe nada si falla la red
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_name: name, event_params: params || {}, page_path: window.location.pathname }),
    keepalive: true,
  }).catch(() => {})
}

/** Dispara el evento en ambas plataformas (GA4 + Meta) y lo guarda en la base de datos para verlo en el panel admin. */
export function trackEvent(name: EventName, params?: Record<string, any>) {
  fireGA4(name, params);
  fireMetaPixel(name, params);
  fireInternal(name, params);
}
