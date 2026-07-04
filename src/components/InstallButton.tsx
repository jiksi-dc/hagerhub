'use client'
import { useState, useEffect } from 'react'

export default function InstallButton() {
  const [deferred, setDeferred] = useState<any>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true)
    const onPrompt = (e: any) => { e.preventDefault(); setDeferred(e) }
    const onInstalled = () => { setInstalled(true); setDeferred(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!deferred || installed) return null

  return (
    <button
      onClick={async () => { deferred.prompt(); const r = await deferred.userChoice; if (r.outcome === 'accepted') setDeferred(null) }}
      style={{position:'fixed',bottom:'18px',left:'18px',zIndex:200,background:'#111',color:'#fff',border:'none',borderRadius:'24px',padding:'10px 18px',fontSize:'13px',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(0,0,0,0.25)',fontFamily:'inherit',display:'flex',alignItems:'center',gap:'7px'}}>
      ⬇ Install Ethiofy App
    </button>
  )
}
