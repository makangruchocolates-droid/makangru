'use client'

import { FormEvent, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
      return
    }
    const next = searchParams.get('next')
    router.replace(next?.startsWith('/admin') ? next : '/admin')
    router.refresh()
  }

  return (
    <main style={{ minHeight:'100vh', display:'grid', placeItems:'center', padding:24, background:'#02000A' }}>
      <form onSubmit={submit} style={{ width:'100%', maxWidth:420, padding:'36px 32px', background:'rgba(10,6,20,.96)', border:'1px solid rgba(200,134,10,.28)' }}>
        <p style={{ color:'#C8860A', letterSpacing:4, fontSize:11, textTransform:'uppercase', marginBottom:10 }}>MAKANGRU</p>
        <h1 style={{ color:'#FDF6E8', fontFamily:'Cinzel,Georgia,serif', fontSize:28, marginBottom:8 }}>Acceso administrativo</h1>
        <p style={{ color:'#A89070', fontFamily:'Georgia,serif', lineHeight:1.6, marginBottom:26 }}>Ingresa con el usuario autorizado de Supabase.</p>
        <label style={{ display:'block', color:'#A89070', fontSize:12, marginBottom:8 }}>Correo</label>
        <input type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} style={{ width:'100%', padding:'12px 14px', marginBottom:18, color:'#FDF6E8', background:'#070311', border:'1px solid rgba(200,134,10,.28)' }} />
        <label style={{ display:'block', color:'#A89070', fontSize:12, marginBottom:8 }}>Contraseña</label>
        <input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} style={{ width:'100%', padding:'12px 14px', marginBottom:18, color:'#FDF6E8', background:'#070311', border:'1px solid rgba(200,134,10,.28)' }} />
        {error && <p role="alert" style={{ color:'#D4726A', fontSize:13, marginBottom:16 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ width:'100%', padding:13, border:0, cursor:loading?'wait':'pointer', background:'linear-gradient(135deg,#C8860A,#E8B84B)', color:'#02000A', fontWeight:700, letterSpacing:2 }}>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </main>
  )
}

export default function LoginPage() {
  return <Suspense fallback={<main style={{ minHeight:'100vh', background:'#02000A' }} />}><LoginForm /></Suspense>
}
