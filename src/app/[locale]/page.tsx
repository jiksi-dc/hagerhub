'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import AuthButton from '@/components/AuthButton'
import AIAssistant from '@/components/AIAssistant'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const DICT: Record<string, Record<string, string>> = {
  en: { search:'Search', seeAll:'See all', viewAll:'View all →', ad:'Ad', back:'← Back', browse:'Browse Categories', featured:'Featured Listings', noListings:'No listings yet', view:'View', loading:'Loading...', postAd:'+ Post Ad' },
  am: { search:'ፈልግ', seeAll:'ሁሉንም ይመልከቱ', viewAll:'ሁሉንም ይመልከቱ →', ad:'ማስታወቂያ', back:'← ተመለስ', browse:'ምድቦችን ያስሱ', featured:'ተለይተው የቀረቡ', noListings:'እስካሁን ምንም የለም', view:'ይመልከቱ', loading:'በመጫን ላይ...', postAd:'+ ማስታወቂያ ለጥፍ' },
}

const POPULAR = [
  { name:'Properties', emoji:'🏠', items:['Residential for Rent','Residential for Sale','Commercial','Land & Plots'] },
  { name:'Vehicles', emoji:'🚗', items:['Used Cars','New Cars','Trucks & LGVs','Motorcycles'] },
  { name:'Machinery', emoji:'⚙️', items:['Farm Equipment','Construction','Generators','Industrial'] },
  { name:'Classifieds', emoji:'📱', items:['Mobile Phones','Electronics','Furniture & Home','Clothing'] },
  { name:'Jobs', emoji:'💼', items:['Accounting & Finance','Engineering','IT & Technology','Healthcare'] },
]

const IMGS: Record<string, string[]> = {
  Properties: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=85','https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=85'],
  Vehicles: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=85','https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=85'],
  Machinery: ['https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=600&q=85','https://images.unsplash.com/photo-1530685932526-48ec92998eaa?w=600&q=85'],
  Classifieds: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=85','https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=85'],
  Jobs: ['https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=85','https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=85'],
}

const ADS = [
  { id:'et', bg:'#006400', logo:'✈️', brand:'Ethiopian Airlines', tag:'Official Partner', headline:'Fly to 130+ destinations worldwide', cta:'Book Now', url:'https://www.ethiopianairlines.com' },
  { id:'cbe', bg:'#003087', logo:'🏦', brand:'Commercial Bank of Ethiopia', tag:'Financial Partner', headline:'Home loans up to ETB 5,000,000', cta:'Apply Now', url:'#' },
  { id:'telebirr', bg:'#FF6B00', logo:'📱', brand:'Telebirr', tag:'Payment Partner', headline:'Send · Receive · Pay bills across Ethiopia', cta:'Get App', url:'#' },
  { id:'midroc', bg:'#1a1a2e', logo:'🏗️', brand:'Midroc Group', tag:'Premium Partner', headline:'Investing in Ethiopia\'s future', cta:'Learn More', url:'#' },
]

interface Listing {
  image_urls?: string[]; id:string; title:string; price_label:string; city:string
  neighbourhood:string; category:string; subcategory:string; created_at:string
}

export default function Home() {
  const locale = 'en'
  const tx = DICT[locale] || DICT.en
  const tl = (key: string) => tx[key.toLowerCase()] || key
  const [activeCat, setActiveCat] = useState('All')
  const [search, setSearch] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchListings() }, [activeCat])

  async function fetchListings() {
    setLoading(true)
    const supabase = createClient()
    let q = supabase.from('listings').select('*').eq('status','active').order('created_at',{ascending:false})
    if (activeCat !== 'All') q = q.eq('category', activeCat)
    const { data } = await q.limit(20)
    setListings(data || [])
    setLoading(false)
  }

  const filtered = listings.filter(l => search==='' || l.title.toLowerCase().includes(search.toLowerCase()))
  const getImg = (cat: string, id: string) => { const a = IMGS[cat] || IMGS.Properties; return a[id.charCodeAt(0) % a.length] }

  const cats = ['All', ...POPULAR.map(p => p.name)]

  return (
    <main style={{fontFamily:'system-ui,-apple-system,sans-serif',background:'#fff',minHeight:'100vh',width:'100%'}}>

      {/* STICKY NAV */}
      <header style={{background:'#fff',borderBottom:'1px solid #F0F0F0',position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'12px 20px',display:'flex',alignItems:'center',gap:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',flexShrink:0}}>
            <img src="/lion.jpg" alt="HagerHub" style={{width:'36px',height:'36px',borderRadius:'50%',objectFit:'cover'}}/>
            <div>
              <div style={{fontSize:'18px',fontWeight:900,color:'#111',letterSpacing:'2px',lineHeight:1}}>HAGERHUB</div>
              <div style={{fontSize:'8px',color:'#9CA3AF',letterSpacing:'2px',marginTop:'2px'}}>ETHIOPIA'S #1 MARKETPLACE</div>
            </div>
          </div>
          <div style={{flex:1,display:'flex',alignItems:'center',background:'#F5F5F5',border:'1.5px solid #E5E7EB',borderRadius:'10px',overflow:'hidden'}}>
            <input style={{flex:1,border:'none',padding:'10px 14px',fontSize:'14px',outline:'none',background:'transparent',color:'#111',fontFamily:'inherit'}} placeholder="Search properties, cars, jobs across Ethiopia..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchListings()}/>
            <button onClick={fetchListings} style={{background:'#111',border:'none',color:'white',padding:'10px 22px',fontSize:'13px',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit'}}>Search</button>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
            <AuthButton />
            <a href="/post" style={{background:'#111',color:'white',padding:'9px 18px',borderRadius:'8px',fontSize:'13px',fontWeight:700,textDecoration:'none',whiteSpace:'nowrap'}}>+ Post Ad</a>
            <LanguageSwitcher />
            <AIAssistant />
          </div>
        </div>
        {/* CATEGORY TABS */}
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 20px',display:'flex',gap:0,borderTop:'1px solid #F5F5F5',overflowX:'auto'}}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setActiveCat(c)} style={{padding:'10px 20px',border:'none',background:'none',fontSize:'13px',fontWeight:600,color:activeCat===c?'#111':'#6B7280',borderBottom:activeCat===c?'2px solid #111':'2px solid transparent',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit'}}>
              {c}
            </button>
          ))}
        </div>
      </header>

      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'24px 20px'}}>

                {/* PARTNER BANNERS */}
        <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'32px'}}>
          <a href="https://www.ethiopianairlines.com" target="_blank" rel="noopener noreferrer" style={{background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:'14px',padding:'20px 24px',display:'flex',alignItems:'center',gap:'20px',textDecoration:'none'}}>
            <div style={{fontSize:'40px',flexShrink:0}}>✈️</div>
            <div style={{flex:1}}>
              <div style={{fontSize:'16px',fontWeight:800,color:'#14532D',marginBottom:'4px'}}>Fly with Ethiopian Airlines</div>
              <div style={{fontSize:'13px',color:'#166534'}}>Africa largest airline · 130+ destinations worldwide · Book your next flight today</div>
            </div>
            <div style={{background:'#16A34A',color:'white',fontSize:'13px',fontWeight:700,padding:'10px 22px',borderRadius:'9px',flexShrink:0,whiteSpace:'nowrap'}}>Book Now →</div>
          </a>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
            <a href="#" style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:'14px',padding:'18px 20px',display:'flex',alignItems:'center',gap:'16px',textDecoration:'none'}}>
              <div style={{fontSize:'32px',flexShrink:0}}>🏦</div>
              <div style={{flex:1}}>
                <div style={{fontSize:'14px',fontWeight:800,color:'#1E3A8A',marginBottom:'3px'}}>CBE Home Loans</div>
                <div style={{fontSize:'12px',color:'#1D4ED8'}}>Up to ETB 5,000,000 · Low interest rates</div>
              </div>
              <div style={{background:'#2563EB',color:'white',fontSize:'12px',fontWeight:700,padding:'8px 16px',borderRadius:'8px',flexShrink:0,whiteSpace:'nowrap'}}>Apply →</div>
            </a>
            <a href="#" style={{background:'#FFF7ED',border:'1px solid #FED7AA',borderRadius:'14px',padding:'18px 20px',display:'flex',alignItems:'center',gap:'16px',textDecoration:'none'}}>
              <div style={{fontSize:'32px',flexShrink:0}}>📱</div>
              <div style={{flex:1}}>
                <div style={{fontSize:'14px',fontWeight:800,color:'#7C2D12',marginBottom:'3px'}}>Pay with Telebirr</div>
                <div style={{fontSize:'12px',color:'#9A3412'}}>Send · Receive · Pay bills across Ethiopia</div>
              </div>
              <div style={{background:'#EA580C',color:'white',fontSize:'12px',fontWeight:700,padding:'8px 16px',borderRadius:'8px',flexShrink:0,whiteSpace:'nowrap'}}>Get App →</div>
            </a>
          </div>
        </div>
              <div style={{fontWeight:800,color:'white',fontSize:'13px'}}>{ad.brand}</div>
              <div style={{color:'rgba(255,255,255,0.75)',fontSize:'11px',lineHeight:1.4}}>{ad.headline}</div>
              <div style={{background:'rgba(255,255,255,0.18)',color:'white',fontSize:'11px',fontWeight:700,padding:'5px 12px',borderRadius:'7px',alignSelf:'flex-start',marginTop:'4px'}}>{ad.cta} →</div>
            </a>
          ))}
        </div>

        {/* POPULAR CATEGORIES — dubizzle text style */}
        <div style={{marginBottom:'32px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
            <h2 style={{fontSize:'20px',fontWeight:800,color:'#111',margin:0}}>Popular Categories</h2>
            <span style={{fontSize:'13px',color:'#6B7280',cursor:'pointer'}}>See all →</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',border:'1px solid #F0F0F0',borderRadius:'12px',overflow:'hidden',background:'#fff'}}>
            {POPULAR.map((cat,i)=>(
              <div key={cat.name} style={{padding:'18px 16px',borderRight:i<4?'1px solid #F0F0F0':'none',cursor:'pointer'}} onClick={()=>setActiveCat(cat.name)}>
                <div style={{fontSize:'22px',marginBottom:'8px'}}>{cat.emoji}</div>
                <div style={{fontSize:'14px',fontWeight:800,color:'#111',marginBottom:'10px'}}>{cat.name}</div>
                {cat.items.map(item=>(
                  <div key={item} style={{fontSize:'12px',color:'#6B7280',marginBottom:'5px',lineHeight:1.3}}>{item}</div>
                ))}
                <div style={{fontSize:'12px',color:'#111',fontWeight:700,marginTop:'10px',cursor:'pointer'}}>All in {cat.name} →</div>
              </div>
            ))}
          </div>
        </div>

        {/* VERIFY BANNER */}
        <div style={{background:'#F5F5F5',borderRadius:'12px',padding:'14px 20px',display:'flex',alignItems:'center',gap:'16px',marginBottom:'32px',border:'1px solid #E5E7EB'}}>
          <span style={{fontSize:'22px'}}>✅</span>
          <div style={{flex:1}}>
            <span style={{fontSize:'14px',fontWeight:700,color:'#111'}}>Verify your account</span>
            <span style={{fontSize:'13px',color:'#6B7280',marginLeft:'8px'}}>· Get more visibility · Enhance your credibility · Build trust with buyers</span>
          </div>
          <button style={{background:'#111',color:'white',border:'none',padding:'9px 20px',borderRadius:'8px',fontSize:'13px',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit'}}>Get Verified</button>
        </div>

        {/* LISTINGS BY CATEGORY */}
        {activeCat === 'All' ? (
          POPULAR.map(cat => {
            const catListings = listings.filter(l => l.category === cat.name)
            if (catListings.length === 0) return null
            return (
              <div key={cat.name} style={{marginBottom:'32px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                  <h2 style={{fontSize:'18px',fontWeight:800,color:'#111',margin:0}}>Popular in {cat.name}</h2>
                  <span onClick={()=>setActiveCat(cat.name)} style={{fontSize:'13px',color:'#6B7280',cursor:'pointer',fontWeight:600}}>See all →</span>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'12px'}}>
                  {catListings.slice(0,5).map(l=>(
                    <div key={l.id} onClick={()=>window.location.href=`/listing/${l.id}`} style={{background:'#fff',borderRadius:'12px',overflow:'hidden',border:'1px solid #F0F0F0',cursor:'pointer'}}>
                      <div style={{position:'relative',height:'160px',overflow:'hidden',background:'#F5F5F5'}}>
                        <img src={l.image_urls&&l.image_urls.length>0?l.image_urls[0]:getImg(l.category,l.id)} alt={l.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        <button style={{position:'absolute',top:'8px',right:'8px',background:'rgba(255,255,255,0.9)',border:'none',borderRadius:'50%',width:'28px',height:'28px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'14px'}}>♡</button>
                      </div>
                      <div style={{padding:'12px'}}>
                        <div style={{fontSize:'15px',fontWeight:800,color:'#111',marginBottom:'4px'}}>{l.price_label}</div>
                        <div style={{fontSize:'12px',color:'#6B7280',marginBottom:'6px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
                        <div style={{fontSize:'11px',color:'#9CA3AF',display:'flex',alignItems:'center',gap:'3px'}}>📍 {l.neighbourhood?l.neighbourhood+', ':''}{l.city}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
              <h2 style={{fontSize:'18px',fontWeight:800,color:'#111',margin:0}}>{activeCat}</h2>
              <button onClick={()=>setActiveCat('All')} style={{fontSize:'13px',color:'#6B7280',background:'none',border:'none',cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>← Back</button>
            </div>
            {loading ? (
              <div style={{textAlign:'center',padding:'60px',color:'#9CA3AF'}}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={{textAlign:'center',padding:'60px',color:'#9CA3AF'}}>No listings yet</div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'12px'}}>
                {filtered.map(l=>(
                  <div key={l.id} onClick={()=>window.location.href=`/listing/${l.id}`} style={{background:'#fff',borderRadius:'12px',overflow:'hidden',border:'1px solid #F0F0F0',cursor:'pointer'}}>
                    <div style={{position:'relative',height:'160px',overflow:'hidden',background:'#F5F5F5'}}>
                      <img src={l.image_urls&&l.image_urls.length>0?l.image_urls[0]:getImg(l.category,l.id)} alt={l.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      <button style={{position:'absolute',top:'8px',right:'8px',background:'rgba(255,255,255,0.9)',border:'none',borderRadius:'50%',width:'28px',height:'28px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'14px'}}>♡</button>
                    </div>
                    <div style={{padding:'12px'}}>
                      <div style={{fontSize:'15px',fontWeight:800,color:'#111',marginBottom:'4px'}}>{l.price_label}</div>
                      <div style={{fontSize:'12px',color:'#6B7280',marginBottom:'6px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
                      <div style={{fontSize:'11px',color:'#9CA3AF',display:'flex',alignItems:'center',gap:'3px'}}>📍 {l.neighbourhood?l.neighbourhood+', ':''}{l.city}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* APP DOWNLOAD */}
        <div style={{background:'#F5F5F5',borderRadius:'14px',padding:'24px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'16px',marginTop:'16px',border:'1px solid #E5E7EB'}}>
          <div>
            <div style={{fontSize:'18px',fontWeight:800,color:'#111',marginBottom:'4px'}}>Find amazing deals on the go.</div>
            <div style={{fontSize:'13px',color:'#9CA3AF'}}>Download the HagerHub app now!</div>
          </div>
          <div style={{display:'flex',gap:'10px',flexShrink:0}}>
            <button style={{background:'#111',color:'white',border:'none',padding:'10px 20px',borderRadius:'10px',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>🍎 App Store</button>
            <button style={{background:'#111',color:'white',border:'none',padding:'10px 20px',borderRadius:'10px',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>▶ Google Play</button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{background:'#F9FAFB',borderTop:'1px solid #F0F0F0',padding:'32px 20px 24px',marginTop:'16px'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
            <img src="/lion.jpg" alt="HagerHub" style={{width:'32px',height:'32px',borderRadius:'50%',objectFit:'cover'}}/>
            <div style={{fontSize:'16px',fontWeight:900,color:'#111',letterSpacing:'2px'}}>HAGERHUB</div>
          </div>
          <div style={{fontSize:'11px',color:'#9CA3AF',letterSpacing:'1.5px',marginBottom:'24px'}}>ETHIOPIA'S #1 MARKETPLACE · የኢትዮጵያ ቁጥር 1 ገበያ</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'24px',marginBottom:'32px'}}>
            {[{title:'Company',links:['About Us','Careers','Advertise with Us','Legal Hub']},{title:'Ethiopia',links:['Addis Ababa','Hawassa','Bahir Dar','Dire Dawa']},{title:'Support',links:['Help Center','Contact Us','Safety Tips','Report Listing']},{title:'Follow Us',links:['Facebook','Telegram','Instagram','TikTok']},{title:'Languages',links:['English','አማርኛ']}].map(col=>(
              <div key={col.title}>
                <div style={{fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',color:'#9CA3AF',marginBottom:'10px'}}>{col.title}</div>
                {col.links.map(l=><div key={l} style={{fontSize:'13px',color:'#6B7280',marginBottom:'7px',cursor:'pointer'}}>{l}</div>)}
              </div>
            ))}
          </div>
          <div style={{borderTop:'1px solid #E5E7EB',paddingTop:'16px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'8px'}}>
            <span style={{color:'#9CA3AF',fontSize:'12px'}}>© 2025 HagerHub · Jiksi Michael</span>
            <div style={{display:'flex',gap:'8px'}}>
              <span style={{background:'#111',color:'white',fontSize:'11px',fontWeight:700,padding:'5px 14px',borderRadius:'7px',cursor:'pointer'}}>🍎 App Store</span>
              <span style={{background:'#374151',color:'white',fontSize:'11px',fontWeight:700,padding:'5px 14px',borderRadius:'7px',cursor:'pointer'}}>▶ Google Play</span>
            </div>
          </div>
        </div>
      </footer>

    </main>
  )
}
