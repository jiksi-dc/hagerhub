'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AuthButton from '@/components/AuthButton'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const SUBCATS = ['All','Tourist Attraction','National Park','Festival & Cultural Event','Concert & Entertainment','Food & Dining Experience','Museum & Heritage','Tour Package','Sports Event','Other Experience']
const REGIONS = ['All Regions','Addis Ababa','Amhara','Oromia','Tigray','SNNP','Afar','Somali','Sidama','South Ethiopia']

interface DiscoverListing {
  id: string; title: string; price_label: string; city: string; subcategory: string
  event_date?: string; event_end_date?: string; event_time?: string; venue?: string
  website?: string; organizer?: string; region?: string; admission_fee?: string
  image_urls?: string[]; description?: string; created_at: string
}

const HERO_IMG = 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1400&q=80'

export default function DiscoverPage() {
  const params = useParams()
  const locale = params.locale as string
  const [listings, setListings] = useState<DiscoverListing[]>([])
  const [loading, setLoading] = useState(true)
  const [subcat, setSubcat] = useState('All')
  const [region, setRegion] = useState('All Regions')
  const [tab, setTab] = useState<'upcoming'|'all'>('upcoming')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('listings').select('*').eq('category','Discover Ethiopia').eq('status','active').order('created_at',{ascending:false}).then(({data}) => {
      setListings(data || [])
      setLoading(false)
    })
  }, [])

  const now = new Date()
  const filtered = listings.filter(l => {
    if (subcat !== 'All' && l.subcategory !== subcat) return false
    if (region !== 'All Regions' && l.region !== region) return false
    if (tab === 'upcoming' && l.event_date && new Date(l.event_date) < now) return false
    return true
  })

  const isUpcoming = (d?: string) => d ? new Date(d) >= now : false
  const isPast = (d?: string) => d ? new Date(d) < now : false

  return (
    <main style={{minHeight:'100vh',background:'#F9FAFB',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <style>{'*{box-sizing:border-box;margin:0;padding:0}'}</style>

      <nav style={{position:'sticky',top:0,zIndex:100,background:'#fff',borderBottom:'1px solid #EBEBEB'}}>
        <div className="gb-navbar" style={{maxWidth:'1280px',margin:'0 auto',padding:'0 20px',height:'56px',display:'flex',alignItems:'center',gap:'12px'}}>
          <a href={`/${locale}`} style={{textDecoration:'none',flexShrink:0}}>
            <div style={{fontSize:'15px',fontWeight:900,color:'#111',letterSpacing:'2px'}}>GOHBAY</div>
            <div style={{fontSize:'8px',color:'#9CA3AF',letterSpacing:'1.5px',marginTop:'1px'}}>{"ETHIOPIA'S #1 MARKETPLACE"}</div>
          </a>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'10px'}}>
            <AuthButton/>
            <a href={`/${locale}/post`} style={{fontSize:'13px',fontWeight:600,padding:'9px 18px',background:'#0f3460',color:'white',borderRadius:'8px',textDecoration:'none',whiteSpace:'nowrap'}}>+ Add Experience</a>
            <LanguageSwitcher/>
          </div>
        </div>
      </nav>

      <div style={{position:'relative',height:'320px',overflow:'hidden'}}>
        <img src={HERO_IMG} alt="Ethiopia" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,0.3),rgba(15,52,96,0.85))',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',padding:'40px 20px'}}>
          <div style={{fontSize:'11px',fontWeight:700,letterSpacing:'4px',color:'#FCD34D',marginBottom:'8px'}}>DISCOVER ETHIOPIA</div>
          <h1 style={{fontSize:'32px',fontWeight:900,color:'white',textAlign:'center',marginBottom:'8px',lineHeight:1.2}}>Explore the land of Origins</h1>
          <p style={{fontSize:'14px',color:'rgba(255,255,255,0.8)',textAlign:'center',maxWidth:'480px',lineHeight:1.6}}>UNESCO sites, ancient traditions, national parks, festivals and unforgettable experiences</p>
        </div>
      </div>

      <div style={{background:'#fff',borderBottom:'1px solid #F3F4F6',overflowX:'auto'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'12px 20px',display:'flex',gap:'8px'}}>
          {SUBCATS.map(s => (
            <button key={s} onClick={()=>setSubcat(s)}
              style={{padding:'7px 16px',borderRadius:'20px',border:'1.5px solid',borderColor:subcat===s?'#0f3460':'#E5E7EB',background:subcat===s?'#0f3460':'#fff',color:subcat===s?'white':'#374151',fontSize:'12px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="gb-2col" style={{maxWidth:'1280px',margin:'0 auto',padding:'24px 20px',display:'grid',gridTemplateColumns:'1fr 280px',gap:'24px',alignItems:'start'}}>
        <div>
          <div style={{display:'flex',gap:'0',marginBottom:'20px',borderBottom:'1px solid #F3F4F6'}}>
            {(['upcoming','all'] as const).map(t => (
              <button key={t} onClick={()=>setTab(t)}
                style={{padding:'10px 20px',fontSize:'13px',fontWeight:tab===t?700:400,color:tab===t?'#0f3460':'#6B7280',background:'none',border:'none',borderBottom:tab===t?'2px solid #0f3460':'2px solid transparent',cursor:'pointer',fontFamily:'inherit'}}>
                {t === 'upcoming' ? 'Upcoming' : 'All experiences'}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{textAlign:'center',padding:'60px',color:'#9CA3AF'}}>Loading experiences...</div>
          ) : filtered.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px',background:'#fff',borderRadius:'16px',border:'1px solid #F3F4F6'}}>
              <div style={{fontSize:'40px',marginBottom:'12px'}}>✦</div>
              <div style={{fontSize:'16px',fontWeight:700,color:'#111',marginBottom:'8px'}}>No experiences listed yet</div>
              <div style={{fontSize:'13px',color:'#6B7280',marginBottom:'20px'}}>Know a great place, event or experience in Ethiopia? Share it!</div>
              <a href={`/${locale}/post`} style={{background:'#0f3460',color:'white',padding:'10px 24px',borderRadius:'10px',textDecoration:'none',fontSize:'13px',fontWeight:700}}>Add an experience</a>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {filtered.map(l => {
                const dateObj = l.event_date ? new Date(l.event_date) : null
                const upcoming = isUpcoming(l.event_date)
                const past = isPast(l.event_date)
                const img = l.image_urls?.[0]
                return (
                  <a key={l.id} href={`/${locale}/listing/${l.id}`} style={{textDecoration:'none'}}>
                    <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #F3F4F6',overflow:'hidden',display:'flex'}}>
                      {dateObj && (
                        <div style={{width:'80px',minWidth:'80px',background:upcoming?'#0f3460':past?'#F9FAFB':'#EFF6FF',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'16px 8px'}}>
                          <div style={{fontSize:'26px',fontWeight:900,color:upcoming?'white':past?'#9CA3AF':'#0f3460',lineHeight:1}}>{dateObj.getDate()}</div>
                          <div style={{fontSize:'11px',fontWeight:700,color:upcoming?'rgba(255,255,255,0.7)':past?'#C4C4C4':'#2563EB',textTransform:'uppercase',letterSpacing:'1px'}}>{dateObj.toLocaleString('en-ET',{month:'short'})}</div>
                        </div>
                      )}
                      {img && (
                        <div style={{width:'120px',minWidth:'120px',background:'#F3F4F6',overflow:'hidden'}}>
                          <img src={img} alt={l.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        </div>
                      )}
                      <div style={{flex:1,padding:'16px',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                        <div>
                          <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'6px',flexWrap:'wrap'}}>
                            {upcoming && <span style={{fontSize:'10px',fontWeight:700,background:'#ECFDF5',color:'#059669',padding:'2px 8px',borderRadius:'10px'}}>Upcoming</span>}
                            {past && <span style={{fontSize:'10px',fontWeight:700,background:'#F3F4F6',color:'#9CA3AF',padding:'2px 8px',borderRadius:'10px'}}>Past</span>}
                            <span style={{fontSize:'10px',color:'#9CA3AF'}}>{l.subcategory}</span>
                          </div>
                          <div style={{fontSize:'15px',fontWeight:700,color:'#111',marginBottom:'4px'}}>{l.title}</div>
                          <div style={{fontSize:'12px',color:'#6B7280',marginBottom:'4px'}}>{l.venue || l.city}{l.event_time ? ' - '+l.event_time : ''}</div>
                          {l.description && <div style={{fontSize:'12px',color:'#9CA3AF',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'400px'}}>{l.description}</div>}
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'10px',marginTop:'10px',flexWrap:'wrap'}}>
                          <span style={{fontSize:'13px',fontWeight:700,color:'#111'}}>{l.price_label}</span>
                          {l.admission_fee && <span style={{fontSize:'11px',background:l.admission_fee==='Free'?'#ECFDF5':'#FFFBEB',color:l.admission_fee==='Free'?'#059669':'#92400E',padding:'3px 10px',borderRadius:'10px',fontWeight:600}}>{l.admission_fee}</span>}
                          {l.organizer && <span style={{fontSize:'11px',color:'#9CA3AF'}}>by {l.organizer}</span>}
                        </div>
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </div>

        <div style={{position:'sticky',top:'80px'}}>
          <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #F3F4F6',padding:'20px',marginBottom:'16px'}}>
            <div style={{fontSize:'13px',fontWeight:700,color:'#111',marginBottom:'14px'}}>Filter by region</div>
            {REGIONS.map(r => (
              <button key={r} onClick={()=>setRegion(r)}
                style={{display:'block',width:'100%',textAlign:'left',padding:'8px 12px',borderRadius:'8px',border:'none',background:region===r?'#EFF6FF':'transparent',color:region===r?'#0f3460':'#6B7280',fontSize:'13px',fontWeight:region===r?700:400,cursor:'pointer',fontFamily:'inherit',marginBottom:'2px'}}>
                {r}
              </button>
            ))}
          </div>
          <div style={{background:'linear-gradient(135deg,#0f3460,#16213e)',borderRadius:'14px',padding:'20px',color:'white'}}>
            <div style={{fontSize:'11px',fontWeight:700,letterSpacing:'2px',color:'#FCD34D',marginBottom:'8px'}}>SHARE YOUR ETHIOPIA</div>
            <div style={{fontSize:'15px',fontWeight:700,marginBottom:'6px'}}>Know a hidden gem?</div>
            <div style={{fontSize:'12px',color:'rgba(255,255,255,0.7)',marginBottom:'16px',lineHeight:1.6}}>Add tourist sites, events, restaurants and experiences for the world to discover.</div>
            <a href={`/${locale}/post`} style={{display:'block',background:'#FCD34D',color:'#111',textAlign:'center',padding:'10px',borderRadius:'8px',textDecoration:'none',fontSize:'13px',fontWeight:800}}>Add an experience</a>
          </div>
        </div>
      </div>
    </main>
  )
}
