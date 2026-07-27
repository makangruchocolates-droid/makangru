'use client';

import { trackEvent } from '@/lib/analytics';

export function WhatsappConsultLink({ productName }: { productName: string }) {
  return (
    <a
      href={`https://wa.me/56951975639?text=Hola+MAKANGRU+✦+me+interesa:+${encodeURIComponent(productName)}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('consultar_producto_whatsapp', { producto: productName })}
      style={{ color:'#25D366', textDecoration:'none', fontFamily:'var(--font-body)', fontSize:13, display:'flex', alignItems:'center', gap:6 }}
    >
      💬 Consultar por WhatsApp
    </a>
  );
}
