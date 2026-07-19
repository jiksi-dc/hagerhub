'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import AuthButton from '@/components/AuthButton'

export default function ContactPage() {
  const params = useParams()
  const locale = params.locale as string
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle')
  const [error, setError] = useState('')

  const submit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) { setError('Please fill in your name, email, and message.'); return }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setError('Please enter a valid email address.'); return }
    setError(''); setStatus('sending')
    try {
      const supabase = createClient()
      const { error } = await supabase.from('inquiries').insert({ type: 'contact', name, email, subject, message })
      if (error) { setStatus('error'); setError('Something went wrong. Please try again.'); return }
      setStatus('sent')
    } catch { setStatus('error'); setError('Something went wrong. Please try again.') }
  }

  const field: React.CSSProperties = {width:'100%',padding:'12px 14px',border:'1.5px solid #E5E7EB',borderRadius:'10px',fontSize:'14px',outline:'none',fontFamily:'inherit',background:'#fff',color:'#111',marginTop:'6px'}
  const lbl: React.CSSProperties = {fontSize:'12px',fontWeight:700,color:'#374151',display:'block'}

  return (
    <main style={{minHeight:'100vh',background:'#F9FAFB',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <style>{'*{box-sizing:border-box;margin:0;padding:0}'}</style>
      <nav style={{position:'sticky',top:0,zIndex:100,background:'#fff',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 20px',height:'56px',display:'flex',alignItems:'center',gap:'12px'}}>
          <a href={`/${locale}`} style={{textDecoration:'none',flexShrink:0}}>
            <div style={{fontSize:'15px',fontWeight:900,color:'#111',letterSpacing:'2px'}}>ETHIOFY</div>
            <div style={{fontSize:'8px',color:'#9CA3AF',letterSpacing:'1.5px',marginTop:'1px'}}>ETHIOPIA&apos;S #1 MARKETPLACE</div>
          </a>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'10px'}}>
            <AuthButton/>
            <LanguageSwitcher/>
          </div>
        </div>
      </nav>
      <div style={{maxWidth:'560px',margin:'0 auto',padding:'48px 20px 80px'}}>
        <h1 style={{fontSize:'28px',fontWeight:900,color:'#111',marginBottom:'8px'}}>Contact Us</h1>
        <div style={{fontSize:'14px',color:'#6B7280',lineHeight:1.7,marginBottom:'28px'}}>Have a question or need help? Send us a message and our team will get back to you.</div>
        {status === 'sent' ? (
          <div style={{padding:'24px',background:'#ECFDF5',border:'1px solid #A7F3D0',borderRadius:'12px',textAlign:'center'}}>
            <div style={{fontSize:'16px',fontWeight:700,color:'#065F46',marginBottom:'6px'}}>Message sent</div>
            <div style={{fontSize:'14px',color:'#047857',lineHeight:1.7}}>Thanks for reaching out. We&apos;ll respond as soon as we can.</div>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'18px'}}>
            <div><label style={lbl}>Name</label><input value={name} onChange={e=>setName(e.target.value)} style={field} placeholder="Your name" autoComplete="name"/></div>
            <div><label style={lbl}>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} style={field} placeholder="you@example.com" type="email" autoComplete="email"/></div>
            <div><label style={lbl}>Subject</label><input value={subject} onChange={e=>setSubject(e.target.value)} style={field} placeholder="What is this about?"/></div>
            <div><label style={lbl}>Message</label><textarea value={message} onChange={e=>setMessage(e.target.value)} style={{...field,minHeight:'120px',resize:'vertical'}} placeholder="How can we help?"/></div>
            {error && <div style={{fontSize:'13px',color:'#DC2626'}}>{error}</div>}
            <button onClick={submit} disabled={status==='sending'} style={{padding:'13px',background:'#111',color:'#fff',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',opacity:status==='sending'?0.6:1}}>{status==='sending'?'Sending…':'Send message'}</button>
          </div>
        )}
      </div>
    </main>
  )
}
