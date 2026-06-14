import type { Metadata } from 'next'
import { Cinzel, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({ subsets:['latin'], variable:'--font-cinzel', display:'swap', weight:['400','600','700'] })
const cormorant = Cormorant_Garamond({ subsets:['latin'], variable:'--font-cormorant', weight:['300','400','500','600'], style:['normal','italic'], display:'swap' })

export const metadata: Metadata = {
  title: { default:'MAKANGRU · Atelier de la Alquimia Chocolística', template:'%s · MAKANGRU' },
  description:'Donde el cacao encuentra las estrellas. Alta Chocolatería Cósmica artesanal desde Chile.',
  keywords:['chocolate artesanal','alta chocolatería','chocolates premium','chocolates Chile','regalo gourmet','bombones'],
  openGraph:{ type:'website', locale:'es_CL', siteName:'MAKANGRU', title:'MAKANGRU · Atelier de la Alquimia Chocolística', description:'Donde el cacao encuentra las estrellas.' },
}

export default function RootLayout({ children }:{ children:React.ReactNode }) {
  return (
    <html lang="es" className={`${cinzel.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  )
}
