'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Auth() {
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    if (error) setError(error.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  async function handleRegister() {
    setLoading(true)
    setError('')
    if (!regName || !regEmail || !regPassword) { setError('Please fill in all required fields.'); setLoading(false); return }
    if (regPassword.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return }
    const { data, error } = await supabase.auth.signUp({
      email: regEmail, password: regPassword,
      options: { data: { full_name: regName, phone: regPhone } }
    })
    if (error) { setError(error.message) }
    else if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, full_name: regName, phone: regPhone })
      setSuccess('Account created! Please check your email to confirm.')
      setTab('login')
      setLoginEmail(regEmail)
    }
    setLoading(false)
  }

  const inp = {width:'100%',border:'1px solid #ddd',borderRadius:'8px',padding:'11px 14px',fontSize:'14px',outline:'none',fontFamily:'inherit',boxSizing:'border-box' as const}
  const lbl = {fontSize:'13px',fontWeight:500 as const,color:'#333',display:'block' as const,marginBottom:'6px'}

  return (
    <div style={{minHeight:'calc(100vh - 67px)',display:'flex',alignItems:'center',justifyContent:'center',background:'#f8f8f8',padding:'32px'}}>
      <div style={{background:'white',border:'1px solid #eee',borderRadius:'16px',padding:'40px',width:'100%',maxWidth:'420px',boxShadow:'0 4px 24px rgba(0,0,0,.06)'}}>
        <div style={{textAlign:'center',marginBottom:'28px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',marginBottom:'6px'}}>
            <img src="/lion.jpg" alt="lion" style={{width:'40px',height:'40px',borderRadius:'50%',objectFit:'cover',objectPosition:'center 15%',border:'2px solid #ddd'}}/>
            <span style={{fontSize:'26px',fontWeight:800,letterSpacing:'2px',color:'#111'}}>HAGERHUB</span>
          </div>
          <div style={{fontSize:'12px',color:'#aaa'}}>The Hub of the Homeland</div>
        </div>

        <div style={{display:'flex',borderBottom:'1px solid #eee',marginBottom:'24px'}}>
          {['login','register'].map(t => (
            <button key={t} onClick={() => {setTab(t);setError('');setSuccess('')}}
              style={{flex:1,padding:'12px',fontSize:'14px',fontWeight:500,border:'none',
                borderBottom:tab===t?'2px solid #078754':'2px solid transparent',
                background:'none',color:tab===t?'#078754':'#999',cursor:'pointer',marginBottom:'-1px'}}>
              {t === 'login' ? 'Log in' : 'Register'}
            </button>
          ))}
        </div>

        {error && <div style={{background:'#fff0f0',border:'1px solid #ffcccc',borderRadius:'8px',padding:'10px 14px',marginBottom:'16px',fontSize:'13px',color:'#cc0000'}}>{error}</div>}
        {success && <div style={{background:'#f0fff4',border:'1px solid #b7f0c8',borderRadius:'8px',padding:'10px 14px',marginBottom:'16px',fontSize:'13px',color:'#078754'}}>{success}</div>}

        {tab === 'login' ? (
          <div>
            <div style={{marginBottom:'16px'}}><label style={lbl}>Email</label><input style={inp} type="email" placeholder="your@email.com" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}/></div>
            <div style={{marginBottom:'8px'}}><label style={lbl}>Password</label><input style={inp} type="password" placeholder="Enter password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}/></div>
            <div style={{textAlign:'right',fontSize:'12px',color:'#078754',cursor:'pointer',marginBottom:'20px'}}>Forgot password?</div>
            <button onClick={handleLogin} disabled={loading}
              style={{width:'100%',background:loading?'#aaa':'#078754',color:'white',border:'none',borderRadius:'8px',padding:'13px',fontSize:'14px',fontWeight:600,cursor:loading?'not-allowed':'pointer'}}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
            <div style={{textAlign:'center',fontSize:'13px',color:'#aaa',marginTop:'16px'}}>
              No account? <span onClick={()=>setTab('register')} style={{color:'#078754',cursor:'pointer',fontWeight:500}}>Register free →</span>
            </div>
          </div>
        ) : (
          <div>
            <div style={{marginBottom:'14px'}}><label style={lbl}>Full name *</label><input style={inp} placeholder="Your full name" value={regName} onChange={e=>setRegName(e.target.value)}/></div>
            <div style={{marginBottom:'14px'}}><label style={lbl}>Phone number</label><input style={inp} placeholder="+251 9XX XXX XXX" value={regPhone} onChange={e=>setRegPhone(e.target.value)}/></div>
            <div style={{marginBottom:'14px'}}><label style={lbl}>Email *</label><input style={inp} type="email" placeholder="your@email.com" value={regEmail} onChange={e=>setRegEmail(e.target.value)}/></div>
            <div style={{marginBottom:'20px'}}><label style={lbl}>Password * (min 6 chars)</label><input style={inp} type="password" placeholder="Create a strong password" value={regPassword} onChange={e=>setRegPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleRegister()}/></div>
            <button onClick={handleRegister} disabled={loading}
              style={{width:'100%',background:loading?'#aaa':'#078754',color:'white',border:'none',borderRadius:'8px',padding:'13px',fontSize:'14px',fontWeight:600,cursor:loading?'not-allowed':'pointer'}}>
              {loading ? 'Creating account...' : 'Create account — FREE'}
            </button>
            <div style={{textAlign:'center',fontSize:'13px',color:'#aaa',marginTop:'16px'}}>
              Already have an account? <span onClick={()=>setTab('login')} style={{color:'#078754',cursor:'pointer',fontWeight:500}}>Log in →</span>
            </div>
          </div>
        )}
        <div style={{textAlign:'center',fontSize:'11px',color:'#ccc',marginTop:'20px'}}>By continuing you agree to HagerHub Terms & Privacy Policy</div>
      </div>
    </div>
  )
}
