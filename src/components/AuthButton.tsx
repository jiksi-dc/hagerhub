'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthButton() {
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.refresh()
  }

  if (!user) return (
    <a href="/login" style={{fontSize:'13px',fontWeight:600,padding:'9px 18px',background:'#fff',color:'#111',borderRadius:'8px',textDecoration:'none',border:'1.5px solid #E5E7EB',whiteSpace:'nowrap'}}>Sign in</a>
  )

  const meta = user.user_metadata
  const initials = meta?.first_name && meta?.last_name
    ? (meta.first_name[0] + meta.last_name[0]).toUpperCase()
    : user.email?.slice(0,2).toUpperCase() ?? 'U'

  return (
    <div style={{position:'relative'}}>
      <button onClick={()=>setMenuOpen(o=>!o)} style={{width:'36px',height:'36px',borderRadius:'50%',background:'#2563EB',color:'white',fontSize:'13px',fontWeight:700,border:'none',cursor:'pointer',fontFamily:'inherit'}}>
        {initials}
      </button>
      {menuOpen && (
        <div style={{position:'absolute',right:0,top:'44px',background:'white',border:'1px solid #E5E7EB',borderRadius:'12px',boxShadow:'0 4px 20px rgba(0,0,0,0.12)',width:'180px',padding:'8px',zIndex:999}}>
          <p style={{fontSize:'11px',color:'#9CA3AF',padding:'4px 8px',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.email}</p>
          <hr style={{margin:'6px 0',border:'none',borderTop:'1px solid #F3F4F6'}}/>
          <button onClick={signOut} style={{width:'100%',textAlign:'left',padding:'8px',fontSize:'13px',color:'#EF4444',background:'none',border:'none',cursor:'pointer',borderRadius:'8px',fontFamily:'inherit'}}>Sign out</button>
        </div>
      )}
    </div>
  )
}
