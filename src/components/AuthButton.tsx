'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
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
    <a href="/login" style={{fontSize:'13px',fontWeight:600,padding:'8px 18px',background:'#0057D9',color:'white',borderRadius:'20px',textDecoration:'none'}}>
      Sign in
    </a>
  )

  const meta = user.user_metadata; const initials = meta?.first_name && meta?.last_name ? (meta.first_name[0] + meta.last_name[0]).toUpperCase() : user.email?.slice(0,2).toUpperCase() ?? 'U'

  return (
    <div style={{position:'fixed',top:'12px',left:'12px',zIndex:1000}}>
      <button onClick={()=>setMenuOpen(o=>!o)}
        style={{width:'36px',height:'36px',borderRadius:'50%',background:'#0057D9',color:'white',fontSize:'13px',fontWeight:700,border:'none',cursor:'pointer'}}>
        {initials}
      </button>
      {menuOpen && (
        <div style={{position:'absolute',left:0,top:'44px',background:'white',border:'1px solid #e5e7eb',borderRadius:'12px',boxShadow:'0 4px 20px rgba(0,0,0,0.12)',width:'180px',padding:'8px',zIndex:999}}>
          <p style={{fontSize:'11px',color:'#9ca3af',padding:'4px 8px',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.email}</p>
          <hr style={{margin:'6px 0',border:'none',borderTop:'1px solid #f3f4f6'}}/>
          <button onClick={signOut}
            style={{width:'100%',textAlign:'left',padding:'8px',fontSize:'13px',color:'#ef4444',background:'none',border:'none',cursor:'pointer',borderRadius:'8px'}}>
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
