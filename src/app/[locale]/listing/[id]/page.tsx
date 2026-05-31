'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AuthButton from '@/components/AuthButton'
import AIAssistant from '@/components/AIAssistant'
import LanguageSwitcher from '@/components/LanguageSwitcher'

interface Listing {
  id: string; title: string; description: string; price_label: string
  city: string; neighbourhood: string; category: string; subcategory: string
  image_urls?: string[]; created_at: string; user_id: string
}

const IMGS: Record<string,string> = {
  Properties:'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=85',
  Vehicles:  'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=85',
  Machinery: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=800&q=85',
  Classifieds:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=85',
  Jobs:      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=85',
}

export default function ListingPage() {
  const params = useParams()
  const locale = params.locale as string
  const id = params.id as string

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('listings').select('*').eq('id', id).single()
      .then(({ data }) => { setListing(data); setLoading(false) })
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        supabase.from('saved_listings').select('id').eq('user_id', data.user.id).eq('listing_id', id).single()
          .then(({ data: s }) => setSaved(!!s))
      }
    })
  }, [id])

  const toggleSave = async () => {
    if (!user) { window.location.href = `/${locale}/login`; return }
    const supabase = createClient()
    if (saved) {
      await supabase.from('saved_listings').delete().eq('user_id', user.id).eq('listing_id', id)
    } else {
      await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: id })
    }
    setSaved(!saved)
  }

  const imgs = listing?.image_urls?.length ? listing.image_urls : [IMGS[listing?.category || ''] || '']

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,sans-serif',color:'#9CA3AF'}}>
      Loading...
    </div>
  )

  if (!listing) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,sans-serif',color:'#9CA3AF'}}>
      Listing not found.
    </div>
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

      {/* BREADCRUMB */}
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'14px 20px',fontSize:'12px',color:'#6B7280'}}>
        <a href={`/${locale}`} style={{color:'#6B7280',textDecoration:'none'}}>Home</a>
        <span style={{margin:'0 6px'}}>›</span>
        <span style={{color:'#6B7280'}}>{listing.category}</span>
        <span style={{margin:'0 6px'}}>›</span>
        <span style={{color:'#111'}}>{listing.title}</span>
      </div>

      {/* MAIN CONTENT */}
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 20px 40px',display:'grid',gridTemplateColumns:'1fr 340px',gap:'24px',alignItems:'start'}}>

        {/* LEFT */}
        <div>
          {/* IMAGE GALLERY */}
          <div style={{background:'#fff',borderRadius:'14px',overflow:'hidden',border:'1px solid #F3F4F6',marginBottom:'16px'}}>
            <div style={{position:'relative',height:'480px',background:'#F9FAFB'}}>
              {imgs[activeImg] && (
                <img src={imgs[activeImg]} alt={listing.title}
                  style={{width:'100%',height:'100%',objectFit:'contain'}}/>
              )}
              <div style={{position:'absolute',top:'12px',left:'12px',background:'#2563EB',color:'white',fontSize:'11px',fontWeight:600,padding:'3px 10px',borderRadius:'6px'}}>
                {listing.subcategory || listing.category}
              </div>
              <button onClick={toggleSave}
                style={{position:'absolute',top:'12px',right:'12px',background:'rgba(255,255,255,0.95)',border:'none',borderRadius:'50%',width:'36px',height:'36px',fontSize:'18px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
                {saved ? '♥' : '♡'}
              </button>
            </div>
            {imgs.length > 1 && (
              <div style={{display:'flex',gap:'8px',padding:'12px',overflowX:'auto'}}>
                {imgs.map((img, i) => (
                  <div key={i} onClick={() => setActiveImg(i)}
                    style={{width:'72px',height:'54px',borderRadius:'6px',overflow:'hidden',cursor:'pointer',border:activeImg===i?'2px solid #2563EB':'2px solid transparent',flexShrink:0}}>
                    <img src={img} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #F3F4F6',padding:'24px'}}>
            <h1 style={{fontSize:'20px',fontWeight:700,color:'#111',marginBottom:'8px'}}>{listing.title}</h1>
            <div style={{fontSize:'12px',color:'#9CA3AF',marginBottom:'20px'}}>
              {listing.neighbourhood}, {listing.city} · Posted {new Date(listing.created_at).toLocaleDateString('en-ET',{year:'numeric',month:'long',day:'numeric'})}
            </div>
            <div style={{fontSize:'13px',color:'#374151',lineHeight:1.7,whiteSpace:'pre-wrap'}}>
              {listing.description || 'No description provided.'}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{display:'flex',flexDirection:'column',gap:'14px',position:'sticky',top:'76px'}}>
          {/* PRICE CARD */}
          <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #F3F4F6',padding:'20px'}}>
            <div style={{fontSize:'26px',fontWeight:800,color:'#111',marginBottom:'4px'}}>{listing.price_label}</div>
            <div style={{fontSize:'12px',color:'#9CA3AF',marginBottom:'20px'}}>{listing.city}</div>

            <button style={{width:'100%',padding:'12px',background:'#111',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',marginBottom:'10px'}}>
              Contact Seller
            </button>
            <button onClick={toggleSave}
              style={{width:'100%',padding:'12px',background:saved?'#EFF6FF':'#F9FAFB',color:saved?'#2563EB':'#374151',border:`1.5px solid ${saved?'#2563EB':'#E5E7EB'}`,borderRadius:'10px',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
              {saved ? '♥ Saved' : '♡ Save listing'}
            </button>
          </div>

          {/* DETAILS */}
          <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #F3F4F6',padding:'20px'}}>
            <div style={{fontSize:'12px',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:'#9CA3AF',marginBottom:'14px'}}>Details</div>
            {[
              ['Category', listing.category],
              ['Type', listing.subcategory],
              ['Location', `${listing.neighbourhood}, ${listing.city}`],
            ].map(([label, value]) => value && (
              <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #F3F4F6',fontSize:'13px'}}>
                <span style={{color:'#6B7280'}}>{label}</span>
                <span style={{color:'#111',fontWeight:500}}>{value}</span>
              </div>
            ))}
          </div>

          {/* SAFETY TIP */}
          <div style={{background:'#FFFBEB',borderRadius:'14px',border:'1px solid #FEF3C7',padding:'16px'}}>
            <div style={{fontSize:'12px',fontWeight:700,color:'#92400E',marginBottom:'6px'}}>Safety tip</div>
            <div style={{fontSize:'12px',color:'#92400E',lineHeight:1.6}}>Meet in a safe public place. Never send money in advance. Verify the item before paying.</div>
          </div>
        </div>
      </div>
    </main>
  )
}
