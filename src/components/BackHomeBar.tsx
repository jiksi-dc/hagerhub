'use client'
import { useParams, useRouter } from 'next/navigation'

export default function BackHomeBar() {
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) || 'en'

  const goBack = () => {
    // If there's in-app history, go back; otherwise go home (avoids logout on cold entry)
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push(`/${locale}`)
    }
  }

  return (
    <div style={{maxWidth:'1280px',margin:'0 auto',padding:'10px 20px 0',display:'flex',gap:'8px'}}>
      <button onClick={goBack}
        style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'7px 14px',background:'#fff',color:'#374151',border:'1.5px solid #E5E7EB',borderRadius:'8px',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
        ← Back
      </button>
      <button onClick={() => router.push(`/${locale}`)}
        style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'7px 14px',background:'#fff',color:'#374151',border:'1.5px solid #E5E7EB',borderRadius:'8px',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
        Home
      </button>
    </div>
  )
}
