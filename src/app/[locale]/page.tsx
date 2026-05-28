'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'


const DICT: Record<string, Record<string, string>> = {
  en: { search: 'Search properties, cars, jobs...', properties: 'Properties', vehicles: 'Vehicles', machinery: 'Machinery', classifieds: 'Classifieds', jobs: 'Jobs', latest: 'Latest Listings', browse: 'Browse Categories', available: 'listings available', loading: 'Loading listings...', none: 'No listings found', viewAll: 'View all', view: 'View →', ad: 'ADVERTISEMENT', seeAll: 'See all →' },
  am: { search: 'ቤቶች፣ መኪናዎች፣ ሥራዎች ይፈልጉ...', properties: 'ቤቶች', vehicles: 'መኪናዎች', machinery: 'ማሽነሪ', classifieds: 'ዕቃዎች', jobs: 'ሥራዎች', latest: 'የቅርብ ጊዜ ዝርዝሮች', browse: 'ምድቦችን ያስሱ', available: 'ዝርዝሮች አሉ', loading: 'ዝርዝሮች እየተጫኑ ነው...', none: 'ምንም ዝርዝሮች አልተገኙም', viewAll: 'ሁሉንም ይመልከቱ', view: 'ይመልከቱ →', ad: 'ማስታወቂያ', seeAll: 'ሁሉንም ይመልከቱ →' },
  ar: { search: 'ابحث عن عقارات، سيارات، وظائف...', properties: 'عقارات', vehicles: 'سيارات', machinery: 'معدات', classifieds: 'إعلانات', jobs: 'وظائف', latest: 'أحدث القوائم', browse: 'تصفح الفئات', available: 'قوائم متاحة', loading: 'جار تحميل القوائم...', none: 'لم يتم العثور على قوائم', viewAll: 'عرض الكل', view: 'عرض →', ad: 'إعلان', seeAll: 'عرض الكل →' },
  fr: { search: 'Rechercher des propriétés, voitures, emplois...', properties: 'Propriétés', vehicles: 'Véhicules', machinery: 'Machines', classifieds: 'Annonces', jobs: 'Emplois', latest: 'Dernières annonces', browse: 'Parcourir les catégories', available: 'annonces disponibles', loading: 'Chargement des annonces...', none: 'Aucune annonce trouvée', viewAll: 'Voir tout', view: 'Voir →', ad: 'PUBLICITÉ', seeAll: 'Voir tout →' },
}
const CATS = ['All', 'Properties', 'Vehicles', 'Machinery', 'Classifieds', 'Jobs']

const CAT_LABELS: Record<string, Record<string, string>> = {
  en: {All:'All',Properties:'Properties',Vehicles:'Vehicles',Machinery:'Machinery',Classifieds:'Classifieds',Jobs:'Jobs'},
  am: {All:'ሁሉም',Properties:'ቤቶች',Vehicles:'መኪናዎች',Machinery:'ማሽነሪ',Classifieds:'ዕቃዎች',Jobs:'ሥራዎች'},
  ar: {All:'الكل',Properties:'عقارات',Vehicles:'سيارات',Machinery:'معدات',Classifieds:'إعلانات',Jobs:'وظائف'},
  fr: {All:'Tout',Properties:'Propriétés',Vehicles:'Véhicules',Machinery:'Machines',Classifieds:'Annonces',Jobs:'Emplois'},
}
const POPULAR = [
  { name: 'Properties', items: ['Residential for Rent', 'Residential for Sale', 'Commercial', 'Land & Plots'], color: '#078754', emoji: '🏠' },
  { name: 'Vehicles', items: ['Used Cars', 'New Cars', 'Trucks & LGVs', 'Bajaj / Tuk-tuks'], color: '#1B6BB5', emoji: '🚗' },
  { name: 'Machinery', items: ['Farm Equipment', 'Construction', 'Generators', 'Industrial Tools'], color: '#C9A84C', emoji: '⚙️' },
  { name: 'Classifieds', items: ['Mobile Phones', 'Electronics', 'Furniture & Home', 'Clothing'], color: '#8B5E3C', emoji: '📱' },
  { name: 'Jobs', items: ['Accounting & Finance', 'Engineering', 'Healthcare', 'Government'], color: '#EF2118', emoji: '💼' },
]
const IMGS: Record<string, string[]> = {
  Properties: [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=85',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=85',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=85',
  ],
  Vehicles: [
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=85',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=85',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=85',
  ],
  Machinery: [
    'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=600&q=85',
    'https://images.unsplash.com/photo-1530685932526-48ec92998eaa?w=600&q=85',
  ],
  Classifieds: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=85',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=85',
  ],
  Jobs: [
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=85',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=85',
  ],
}
const CAT_COLORS: Record<string,string> = {
  Properties:'#078754', Vehicles:'#1B6BB5', Machinery:'#C9A84C', Classifieds:'#8B5E3C', Jobs:'#EF2118'
}

interface Listing {
  image_urls?: string[]
  id: string; title: string; price_label: string; city: string
  neighbourhood: string; category: string; subcategory: string; created_at: string
}

export default function Home() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const tx = DICT[locale] || DICT.en
  const [activeCat, setActiveCat] = useState('All')
  const [search, setSearch] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { fetchListings() }, [activeCat])

  async function fetchListings() {
    setLoading(true)
    let q = supabase.from('listings').select('*').eq('status','active').order('created_at',{ascending:false})
    if (activeCat !== 'All') q = q.eq('category', activeCat)
    const { data } = await q.limit(20)
    setListings(data || [])
    setLoading(false)
  }

  const filtered = listings.filter(l => search==='' || l.title.toLowerCase().includes(search.toLowerCase()))
  const getImg = (cat: string, id: string) => {
    const a = IMGS[cat] || IMGS.Properties
    return a[id.charCodeAt(0) % a.length]
  }

  return (
    <main style={{fontFamily:'inherit',background:'#F0F2F5',minHeight:'100vh',width:'100%',overflowX:'hidden'}}>

      <section style={{background:'linear-gradient(170deg,#060606 0%,#141414 100%)',padding:'28px 16px 24px',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-80px',left:'50%',transform:'translateX(-50%)',width:'500px',height:'500px',background:'radial-gradient(circle,rgba(7,135,84,0.1) 0%,transparent 60%)',pointerEvents:'none'}}/>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'14px',marginBottom:'10px',position:'relative'}}>
          <img src="/lion.jpg" alt="lion" style={{width:'54px',height:'54px',borderRadius:'50%',objectFit:'cover',objectPosition:'center 15%',border:'2.5px solid rgba(252,221,9,0.6)',boxShadow:'0 0 30px rgba(252,221,9,0.15)',flexShrink:0}}/>
          <div style={{textAlign:'left'}}>
            <div style={{fontSize:'30px',fontWeight:900,color:'white',letterSpacing:'2px',lineHeight:1}}>HAGERHUB</div>
            <div style={{fontSize:'9px',color:'rgba(255,255,255,0.3)',letterSpacing:'2px',textTransform:'uppercase',marginTop:'3px'}}>Ethiopia's #1 Marketplace · ሃገር ሃብ</div>
          </div>
        </div>
        <div style={{display:'flex',height:'2px',margin:'10px auto 16px',width:'100px',borderRadius:'2px',overflow:'hidden'}}>
          <div style={{flex:1,background:'#078754'}}/><div style={{flex:1,background:'#FCDD09'}}/><div style={{flex:1,background:'#EF2118'}}/>
        </div>
        <div style={{display:'flex',background:'rgba(255,255,255,0.97)',borderRadius:'14px',overflow:'hidden',boxShadow:'0 8px 40px rgba(0,0,0,0.5)',marginBottom:'16px'}}>
          <input style={{flex:1,border:'none',padding:'15px 16px',fontSize:'15px',outline:'none',fontFamily:'inherit',minWidth:0,background:'transparent',color:'#111'}}
            placeholder={tx.search}
            value={search} onChange={e=>setSearch(e.target.value)}/>
          <button onClick={fetchListings} style={{background:'#078754',border:'none',color:'white',padding:'15px 22px',fontSize:'14px',fontWeight:800,cursor:'pointer',whiteSpace:'nowrap'}}>SEARCH</button>
        </div>
        <div style={{display:'flex',gap:'8px',overflowX:'auto',paddingBottom:'2px',justifyContent:'center'}}>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setActiveCat(c)}
              style={{padding:'8px 18px',borderRadius:'20px',fontSize:'12px',fontWeight:700,cursor:'pointer',border:'none',flexShrink:0,
                background:activeCat===c?'#FCDD09':'rgba(255,255,255,0.09)',
                color:activeCat===c?'#111':'rgba(255,255,255,0.75)'}}>
              {c}
            </button>
          ))}
        </div>
      </section>

      <div style={{background:'linear-gradient(90deg,#001489 0%,#0033cc 50%,#001489 100%)',cursor:'pointer',overflow:'hidden',position:'relative'}}>
        <div style={{position:'absolute',right:0,top:0,bottom:0,width:'120px',background:'radial-gradient(circle at right,rgba(200,0,0,0.4),transparent)'}}/>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',gap:'12px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{width:'48px',height:'48px',borderRadius:'50%',flexShrink:0,position:'relative',overflow:'hidden',border:'3px solid rgba(255,255,255,0.3)'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:'50%',background:'#c00'}}/>
              <div style={{position:'absolute',bottom:0,left:0,right:0,height:'50%',background:'#001489'}}/>
              <div style={{position:'absolute',top:'46%',left:0,right:0,height:'8%',background:'white'}}/>
            </div>
            <div>
              <div style={{fontSize:'20px',fontWeight:900,color:'white',letterSpacing:'2px'}}>PEPSI</div>
              <div style={{fontSize:'10px',color:'rgba(255,255,255,0.6)'}}>Taste the Extraordinary</div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{fontSize:'36px'}}>🥤</div>
            <div style={{background:'linear-gradient(135deg,#EF2118,#ff5544)',color:'white',fontSize:'12px',fontWeight:900,padding:'10px 18px',borderRadius:'20px',whiteSpace:'nowrap'}}>Win Prizes!</div>
          </div>
        </div>
        <div style={{fontSize:'8px',color:'rgba(255,255,255,0.2)',textAlign:'center',padding:'2px 0 5px',letterSpacing:'2px'}}>{tx.ad}</div>
      </div>

      <div style={{display:'flex',overflowX:'auto',background:'white',boxShadow:'0 2px 10px rgba(0,0,0,0.07)'}}>
        {CATS.map(c=>(
          <button key={c} onClick={()=>setActiveCat(c)}
            style={{padding:'15px 20px',fontSize:'13px',border:'none',flexShrink:0,
              borderBottom:activeCat===c?'3px solid #078754':'3px solid transparent',
              background:'none',color:activeCat===c?'#078754':'#777',
              fontWeight:activeCat===c?800:500,cursor:'pointer',whiteSpace:'nowrap'}}>
            {c}
          </button>
        ))}
      </div>

      <div style={{background:'linear-gradient(90deg,#CC4A00,#FF7A00)',padding:'13px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',gap:'12px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{width:'42px',height:'42px',borderRadius:'12px',background:'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'22px'}}>📱</div>
          <div>
            <div style={{fontSize:'14px',fontWeight:900,color:'white'}}>telebirr — Pay Smarter</div>
            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.85)'}}>Send · Receive · Pay bills across Ethiopia</div>
          </div>
        </div>
        <div style={{background:'white',color:'#CC4A00',fontSize:'12px',fontWeight:900,padding:'10px 18px',borderRadius:'20px',whiteSpace:'nowrap',flexShrink:0}}>Get App</div>
      </div>

      {activeCat==='All' && (
        <section style={{background:'white',padding:'22px 16px',borderBottom:'8px solid #F0F2F5'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'18px'}}>
            <h2 style={{fontSize:'20px',fontWeight:900,color:'#111',margin:0}}>{tx.browse}</h2>
            <span style={{fontSize:'13px',color:'#078754',fontWeight:700,cursor:'pointer'}}>{tx.seeAll}</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'12px'}}>
            {POPULAR.map(cat=>(
              <div key={cat.name} onClick={()=>setActiveCat(cat.name)}
                style={{background:`linear-gradient(135deg,${cat.color}15,${cat.color}05)`,border:`1.5px solid ${cat.color}20`,borderRadius:'16px',padding:'16px 14px',cursor:'pointer'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}>
                  <span style={{fontSize:'24px'}}>{cat.emoji}</span>
                  <span style={{fontSize:'15px',fontWeight:800,color:cat.color}}>{tx[cat.name.toLowerCase()] || cat.name}</span>
                </div>
                {cat.items.slice(0,3).map(item=>(
                  <div key={item} style={{fontSize:'11px',color:'#777',padding:'1.5px 0'}}>{item}</div>
                ))}
                <div style={{fontSize:'12px',color:cat.color,fontWeight:800,marginTop:'12px'}}>View all →</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{padding:'18px 16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'18px'}}>
          <div>
            <h2 style={{fontSize:'20px',fontWeight:900,color:'#111',margin:'0 0 3px'}}>{activeCat==='All'?tx.latest:activeCat}</h2>
            <div style={{fontSize:'12px',color:'#999'}}>{filtered.length} {tx.available}</div>
          </div>
          {activeCat!=='All' && (
            <button onClick={()=>setActiveCat('All')} style={{fontSize:'12px',color:'#078754',background:'white',border:'1.5px solid #078754',borderRadius:'20px',padding:'8px 18px',cursor:'pointer',fontWeight:700}}>← All</button>
          )}
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:'60px 0'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>⏳</div>
            <div style={{color:'#aaa',fontSize:'15px'}}>Loading listings...</div>
          </div>
        ) : filtered.length===0 ? (
          <div style={{textAlign:'center',padding:'60px 0'}}>
            <div style={{fontSize:'48px',marginBottom:'14px'}}>🔍</div>
            <p style={{color:'#aaa',marginBottom:'18px',fontSize:'15px'}}>No listings found</p>
            <button onClick={()=>{setActiveCat('All');setSearch('')}} style={{background:'#078754',color:'white',border:'none',borderRadius:'14px',padding:'14px 32px',cursor:'pointer',fontSize:'15px',fontWeight:800}}>View all</button>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:isDesktop?'repeat(3,1fr)':'repeat(1,1fr)',gap:'16px'}}>
            {filtered.map((l,i)=>(
              <>
                {i===2 && <div key="ad1" style={{gridColumn:'1/-1',background:'linear-gradient(135deg,#001A6E,#0041C4)',borderRadius:'18px',padding:'18px',display:'flex',alignItems:'center',gap:'14px',cursor:'pointer',boxShadow:'0 8px 28px rgba(0,26,110,0.4)'}}>
                  <div style={{width:'56px',height:'56px',borderRadius:'16px',background:'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'28px'}}>🏦</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'8px',color:'rgba(255,255,255,0.35)',letterSpacing:'2px',marginBottom:'4px'}}>{tx.ad}</div>
                    <div style={{fontSize:'16px',fontWeight:900,color:'white',marginBottom:'4px'}}>Commercial Bank of Ethiopia</div>
                    <div style={{fontSize:'12px',color:'rgba(255,255,255,0.75)'}}>🏠 Home loans up to ETB 5,000,000 · Low interest</div>
                  </div>
                  <div style={{background:'#FCDD09',color:'#001A6E',fontSize:'12px',fontWeight:900,padding:'12px 16px',borderRadius:'14px',whiteSpace:'nowrap',flexShrink:0}}>Apply Now</div>
                </div>}
                {i===5 && <div key="ad2" style={{gridColumn:'1/-1',borderRadius:'18px',overflow:'hidden',cursor:'pointer',boxShadow:'0 8px 28px rgba(0,0,0,0.2)',position:'relative'}}>
                  <img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=85" alt="Toyota" style={{width:'100%',height:'170px',objectFit:'cover',display:'block'}}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to right,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.15) 100%)',display:'flex',alignItems:'center',padding:'22px',gap:'14px'}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'8px',color:'rgba(255,255,255,0.35)',letterSpacing:'2px',marginBottom:'8px'}}>{tx.ad} · TOYOTA ETHIOPIA</div>
                      <div style={{fontSize:'26px',fontWeight:900,color:'white',marginBottom:'4px',lineHeight:1}}>Land Cruiser</div>
                      <div style={{fontSize:'14px',fontWeight:700,color:'#FCDD09',marginBottom:'6px'}}>2025 Edition</div>
                      <div style={{fontSize:'11px',color:'rgba(255,255,255,0.65)'}}>The ultimate off-roader</div>
                    </div>
                    <div style={{background:'#EF2118',color:'white',fontSize:'13px',fontWeight:900,padding:'14px 20px',borderRadius:'14px',whiteSpace:'nowrap',flexShrink:0}}>Book Now</div>
                  </div>
                </div>}
                {i===8 && <div key="ad3" style={{gridColumn:'1/-1',background:'linear-gradient(135deg,#5C0000,#8B0000)',borderRadius:'18px',padding:'18px',display:'flex',alignItems:'center',gap:'14px',cursor:'pointer',boxShadow:'0 8px 28px rgba(92,0,0,0.4)'}}>
                  <div style={{width:'56px',height:'56px',borderRadius:'16px',background:'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'28px'}}>💳</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'8px',color:'rgba(255,255,255,0.35)',letterSpacing:'2px',marginBottom:'4px'}}>{tx.ad}</div>
                    <div style={{fontSize:'16px',fontWeight:900,color:'white',marginBottom:'4px'}}>Dashen Bank</div>
                    <div style={{fontSize:'12px',color:'rgba(255,255,255,0.75)'}}>💰 Business loans · Digital banking · Instant transfers</div>
                  </div>
                  <div style={{background:'white',color:'#5C0000',fontSize:'12px',fontWeight:900,padding:'12px 16px',borderRadius:'14px',whiteSpace:'nowrap',flexShrink:0}}>Learn More</div>
                </div>}
                <div key={l.id} style={{background:'white',borderRadius:'18px',overflow:'hidden',boxShadow:'0 3px 14px rgba(0,0,0,0.08)',cursor:'pointer'}}>
                  <div style={{position:'relative',height:'280px',overflow:'hidden'}}>
                    <img src={l.image_urls && l.image_urls.length > 0 ? l.image_urls[0] : getImg(l.category,l.id)} alt={l.title} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center center'}}/>
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0) 55%)'}}/>
                    <div style={{position:'absolute',top:'12px',left:'12px',background:CAT_COLORS[l.category]||'#078754',color:'white',fontSize:'10px',fontWeight:800,padding:'5px 14px',borderRadius:'20px',letterSpacing:'0.5px'}}>{l.category.toUpperCase()}</div>
                    <button style={{position:'absolute',top:'10px',right:'12px',background:'rgba(0,0,0,0.35)',color:'white',border:'none',fontSize:'18px',width:'36px',height:'36px',borderRadius:'10px',cursor:'pointer'}}>♡</button>
                    <div style={{position:'absolute',bottom:'14px',left:'14px',right:'14px'}}>
                      <div style={{fontSize:'24px',fontWeight:900,color:'white',marginBottom:'4px',textShadow:'0 2px 8px rgba(0,0,0,0.5)'}}>{l.price_label}</div>
                      <div style={{fontSize:'13px',color:'rgba(255,255,255,0.9)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
                    </div>
                  </div>
                  <div style={{padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                      <span>📍</span>
                      <span style={{fontSize:'13px',color:'#555',fontWeight:600}}>{l.neighbourhood?l.neighbourhood+', ':''}{l.city}</span>
                    </div>
                    <button style={{background:'#078754',color:'white',border:'none',borderRadius:'12px',padding:'9px 22px',fontSize:'13px',fontWeight:800,cursor:'pointer'}} onClick={()=>window.location.href=`/listing/${l.id}`}>{tx.view}</button>
                  </div>
                </div>
              </>
            ))}
          </div>
        )}
      </section>

      <div style={{margin:'0 16px 20px',borderRadius:'18px',overflow:'hidden',cursor:'pointer',boxShadow:'0 8px 28px rgba(0,0,0,0.2)',position:'relative'}}>
        <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=85" alt="Ethiopian Airlines" style={{width:'100%',height:'140px',objectFit:'cover',display:'block'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(0,100,0,0.93) 0%,rgba(0,60,0,0.55) 100%)',display:'flex',alignItems:'center',padding:'20px',gap:'16px'}}>
          <div style={{fontSize:'44px'}}>✈️</div>
          <div style={{flex:1}}>
            <div style={{fontSize:'8px',color:'rgba(255,255,255,0.35)',letterSpacing:'2px',marginBottom:'5px'}}>{tx.ad}</div>
            <div style={{fontSize:'20px',fontWeight:900,color:'white',marginBottom:'4px'}}>Ethiopian Airlines</div>
            <div style={{fontSize:'12px',color:'rgba(255,255,255,0.8)'}}>Fly to 130+ destinations worldwide</div>
          </div>
          <div style={{background:'#FCDD09',color:'#111',fontSize:'12px',fontWeight:900,padding:'12px 18px',borderRadius:'14px',whiteSpace:'nowrap',flexShrink:0}}>Book Now</div>
        </div>
      </div>

      <section style={{margin:'0 16px 24px',background:'linear-gradient(135deg,#090909,#191919)',borderRadius:'22px',padding:'30px 22px',textAlign:'center'}}>
        <div style={{fontSize:'48px',marginBottom:'14px'}}>📲</div>
        <h3 style={{fontSize:'24px',fontWeight:900,color:'white',marginBottom:'8px'}}>HagerHub on your phone</h3>
        <p style={{color:'rgba(255,255,255,0.45)',fontSize:'14px',margin:'0 0 24px',lineHeight:1.6}}>Buy, sell and connect from anywhere in Ethiopia</p>
        <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
          <button style={{background:'white',color:'#111',border:'none',borderRadius:'14px',padding:'14px 24px',fontSize:'14px',fontWeight:800,cursor:'pointer'}}>🍎 App Store</button>
          <button style={{background:'#078754',color:'white',border:'none',borderRadius:'14px',padding:'14px 24px',fontSize:'14px',fontWeight:800,cursor:'pointer'}}>▶ Google Play</button>
        </div>
      </section>

      <footer style={{background:'#090909',padding:'32px 16px 28px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'24px',paddingBottom:'20px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <img src="/lion.jpg" alt="lion" style={{width:'42px',height:'42px',borderRadius:'50%',objectFit:'cover',border:'1.5px solid rgba(255,255,255,0.15)'}}/>
          <div>
            <div style={{fontSize:'18px',fontWeight:900,color:'white',letterSpacing:'1.5px'}}>HAGERHUB</div>
            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.25)',letterSpacing:'1px'}}>The Hub of the Homeland · ሃገር ሃብ</div>
          </div>
        </div>
        <div className='listings-grid grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-6'>
          {[
            {title:'Company',links:['About Us','Careers','Advertise with Us','Legal Hub']},
            {title:'Ethiopia',links:['Addis Ababa','Hawassa','Bahir Dar','Dire Dawa']},
            {title:'Support',links:['Help Center','Contact Us','Safety Tips','Report Listing']},
            {title:'Follow Us',links:['Facebook','Telegram','Instagram','TikTok']},
          ].map(col=>(
            <div key={col.title}>
              <h4 style={{fontSize:'10px',fontWeight:800,textTransform:'uppercase',color:'rgba(255,255,255,0.3)',marginBottom:'12px',letterSpacing:'1.5px'}}>{col.title}</h4>
              {col.links.map(l=><div key={l} onClick={()=>window.location.href='#'} style={{fontSize:'13px',color:'rgba(255,255,255,0.45)',marginBottom:'8px',cursor:'pointer',transition:'color 0.2s'}} onMouseEnter={e=>(e.currentTarget.style.color='#FCDD09')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.45)')}>{l}</div>)}
            </div>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:'18px'}}>
          <span style={{color:'rgba(255,255,255,0.12)',fontSize:'11px'}}>© 2025 HagerHub · Jiksi Michael</span>
          <div style={{display:'flex',height:'3px',width:'42px',borderRadius:'2px',overflow:'hidden'}}>
            <div style={{flex:1,background:'#078754'}}/><div style={{flex:1,background:'#FCDD09'}}/><div style={{flex:1,background:'#EF2118'}}/>
          </div>
        </div>
      </footer>
    </main>
  )
}
