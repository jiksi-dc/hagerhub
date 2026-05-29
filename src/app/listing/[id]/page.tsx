'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetch() {
      const { id } = await params
      const { data, error } = await createClient().from('listings').select('*').eq('id', id).single()
      console.log('id:', id, 'data:', data, 'error:', error)
      setListing(data)
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <div style={{padding:'40px',textAlign:'center'}}>Loading...</div>
  if (!listing) return <div style={{padding:'40px',textAlign:'center'}}>Listing not found</div>

  const img = listing.image_urls?.[0] || null

  return (
    <div style={{maxWidth:'600px',margin:'0 auto',paddingBottom:'40px'}}>
      <div style={{position:'relative',height:'300px',background:'#111'}}>
        {img && <img src={img} alt={listing.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>}
        <button onClick={()=>router.back()} style={{position:'absolute',top:'16px',left:'16px',background:'rgba(0,0,0,0.5)',color:'white',border:'none',borderRadius:'50%',width:'36px',height:'36px',fontSize:'18px',cursor:'pointer'}}>←</button>
      </div>
      <div style={{padding:'20px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:'8px'}}>
          <h1 style={{fontSize:'22px',fontWeight:'800',margin:0}}>{listing.title}</h1>
          <span style={{background:'#078754',color:'white',borderRadius:'20px',padding:'4px 12px',fontSize:'13px',fontWeight:'700'}}>{listing.category}</span>
        </div>
        <div style={{fontSize:'28px',fontWeight:'900',color:'#1a1a1a',marginBottom:'4px'}}>ETB {parseFloat(listing.price).toLocaleString()}</div>
        <div style={{color:'#666',fontSize:'14px',marginBottom:'16px'}}>📍 {listing.neighbourhood}, {listing.city}</div>
        <div style={{background:'#f9f9f9',borderRadius:'12px',padding:'16px',marginBottom:'16px'}}>
          <div style={{fontWeight:'700',marginBottom:'8px'}}>Description</div>
          <div style={{color:'#444',lineHeight:1.6}}>{listing.description}</div>
        </div>
        <div style={{background:'#f9f9f9',borderRadius:'12px',padding:'16px',marginBottom:'20px'}}>
          <div style={{fontWeight:'700',marginBottom:'8px'}}>Contact</div>
          <div style={{color:'#444'}}>{listing.contact_name}</div>
          <div style={{color:'#444'}}>{listing.contact_phone}</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          <a href={`https://wa.me/${listing.contact_phone?.replace(/\D/g,'')}`} target="_blank"
            style={{display:'block',width:'100%',background:'#25D366',color:'white',borderRadius:'14px',padding:'16px',fontSize:'15px',fontWeight:'900',textAlign:'center',textDecoration:'none',boxSizing:'border-box'}}>
            📱 WhatsApp
          </a>
          <a href={`https://t.me/${listing.contact_phone?.replace(/\D/g,'')}`} target="_blank"
            style={{display:'block',width:'100%',background:'#0088cc',color:'white',borderRadius:'14px',padding:'16px',fontSize:'15px',fontWeight:'900',textAlign:'center',textDecoration:'none',boxSizing:'border-box'}}>
            ✈️ Telegram
          </a>
          <a href={`tel:${listing.contact_phone}`}
            style={{display:'block',width:'100%',background:'#078754',color:'white',borderRadius:'14px',padding:'16px',fontSize:'15px',fontWeight:'900',textAlign:'center',textDecoration:'none',boxSizing:'border-box'}}>
            📞 Call {listing.contact_phone}
          </a>
          <div style={{display:'flex',gap:'12px'}}>
            <a href="https://facebook.com" target="_blank"
              style={{flex:1,background:'#1877F2',color:'white',borderRadius:'14px',padding:'16px',fontSize:'15px',fontWeight:'900',textAlign:'center',textDecoration:'none'}}>
              Facebook
            </a>
            <a href="https://instagram.com" target="_blank"
              style={{flex:1,background:'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',color:'white',borderRadius:'14px',padding:'16px',fontSize:'15px',fontWeight:'900',textAlign:'center',textDecoration:'none'}}>
              Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
