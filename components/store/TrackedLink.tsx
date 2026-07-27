'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

/**
 * Envoltorio de <Link> que dispara un evento de analítica al hacer clic,
 * sin obligar a convertir toda la página (server component) en client.
 */
export function TrackedLink({
  href,
  event,
  eventParams,
  children,
  ...rest
}: {
  href: string;
  event: 'click_pedir_whatsapp' | 'abrir_catalogo' | 'consultar_producto_whatsapp';
  eventParams?: Record<string, any>;
  children: React.ReactNode;
} & React.ComponentProps<typeof Link>) {
  return (
    <Link href={href} onClick={() => trackEvent(event, eventParams)} {...rest}>
      {children}
    </Link>
  );
}
