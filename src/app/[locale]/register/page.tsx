'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: { first_name: firstName, last_name: lastName }
      }
    })
    if (error) { setError(error.message); setLoading(false) }
    else setDone(true)
  }

  if (done) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f9fafb',padding:'16px'}}>
      <div style={{background:'white',borderRadius:'16px',padding:'32px',maxWidth:'360px',width:'100%',textAlign:'center'}}>
        <div style={{fontSize:'48px',marginBottom:'16px'}}>📧</div>
        <h2 style={{fontSize:'20px',fontWeight:700,marginBottom:'8px'}}>Check your email</h2>
        <p style={{color:'#6b7280',fontSize:'14px'}}>We sent a confirmation link to <strong>{email}</strong></p>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f9fafb',padding:'16px'}}>
      <div style={{background:'white',borderRadius:'16px',padding:'32px',maxWidth:'360px',width:'100%',boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
        <div style={{height:'4px',borderRadius:'4px',marginBottom:'24px',background:'linear-gradient(90deg,#22c55e,#facc15,#ef4444)'}}/>
        <h1 style={{fontSize:'24px',fontWeight:700,marginBottom:'4px'}}>Create account</h1>
        <p style={{fontSize:'14px',color:'#6b7280',marginBottom:'24px'}}>Join HagerHub</p>
        {error && <div style={{marginBottom:'16px',padding:'12px',background:'#fef2f2',color:'#b91c1c',fontSize:'14px',borderRadius:'8px'}}>{error}</div>}
        <form onSubmit={handleRegister}>
          <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
            <div style={{flex:1}}>
              <label style={{display:'block',fontSize:'14px',fontWeight:500,marginBottom:'4px'}}>First name</label>
              <input type="text" value={firstName} onChange={e=>setFirstName(e.target.value)} required
                style={{width:'100%',padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
                placeholder="Jiksi"/>
            </div>
            <div style={{flex:1}}>
              <label style={{display:'block',fontSize:'14px',fontWeight:500,marginBottom:'4px'}}>Last name</label>
              <input type="text" value={lastName} onChange={e=>setLastName(e.target.value)} required
                style={{width:'100%',padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
                placeholder="Michael"/>
            </div>
          </div>
          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block',fontSize:'14px',fontWeight:500,marginBottom:'4px'}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              style={{width:'100%',padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
              placeholder="you@example.com"/>
          </div>
          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block',fontSize:'14px',fontWeight:500,marginBottom:'4px'}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}
              style={{width:'100%',padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
              placeholder="Min 6 characters"/>
          </div>
          <button type="submit" disabled={loading}
            style={{width:'100%',padding:'10px',background:'#facc15',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:600,cursor:'pointer',opacity:loading?0.5:1}}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p style={{textAlign:'center',fontSize:'14px',color:'#6b7280',marginTop:'24px'}}>
          Already have an account?{' '}
          <Link href="/login" style={{color:'#ca8a04',fontWeight:500}}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
