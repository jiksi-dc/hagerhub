'use client'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AuthButton from '@/components/AuthButton'

const TIERS = [
  {
    id: 'featured',
    name: 'Featured',
    weekly: 2,
    monthly: 7,
    badge: 'Featured',
    description: 'Your listing appears in the Featured sidebar with a gold badge across the entire site.',
    perks: ['Gold Featured badge on your listing','Sidebar placement on all pages','~10x more views than standard','Subtle shimmer animation effect'],
  },
  {
    id: 'top',
    name: 'Top Ad',
    weekly: 5,
    monthly: 18,
    badge: 'Top Ad',
    description: 'Maximum visibility. Pinned to the top of your category above all other listings.',
    perks: ['Pinned to top of category','Priority in search results','~25x more views than standard','Gold border highlight'],
    popular: true,
  },
]

export default function BoostPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = params.locale as string
  const listing_id = searchParams.get('listing_id') || ''
  const cancelled = searchParams.get('cancelled')

  const [listing, setListing] = useState<any>(null)
  const [billingPeriod, setBillingPeriod] = useState<'weekly'|'monthly'>('weekly')
  const [loading, setLoading] = useState<string|null>(null)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    if (listing_id) {
      supabase.from('listings').select('id,title,price_label,city,category,image_urls').eq('id', listing_id).single()
        .then(({ data }) => setListing(data))
    }
  }, [listing_id])

  const handleBoost = async (tierId: string) => {
    if (!user) { window.location.href = `/${locale}/login`; return }
    if (!listing_id) { setError('No listing selected. Go to your listing and click Boost.'); return }
    setLoading(tierId); setError('')
    try {
      const res = await fetch('/api/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id, tier: billingPeriod === 'monthly' ? tierId + '_month' : tierId, locale })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError(data.error || 'Something went wrong')
    } catch (e: any) { setError(e.message) }
    setLoading(null)
  }

  return (
    <main style={{minHeight:'100vh',background:'#F9FAFB',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <style>{'*{box-sizing:border-box;margin:0;padding:0} @keyframes goldglow{0%,100%{box-shadow:0 0 0 rgba(218,165,32,0)}50%{box-shadow:0 6px 28px rgba(218,165,32,0.18)}}'}</style>

      <nav style={{background:'#fff',borderBottom:'1px solid #EBEBEB',padding:'0 20px',height:'56px',display:'flex',alignItems:'center',gap:'12px'}}>
        <a href={`/${locale}`} style={{fontSize:'15px',fontWeight:900,color:'#111',letterSpacing:'2px',textDecoration:'none'}}>GOHBAY</a>
        <span style={{color:'#E5E7EB'}}>›</span>
        <span style={{fontSize:'13px',color:'#6B7280',fontWeight:600}}>Boost listing</span>
        <div style={{marginLeft:'auto'}}><AuthButton/></div>
      </nav>

      <div style={{maxWidth:'800px',margin:'0 auto',padding:'40px 20px'}}>

        {cancelled && <div style={{background:'#FFF7ED',border:'1px solid #FED7AA',borderRadius:'12px',padding:'14px 18px',marginBottom:'24px',color:'#92400E',fontSize:'13px'}}>Payment cancelled — you have not been charged.</div>}

        <div style={{textAlign:'center',marginBottom:'36px'}}>
          <div style={{fontSize:'28px',fontWeight:900,color:'#111',marginBottom:'8px'}}>Get more buyers, faster</div>
          <div style={{fontSize:'15px',color:'#6B7280',maxWidth:'440px',margin:'0 auto',lineHeight:1.7}}>
            Boost your listing to the top and reach thousands of buyers across Ethiopia. Payments processed securely in USD.
          </div>
        </div>

        {/* Listing preview */}
        {listing && (
          <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #F3F4F6',padding:'16px 20px',marginBottom:'28px',display:'flex',alignItems:'center',gap:'14px'}}>
            {listing.image_urls?.[0] && <img src={listing.image_urls[0]} alt={listing.title} style={{width:'56px',height:'56px',borderRadius:'8px',objectFit:'cover'}}/>}
            <div style={{flex:1}}>
              <div style={{fontSize:'11px',color:'#9CA3AF',marginBottom:'2px'}}>{listing.category} · {listing.city}</div>
              <div style={{fontSize:'14px',fontWeight:700,color:'#111'}}>{listing.title}</div>
              <div style={{fontSize:'13px',fontWeight:600,color:'#2563EB'}}>{listing.price_label}</div>
            </div>
            <div style={{fontSize:'10px',color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'1px'}}>Your listing</div>
          </div>
        )}

        {/* Billing toggle */}
        <div style={{display:'flex',justifyContent:'center',marginBottom:'28px'}}>
          <div style={{background:'#F3F4F6',borderRadius:'12px',padding:'4px',display:'inline-flex',gap:'4px'}}>
            {(['weekly','monthly'] as const).map(p => (
              <button key={p} onClick={()=>setBillingPeriod(p)}
                style={{padding:'8px 24px',borderRadius:'9px',border:'none',background:billingPeriod===p?'#fff':'transparent',color:billingPeriod===p?'#111':'#6B7280',fontWeight:700,fontSize:'13px',cursor:'pointer',fontFamily:'inherit',boxShadow:billingPeriod===p?'0 1px 4px rgba(0,0,0,0.08)':'none',transition:'all .15s'}}>
                {p.charAt(0).toUpperCase()+p.slice(1)}
                {p==='monthly' && <span style={{fontSize:'10px',background:'#ECFDF5',color:'#059669',padding:'2px 6px',borderRadius:'6px',marginLeft:'6px',fontWeight:700}}>Save 40%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Tier cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'16px',marginBottom:'28px'}}>
          {TIERS.map(tier => (
            <div key={tier.id}
              style={{background:'#fff',borderRadius:'16px',border:tier.popular?'2px solid #111':'1px solid #F3F4F6',padding:'28px',position:'relative',animation:'goldglow 4s ease-in-out infinite',transition:'transform .15s'}}>
              {tier.popular && <div style={{position:'absolute',top:'-11px',left:'50%',transform:'translateX(-50%)',background:'#111',color:'white',fontSize:'9px',fontWeight:800,padding:'3px 14px',borderRadius:'20px',letterSpacing:'1.5px',whiteSpace:'nowrap'}}>MOST POPULAR</div>}

              <div style={{display:'inline-flex',alignItems:'center',gap:'6px',background:'#F9FAFB',border:'1px solid #E5E7EB',borderRadius:'8px',padding:'5px 12px',marginBottom:'16px'}}>
                <span style={{fontSize:'12px',fontWeight:800,color:'#111'}}>{tier.name}</span>
              </div>

              <div style={{marginBottom:'8px'}}>
                <span style={{fontSize:'32px',fontWeight:900,color:'#111'}}>${billingPeriod==='weekly'?tier.weekly:tier.monthly}</span>
                <span style={{fontSize:'13px',color:'#6B7280',marginLeft:'4px'}}>/{billingPeriod==='weekly'?'week':'month'}</span>
              </div>

              <div style={{fontSize:'13px',color:'#6B7280',lineHeight:1.7,marginBottom:'20px'}}>{tier.description}</div>

              <div style={{display:'flex',flexDirection:'column',gap:'9px',marginBottom:'24px'}}>
                {tier.perks.map(p => (
                  <div key={p} style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',color:'#374151'}}>
                    <span style={{color:'#059669',fontWeight:700,fontSize:'15px'}}>✓</span>{p}
                  </div>
                ))}
              </div>

              <button onClick={()=>handleBoost(tier.id)} disabled={!!loading}
                style={{width:'100%',padding:'13px',background:tier.popular?'#111':'#F9FAFB',color:tier.popular?'white':'#111',border:tier.popular?'none':'1.5px solid #E5E7EB',borderRadius:'10px',fontSize:'14px',fontWeight:800,cursor:loading?'wait':'pointer',fontFamily:'inherit',opacity:loading?0.7:1,transition:'opacity .15s'}}>
                {loading===tier.id?'Redirecting...':`Boost for $${billingPeriod==='weekly'?tier.weekly:tier.monthly}`}
              </button>
            </div>
          ))}
        </div>

        {error && <div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:'10px',padding:'14px',color:'#DC2626',fontSize:'13px',marginBottom:'20px',textAlign:'center'}}>{error}</div>}

        <div style={{textAlign:'center',color:'#9CA3AF',fontSize:'12px',lineHeight:2}}>
          <div>🔒 Payments securely processed by Stripe · All prices in USD</div>
          <div>One-time payment — no subscriptions, no auto-renewal</div>
        </div>
      </div>
    </main>
  )
}
