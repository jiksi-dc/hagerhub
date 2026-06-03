'use client'
import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function BoostSuccess() {
  const locale = useLocale()
  const searchParams = useSearchParams()
  const listingId = searchParams.get('listing_id')
  const [listing, setListing] = useState<any>(null)

  useEffect(() => {
    if (!listingId) return
    createClient().from('listings').select('title').eq('id', listingId).single()
      .then(({ data }) => setListing(data))
  }, [listingId])

  return (
    <main style={{ minHeight:'100vh', background:'#F9FAFB', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px' }}>
      <div style={{ maxWidth:'480px', width:'100%', textAlign:'center' }}>
        <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'linear-gradient(135deg,#B8860B,#DAA520)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', margin:'0 auto 24px' }}>⭐</div>
        <h1 style={{ fontSize:'26px', fontWeight:900, color:'#111', marginBottom:'12px' }}>Your listing is boosted!</h1>
        {listing && <p style={{ fontSize:'15px', color:'#6B7280', marginBottom:'8px' }}><strong style={{ color:'#111' }}>{listing.title}</strong></p>}
        <p style={{ fontSize:'14px', color:'#6B7280', lineHeight:1.6, marginBottom:'32px' }}>Your listing is now featured and will get up to 10x more views. It will appear in the Featured section on the homepage.</p>
        <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #F3F4F6', padding:'20px', marginBottom:'24px', textAlign:'left' }}>
          <div style={{ fontSize:'12px', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px' }}>What happens next</div>
          {[{icon:'✅',text:'Payment confirmed'},{icon:'⭐',text:'Listing marked as Featured'},{icon:'📈',text:'Appearing in Featured section on homepage'},{icon:'📧',text:'Confirmation sent to your email'}].map((item,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'10px' }}>
              <span style={{ fontSize:'18px' }}>{item.icon}</span>
              <span style={{ fontSize:'13px', color:'#374151' }}>{item.text}</span>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {listingId && <a href={`/${locale}/listing/${listingId}`} style={{ display:'block', background:'#111', color:'white', padding:'14px', borderRadius:'12px', fontSize:'14px', fontWeight:700, textDecoration:'none' }}>View my listing →</a>}
          <a href={`/${locale}`} style={{ display:'block', background:'#F3F4F6', color:'#374151', padding:'14px', borderRadius:'12px', fontSize:'14px', fontWeight:600, textDecoration:'none' }}>Back to homepage</a>
        </div>
      </div>
    </main>
  )
}
