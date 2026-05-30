'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import AuthButton from '@/components/AuthButton'
import AIAssistant from '@/components/AIAssistant'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const POPULAR = [
  { name:'Properties', emoji:'🏠', items:['Residential for Rent','Residential for Sale','Commercial','Land & Plots'] },
  { name:'Vehicles', emoji:'🚗', items:['Used Cars','New Cars','Trucks & LGVs','Motorcycles'] },
  { name:'Machinery', emoji:'⚙️', items:['Farm Equipment','Construction','Generators','Industrial'] },
  { name:'Classifieds', emoji:'📱', items:['Mobile Phones','Electronics','Furniture & Home','Clothing'] },
  { name:'Jobs', emoji:'💼', items:['Accounting & Finance','Engineering','IT & Technology','Healthcare'] },
]

const IMGS: Record<string, string[]> = {
  Properties: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=85','https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=85','https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600&q=85'],
  Vehicles: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=85','https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=85','https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=85'],
  Machinery: ['https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=600&q=85','https://images.unsplash.com/photo-1530685932526-48ec92998eaa?w=600&q=85'],
  Classifieds: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=85','https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=85'],
  Jobs: ['https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=85','https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=85'],
}

interface Listing {
  image_urls?: string[]; id:string; title:string; price_label:string; city:string
  neighbourhood:string; category:string; subcategory:string; created_at:string
}

export default function Home() {
  const [activeCat, setActiveCat] = useState('All')
  const [search, setSearch] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState<Set<string>>(new Set())

  useEffect(() => { fetchListings() }, [activeCat])

  async function fetchListings() {
    setLoading(true)
    const supabase = createClient()
    let q = supabase.from('listings').select('*').eq('status','active').order('created_at',{ascending:false})
    if (activeCat !== 'All') q = q.eq('category', activeCat)
    const { data } = await q.limit(40)
    setListings(data || [])
    setLoading(false)
  }

  const toggleSave = (id: string) => {
    setSaved(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = listings.filter(l => search==='' || l.title.toLowerCase().includes(search.toLowerCase()))
  const getImg = (cat: string, id: string) => { const a = IMGS[cat] || IMGS.Properties; return a[id.charCodeAt(0) % a.length] }
  const cats = ['All', ...POPULAR.map(p => p.name)]

  const CardGrid = ({items}: {items: Listing[]}) => (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'16px'}}>
      {items.map(l => (
        <div key={l.id} style={{background:'#fff',borderRadius:'12px',overflow:'hidden',border:'1px solid #EBEBEB',cursor:'pointer',position:'relative'}} onClick={()=>window.location.href=`/listing/${l.id}`}>
          <div style={{position:'relative',height:'180px',overflow:'hidden',background:'#F5F5F5'}}>
            <img src={l.image_urls&&l.image_urls.length>0?l.image_urls[0]:getImg(l.category,l.id)} alt={l.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            {/* Price overlay like mekina */}
            <div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(to top,rgba(0,0,0,0.7),transparent)',padding:'24px 10px 8px'}}>
              <div style={{color:'white',fontWeight:900,fontSize:'16px'}}>{l.price_label}</div>
            </div>
            {/* Badge top left */}
            <div style={{position:'absolute',top:'8px',left:'8px',background:l.category==='Properties'?'#2563EB':l.category==='Vehicles'?'#DC2626':l.category==='Jobs'?'#059669':'#7C3AED',color:'white',fontSize:'10px',fontWeight:700,padding:'3px 8px',borderRadius:'4px'}}>{l.subcategory||l.category}</div>
            {/* Heart like ethiorealestates */}
            <button onClick={e=>{e.stopPropagation();toggleSave(l.id)}} style={{position:'absolute',top:'8px',right:'8px',background:'rgba(255,255,255,0.9)',border:'none',borderRadius:'50%',width:'30px',height:'30px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'16px'}}>
              {saved.has(l.id)?'❤️':'🤍'}
            </button>
          </div>
          <div style={{padding:'12px'}}>
            <div style={{fontSize:'13px',color:'#111',fontWeight:600,marginBottom:'4px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
            <div style={{fontSize:'11px',color:'#9CA3AF',display:'flex',alignItems:'center',gap:'3px'}}>📍 {l.neighbourhood?l.neighbourhood+', ':''}{l.city}</div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <main style={{fontFamily:'system-ui,-apple-system,sans-serif',background:'#F7F7F7',minHeight:'100vh',width:'100%'}}>

      {/* NAV */}
      <header style={{background:'#fff',borderBottom:'1px solid #EBEBEB',position:'sticky',top:0,zIndex:100,boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'12px 20px',display:'flex',alignItems:'center',gap:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',flexShrink:0}}>
            <img src="/lion.jpg" alt="HagerHub" style={{width:'36px',height:'36px',borderRadius:'50%',objectFit:'cover'}}/>
            <div>
              <div style={{fontSize:'18px',fontWeight:900,color:'#111',letterSpacing:'2px',lineHeight:1}}>HAGERHUB</div>
              <div style={{fontSize:'8px',color:'#9CA3AF',letterSpacing:'2px',marginTop:'2px'}}>ETHIOPIA'S #1 MARKETPLACE</div>
            </div>
          </div>
          <div style={{flex:1,display:'flex',alignItems:'center',background:'#F5F5F5',border:'1.5px solid #EBEBEB',borderRadius:'10px',overflow:'hidden'}}>
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
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 20px',display:'flex',gap:0,overflowX:'auto',borderTop:'1px solid #F5F5F5'}}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setActiveCat(c)} style={{padding:'10px 20px',border:'none',background:'none',fontSize:'13px',fontWeight:600,color:activeCat===c?'#111':'#6B7280',borderBottom:activeCat===c?'2.5px solid #111':'2.5px solid transparent',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit'}}>
              {c}
            </button>
          ))}
        </div>
      </header>

      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'20px',display:'grid',gridTemplateColumns:'1fr 300px',gap:'20px',alignItems:'start'}}>

        {/* MAIN CONTENT */}
        <div>

          {/* PARTNER BANNERS */}
          <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'20px'}}>
            <a href="https://www.ethiopianairlines.com" target="_blank" rel="noopener noreferrer" style={{background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:'12px',padding:'16px 20px',display:'flex',alignItems:'center',gap:'16px',textDecoration:'none'}}>
              <div style={{fontSize:'36px',flexShrink:0}}>✈️</div>
              <div style={{flex:1}}>
                <div style={{fontSize:'15px',fontWeight:800,color:'#14532D',marginBottom:'3px'}}>Fly with Ethiopian Airlines</div>
                <div style={{fontSize:'12px',color:'#166534'}}>Africa's largest airline · 130+ destinations worldwide · Book your next flight</div>
              </div>
              <div style={{background:'#16A34A',color:'white',fontSize:'12px',fontWeight:700,padding:'9px 20px',borderRadius:'8px',flexShrink:0,whiteSpace:'nowrap'}}>Book Now →</div>
            </a>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
              <a href="#" style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:'12px',padding:'14px 18px',display:'flex',alignItems:'center',gap:'14px',textDecoration:'none'}}>
                <div style={{fontSize:'28px',flexShrink:0}}>🏦</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'13px',fontWeight:800,color:'#1E3A8A',marginBottom:'2px'}}>CBE Home Loans</div>
                  <div style={{fontSize:'11px',color:'#1D4ED8'}}>Up to ETB 5,000,000 · Low interest</div>
                </div>
                <div style={{background:'#2563EB',color:'white',fontSize:'11px',fontWeight:700,padding:'7px 14px',borderRadius:'7px',flexShrink:0}}>Apply →</div>
              </a>
              <a href="#" style={{background:'#FFF7ED',border:'1px solid #FED7AA',borderRadius:'12px',padding:'14px 18px',display:'flex',alignItems:'center',gap:'14px',textDecoration:'none'}}>
                <div style={{fontSize:'28px',flexShrink:0}}>📱</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'13px',fontWeight:800,color:'#7C2D12',marginBottom:'2px'}}>Pay with Telebirr</div>
                  <div style={{fontSize:'11px',color:'#9A3412'}}>Send · Receive · Pay across Ethiopia</div>
                </div>
                <div style={{background:'#EA580C',color:'white',fontSize:'11px',fontWeight:700,padding:'7px 14px',borderRadius:'7px',flexShrink:0}}>Get App →</div>
              </a>
            </div>
          </div>

          {/* POPULAR CATEGORIES */}
          <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #EBEBEB',marginBottom:'20px',overflow:'hidden'}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid #F5F5F5',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h2 style={{fontSize:'16px',fontWeight:800,color:'#111',margin:0}}>Popular Categories</h2>
              <span style={{fontSize:'12px',color:'#6B7280',cursor:'pointer'}}>See all →</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)'}}>
              {POPULAR.map((cat,i)=>(
                <div key={cat.name} onClick={()=>setActiveCat(cat.name)} style={{padding:'16px',borderRight:i<4?'1px solid #F5F5F5':'none',cursor:'pointer'}}>
                  <div style={{fontSize:'20px',marginBottom:'6px'}}>{cat.emoji}</div>
                  <div style={{fontSize:'13px',fontWeight:800,color:'#111',marginBottom:'8px'}}>{cat.name}</div>
                  {cat.items.map(item=>(
                    <div key={item} style={{fontSize:'11px',color:'#6B7280',marginBottom:'4px',lineHeight:1.3}}>{item}</div>
                  ))}
                  <div style={{fontSize:'11px',color:'#2563EB',fontWeight:700,marginTop:'8px'}}>All in {cat.name} →</div>
                </div>
              ))}
            </div>
          </div>

          {/* VERIFY */}
          <div style={{background:'#1a1a1a',borderRadius:'12px',padding:'14px 20px',display:'flex',alignItems:'center',gap:'16px',marginBottom:'20px'}}>
            <span style={{fontSize:'20px'}}>✅</span>
            <div style={{flex:1,color:'white',fontSize:'13px',fontWeight:700}}>Verify your account <span style={{color:'rgba(255,255,255,0.5)',fontWeight:400}}>· More visibility · More trust · More sales</span></div>
            <button style={{background:'white',color:'#111',border:'none',padding:'8px 18px',borderRadius:'8px',fontSize:'12px',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit'}}>Get Verified</button>
          </div>

          {/* LISTINGS */}
          {loading ? (
            <div style={{textAlign:'center',padding:'60px',color:'#9CA3AF',background:'#fff',borderRadius:'12px'}}>Loading listings...</div>
          ) : filtered.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px',color:'#9CA3AF',background:'#fff',borderRadius:'12px'}}>No listings yet in this category</div>
          ) : activeCat === 'All' ? (
            POPULAR.map(cat => {
              const catListings = filtered.filter(l => l.category === cat.name)
              if (catListings.length === 0) return null
              return (
                <div key={cat.name} style={{marginBottom:'24px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                    <h2 style={{fontSize:'16px',fontWeight:800,color:'#111',margin:0}}>Popular in {cat.name}</h2>
                    <span onClick={()=>setActiveCat(cat.name)} style={{fontSize:'12px',color:'#2563EB',cursor:'pointer',fontWeight:600}}>See all →</span>
                  </div>
                  <CardGrid items={catListings.slice(0,4)}/>
                </div>
              )
            })
          ) : (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                <h2 style={{fontSize:'16px',fontWeight:800,color:'#111',margin:0}}>{activeCat}</h2>
                <button onClick={()=>setActiveCat('All')} style={{fontSize:'12px',color:'#6B7280',background:'none',border:'none',cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>← Back to All</button>
              </div>
              <CardGrid items={filtered}/>
            </div>
          )}
        </div>

        {/* SIDEBAR — most viewed like mekina */}
        <div style={{position:'sticky',top:'120px'}}>
          <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #EBEBEB',overflow:'hidden',marginBottom:'16px'}}>
            <div style={{padding:'14px 16px',borderBottom:'1px solid #F5F5F5',fontSize:'14px',fontWeight:800,color:'#111'}}>Most Viewed Today</div>
            {listings.slice(0,8).map((l,i)=>(
              <div key={l.id} onClick={()=>window.location.href=`/listing/${l.id}`} style={{display:'flex',gap:'10px',padding:'10px 16px',borderBottom:'1px solid #F9F9F9',cursor:'pointer',alignItems:'center'}}>
                <div style={{width:'52px',height:'52px',borderRadius:'8px',overflow:'hidden',flexShrink:0,background:'#F5F5F5'}}>
                  <img src={l.image_urls&&l.image_urls.length>0?l.image_urls[0]:getImg(l.category,l.id)} alt={l.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:'12px',fontWeight:700,color:'#2563EB',marginBottom:'2px'}}>{l.price_label}</div>
                  <div style={{fontSize:'11px',color:'#374151',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
                  <div style={{fontSize:'10px',color:'#9CA3AF',marginTop:'2px'}}>👁 {Math.floor(Math.random()*400+100)} today</div>
                </div>
              </div>
            ))}
          </div>

          {/* SIDEBAR AD */}
          <div style={{background:'#1a1a2e',borderRadius:'12px',padding:'20px',marginBottom:'16px'}}>
            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'8px'}}>Premium Partner</div>
            <div style={{fontSize:'16px',fontWeight:800,color:'white',marginBottom:'6px'}}>Midroc Real Estate</div>
            <div style={{fontSize:'12px',color:'rgba(255,255,255,0.65)',marginBottom:'14px',lineHeight:1.5}}>Premium properties across Ethiopia. Invest in your future today.</div>
            <button style={{background:'white',color:'#1a1a2e',border:'none',padding:'9px 18px',borderRadius:'8px',fontSize:'12px',fontWeight:700,cursor:'pointer',width:'100%',fontFamily:'inherit'}}>Explore Properties →</button>
          </div>

          {/* APP DOWNLOAD */}
          <div style={{background:'#F5F5F5',borderRadius:'12px',padding:'16px',border:'1px solid #EBEBEB'}}>
            <div style={{fontSize:'14px',fontWeight:800,color:'#111',marginBottom:'4px'}}>Get the app</div>
            <div style={{fontSize:'11px',color:'#9CA3AF',marginBottom:'12px'}}>Find deals faster on mobile</div>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              <button style={{background:'#111',color:'white',border:'none',padding:'10px',borderRadius:'9px',fontSize:'12px',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>🍎 App Store</button>
              <button style={{background:'#111',color:'white',border:'none',padding:'10px',borderRadius:'9px',fontSize:'12px',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>▶ Google Play</button>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{background:'#fff',borderTop:'1px solid #EBEBEB',padding:'32px 20px 24px',marginTop:'16px'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
            <img src="/lion.jpg" alt="HagerHub" style={{width:'30px',height:'30px',borderRadius:'50%',objectFit:'cover'}}/>
            <div style={{fontSize:'15px',fontWeight:900,color:'#111',letterSpacing:'2px'}}>HAGERHUB</div>
          </div>
          <div style={{fontSize:'11px',color:'#9CA3AF',letterSpacing:'1.5px',marginBottom:'24px'}}>ETHIOPIA'S #1 MARKETPLACE · የኢትዮጵያ ቁጥር 1 ገበያ</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'24px',marginBottom:'28px'}}>
            {[
              {title:'Company',links:['About Us','Careers','Advertise with Us','Legal Hub']},
              {title:'Ethiopia',links:['Addis Ababa','Hawassa','Bahir Dar','Dire Dawa']},
              {title:'Support',links:['Help Center','Contact Us','Safety Tips','Report Listing']},
              {title:'Follow Us',links:['Facebook','Telegram','Instagram','TikTok']},
              {title:'Languages',links:['English','አማርኛ']},
            ].map(col=>(
              <div key={col.title}>
                <div style={{fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',color:'#9CA3AF',marginBottom:'10px'}}>{col.title}</div>
                {col.links.map(l=><div key={l} style={{fontSize:'13px',color:'#6B7280',marginBottom:'7px',cursor:'pointer'}}>{l}</div>)}
              </div>
            ))}
          </div>
          <div style={{borderTop:'1px solid #EBEBEB',paddingTop:'16px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'8px'}}>
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
