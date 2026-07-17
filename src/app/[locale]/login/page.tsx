'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextParam = searchParams.get('next')
  const nextUrl = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/'
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else { router.push(nextUrl); router.refresh() }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f9fafb',padding:'16px'}}>
      <div style={{background:'white',borderRadius:'16px',padding:'32px',maxWidth:'360px',width:'100%',boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
        <div style={{height:'4px',borderRadius:'4px',marginBottom:'24px',background:'linear-gradient(90deg,#22c55e,#facc15,#ef4444)'}}/>
        <h1 style={{fontSize:'24px',fontWeight:700,marginBottom:'4px'}}>Welcome back</h1>
        <p style={{fontSize:'14px',color:'#6b7280',marginBottom:'24px'}}>Sign in to Ethiofy</p>
        {error && <div style={{marginBottom:'16px',padding:'12px',background:'#fef2f2',color:'#b91c1c',fontSize:'14px',borderRadius:'8px'}}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block',fontSize:'14px',fontWeight:500,marginBottom:'4px'}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              style={{width:'100%',padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
              placeholder="you@example.com"/>
          </div>
          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block',fontSize:'14px',fontWeight:500,marginBottom:'4px'}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
              style={{width:'100%',padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
              placeholder="••••••••"/>
          </div>
          <button type="submit" disabled={loading}
            style={{width:'100%',padding:'10px',background:'#facc15',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:600,cursor:'pointer',opacity:loading?0.5:1}}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p style={{textAlign:'center',fontSize:'14px',color:'#6b7280',marginTop:'24px'}}>
          No account?{' '}
          <Link href="/register" style={{color:'#ca8a04',fontWeight:500}}>Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
