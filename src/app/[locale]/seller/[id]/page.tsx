'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AuthButton from '@/components/AuthButton'
import AIAssistant from '@/components/AIAssistant'
import LanguageSwitcher from '@/components/LanguageSwitcher'

interface Profile {
  id: string; full_name: string; phone: string; verified: boolean; created_at: string
}
interface Listing {
  id: string; title: string; price_label: string; city: string; neighbourhood: string
  category: string; subcategory: string; image_urls?: string[]; created_at: string
}

const IMGS: Record<string,string> = {
  Properties:'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80',
  Vehicles:  'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&q=80',
  Machinery: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=400&q=80',
  Classifieds:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
  Jobs:      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80',
}

export default function SellerProfile() {
  const params = useParams()
  const locale = params.locale as string
  const sellerId = params.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('profiles').select('*').eq('id', sellerId).single(),
      supabase.from('listings').select('*').eq('user_id', sellerId).eq('status', 'active').order('created_at', { ascending: false })
    ]).then(([{ data: p }, { data: l }]) => {
      setProfile(p)
      setListings(l || [])
      setLoading(false)
    })
  }, [sellerId])

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-ET', { year: 'numeric', month: 'long' })
    : ''

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,sans-serif',color:'#9CA3AF'}}>Loading...</div>
  )

  return (
    <main style={{minHeight:'100vh',background:'#F9FAFB',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <style>{'*{box-sizing:border-box;margin:0;padding:0}'}</style>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,background:'#fff',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 20px',height:'56px',display:'flex',alignItems:'center',gap:'12px'}}>
          <a href={`/${locale}`} style={{textDecoration:'none',flexShrink:0}}>
            <div style={{fontSize:'15px',fontWeight:900,color:'#111',letterSpacing:'2px'}}>HAGERHUB</div>
            <div style={{fontSize:'8px',color:'#9CA3AF',letterSpacing:'1.5px',marginTop:'1px'}}>ETHIOPIA'S #1 MARKETPLACE</div>
          </a>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'10px'}}>
            <AuthButton/>
            <a href={`/${locale}/post`} style={{fontSize:'13px',fontWeight:600,padding:'9px 18px',background:'#111',color:'white',borderRadius:'8px',textDecoration:'none',whiteSpace:'nowrap'}}>+ Post Ad</a>
            <LanguageSwitcher/>
            <AIAssistant/>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'32px 20px'}}>

        {/* PROFILE CARD */}
        <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #F3F4F6',padding:'32px',marginBottom:'24px',display:'flex',alignItems:'center',gap:'24px'}}>
          {/* Avatar */}
          <div style={{width:'80px',height:'80px',borderRadius:'50%',background:'linear-gradient(135deg,#2563EB,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',fontWeight:800,color:'white',flexShrink:0}}>
            {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>

          {/* Info */}
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
              <h1 style={{fontSize:'20px',fontWeight:800,color:'#111'}}>
                {profile?.full_name || 'Seller'}
              </h1>
              {profile?.verified && (
                <span style={{display:'inline-flex',alignItems:'center',gap:'4px',background:'#ECFDF5',color:'#059669',fontSize:'11px',fontWeight:700,padding:'3px 10px',borderRadius:'20px'}}>
                  ✓ Verified Seller
                </span>
              )}
            </div>
            <div style={{fontSize:'13px',color:'#6B7280',marginBottom:'4px'}}>
              Member since {memberSince}
            </div>
            <div style={{fontSize:'13px',color:'#6B7280'}}>
              {listings.length} active listing{listings.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Safety tip */}
          <div style={{background:'#FFFBEB',border:'1px solid #FEF3C7',borderRadius:'12px',padding:'14px 18px',maxWidth:'260px'}}>
            <div style={{fontSize:'11px',fontWeight:700,color:'#92400E',marginBottom:'4px'}}>Safety tip</div>
            <div style={{fontSize:'11px',color:'#92400E',lineHeight:1.6}}>Always meet in a public place. Never transfer money before seeing the item.</div>
          </div>
        </div>

        {/* LISTINGS */}
        <div style={{marginBottom:'16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2 style={{fontSize:'15px',fontWeight:700,color:'#111'}}>Listings by this seller</h2>
          <span style={{fontSize:'12px',color:'#9CA3AF'}}>{listings.length} total</span>
        </div>

        {listings.length === 0 ? (
          <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #F3F4F6',padding:'60px',textAlign:'center',color:'#9CA3AF',fontSize:'14px'}}>
            No active listings from this seller.
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'16px'}}>
            {listings.map(l => {
              const img = l.image_urls?.[0] || IMGS[l.category] || ''
              return (
                <div key={l.id}
                  onClick={() => window.location.href = `/${locale}/listing/${l.id}`}
                  style={{background:'#fff',borderRadius:'12px',overflow:'hidden',border:'1px solid #F3F4F6',cursor:'pointer'}}>
                  <div style={{height:'160px',background:'#F9FAFB',position:'relative'}}>
                    {img && <img src={img} alt={l.title} style={{width:'100%',height:'100%',objectFit:'contain'}}/>}
                    <div style={{position:'absolute',bottom:'8px',left:'8px',background:'rgba(0,0,0,0.7)',color:'white',fontSize:'12px',fontWeight:700,padding:'3px 8px',borderRadius:'6px'}}>
                      {l.price_label}
                    </div>
                    <div style={{position:'absolute',top:'8px',left:'8px',background:'#2563EB',color:'white',fontSize:'10px',fontWeight:600,padding:'2px 7px',borderRadius:'5px'}}>
                      {l.subcategory || l.category}
                    </div>
                  </div>
                  <div style={{padding:'10px 12px 12px'}}>
                    <div style={{fontSize:'13px',fontWeight:600,color:'#111',marginBottom:'3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
                    <div style={{fontSize:'11px',color:'#6B7280'}}>{l.neighbourhood}, {l.city}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
