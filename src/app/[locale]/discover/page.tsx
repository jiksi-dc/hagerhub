'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AuthButton from '@/components/AuthButton'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import AIAssistant from '@/components/AIAssistant'

// Curated Ethiopia attractions — always shown even with no user listings
const CURATED = [
  // ADDIS ABABA
  { id:'c1', title:'National Museum of Ethiopia', subcategory:'Museum & Heritage', city:'Addis Ababa', region:'Addis Ababa', price_label:'ETB 100', description:'Home to Lucy — the 3.2 million year old hominid fossil — plus imperial regalia, ancient artifacts and Ethiopian art.', tag:'UNESCO Related', image_urls:['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80'], curated:true },
  { id:'c2', title:'Holy Trinity Cathedral', subcategory:'Religious Site', city:'Addis Ababa', region:'Addis Ababa', price_label:'Free', description:'The burial site of Emperor Haile Selassie. Breathtaking architecture, daily hymns, and magnificent stained glass.', tag:'Historic', image_urls:['https://images.unsplash.com/photo-1466442929976-97f336a657be?w=600&q=80'], curated:true },
  { id:'c3', title:'Entoto Park', subcategory:'Nature & Wildlife', city:'Addis Ababa', region:'Addis Ababa', price_label:'ETB 200', description:'Perched at 3,200m above sea level — the roof of Addis. Zipline, rope courses, archery, spa, and panoramic city views.', tag:'Adventure', image_urls:['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80'], curated:true },
  { id:'c4', title:'Merkato Market', subcategory:'Market & Shopping', city:'Addis Ababa', region:'Addis Ababa', price_label:'Free', description:'Africa's largest open-air market. A sensory explosion of spices, textiles, electronics, and everyday Ethiopian life.', tag:'Cultural', image_urls:['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'], curated:true },
  { id:'c5', title:'Unity Park', subcategory:'Tourist Attraction', city:'Addis Ababa', region:'Addis Ababa', price_label:'ETB 250', description:'The former Imperial Palace grounds — beautifully landscaped gardens, historical exhibitions, zoo with lions, and stunning architecture.', tag:'Must See', image_urls:['https://images.unsplash.com/photo-1548625149-720afe491375?w=600&q=80'], curated:true },
  { id:'c6', title:'Red Terror Martyrs' Memorial Museum', subcategory:'Museum & Heritage', city:'Addis Ababa', region:'Addis Ababa', price_label:'Free', description:'A powerful and important museum documenting the Derg regime. Staffed by survivors. Essential for understanding modern Ethiopia.', tag:'Historic', image_urls:['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80'], curated:true },
  // LALIBELA
  { id:'c7', title:'Rock-Hewn Churches of Lalibela', subcategory:'Religious Site', city:'Lalibela', region:'Amhara', price_label:'ETB 1,200', description:'11 medieval monolithic churches carved directly from rock in the 12th century. Ethiopia's most iconic UNESCO World Heritage Site — the 8th Wonder of the World.', tag:'UNESCO', image_urls:['https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=600&q=80'], curated:true },
  { id:'c8', title:'Timkat Festival — Lalibela', subcategory:'Festival & Cultural Event', city:'Lalibela', region:'Amhara', price_label:'Free', description:'Ethiopian Epiphany celebrated each January with spectacular processions, colorful umbrellas, chanting priests and a unique spiritual atmosphere unlike anywhere on Earth.', tag:'Festival', image_urls:['https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&q=80'], curated:true },
  // GONDAR
  { id:'c9', title:'Fasilides Castle — Fasil Ghebbi', subcategory:'Museum & Heritage', city:'Gondar', region:'Amhara', price_label:'ETB 600', description:'17th century royal enclosure with six castles — the "Camelot of Africa". A UNESCO World Heritage Site blending Ethiopian, Portuguese and Indian architecture.', tag:'UNESCO', image_urls:['https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600&q=80'], curated:true },
  { id:'c10', title:'Fasilides Bath — Timkat Celebration', subcategory:'Festival & Cultural Event', city:'Gondar', region:'Amhara', price_label:'Free', description:'Gondar's Timkat fills the ancient pool with worshippers. The most photogenic religious festival in Ethiopia, every January 19-20.', tag:'Festival', image_urls:['https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&q=80'], curated:true },
  // SIMIEN MOUNTAINS
  { id:'c11', title:'Simien Mountains National Park', subcategory:'National Park', city:'Debark', region:'Amhara', price_label:'ETB 800', description:'"Roof of Africa" — dramatic escarpments dropping 1,500m, Gelada baboons, Ethiopian wolves, Walia ibex and some of the most spectacular trekking on the continent. UNESCO site.', tag:'UNESCO', image_urls:['https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=80'], curated:true },
  // BALE MOUNTAINS
  { id:'c12', title:'Bale Mountains National Park', subcategory:'National Park', city:'Goba', region:'Oromia', price_label:'ETB 500', description:'Ethiopia's most biodiverse park — Afro-alpine plateau rising above 4,000m, Ethiopian wolves, giant mole rats, and the Harenna Forest.', tag:'Wildlife', image_urls:['https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&q=80'], curated:true },
  // AWASH
  { id:'c13', title:'Awash National Park', subcategory:'National Park', city:'Awash', region:'Afar', price_label:'ETB 400', description:'225km from Addis — volcanic landscapes, the Awash River gorge, hot springs, over 400 bird species, oryx, lion and kudu.', tag:'Wildlife', image_urls:['https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&q=80'], curated:true },
  // DANAKIL
  { id:'c14', title:'Danakil Depression — Erta Ale Volcano', subcategory:'Nature & Wildlife', city:'Mekelle', region:'Afar', price_label:'Tour Required', description:'One of Earth's most extreme landscapes — the world's lowest volcano with a permanent lava lake, sulfuric springs of Dallol, and vast salt flats. A bucket-list destination.', tag:'Extreme', image_urls:['https://images.unsplash.com/photo-1608155686393-8fdd966d784d?w=600&q=80'], curated:true },
  // AXUM
  { id:'c15', title:'Ancient City of Axum', subcategory:'Museum & Heritage', city:'Axum', region:'Tigray', price_label:'ETB 600', description:'Capital of the ancient Aksumite Empire. Giant obelisks, the Church of St. Mary of Zion (said to house the Ark of the Covenant), and royal tombs. UNESCO site.', tag:'UNESCO', image_urls:['https://images.unsplash.com/photo-1548625149-720afe491375?w=600&q=80'], curated:true },
  // HARAR
  { id:'c16', title:'Harar Jugol — Walled City', subcategory:'Tourist Attraction', city:'Harar', region:'Harari', price_label:'ETB 200', description:'The 4th holiest city in Islam. A labyrinth of 362 narrow alleys, colorful traditional houses, and the famous Hyena Man feeding wild hyenas by hand each night.', tag:'UNESCO', image_urls:['https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=600&q=80'], curated:true },
  // LAKE TANA
  { id:'c17', title:'Lake Tana & Blue Nile Falls', subcategory:'Nature & Wildlife', city:'Bahir Dar', region:'Amhara', price_label:'ETB 300', description:'Ethiopia's largest lake dotted with ancient island monasteries, and the spectacular Blue Nile Falls (Tis Isat) — one of Africa's greatest waterfalls.', tag:'Natural Wonder', image_urls:['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'], curated:true },
  // OMO VALLEY
  { id:'c18', title:'Omo Valley Tribes Experience', subcategory:'Tour Package', city:'Jinka', region:'SNNPR', price_label:'Tour Required', description:'One of Africa's last great ethnological destinations. Meet the Mursi, Hamer, Karo and Dassanech peoples — living traditions unchanged for centuries.', tag:'Cultural', image_urls:['https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&q=80'], curated:true },
  // RIFT VALLEY
  { id:'c19', title:'Rift Valley Lakes — Bishoftu & Beyond', subcategory:'Nature & Wildlife', city:'Bishoftu', region:'Oromia', price_label:'ETB 50', description:'Volcanic crater lakes just 45km from Addis — Bishoftu (Debre Zeyit) lakes are perfect for a day trip. Birdwatching, boat rides, and lakeside dining.', tag:'Day Trip', image_urls:['https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&q=80'], curated:true },
  // MESKEL FESTIVAL
  { id:'c20', title:'Meskel Festival — Addis Ababa', subcategory:'Festival & Cultural Event', city:'Addis Ababa', region:'Addis Ababa', price_label:'Free', description:'Ethiopia's grandest festival (September 27). A sea of yellow flowers, torchlit processions, traditional dance and the spectacular Demera bonfire at Meskel Square. UNESCO Intangible Heritage.', tag:'UNESCO', image_urls:['https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&q=80'], curated:true },
]

const TAG_COLORS: Record<string,{bg:string,color:string}> = {
  'UNESCO': {bg:'#EFF6FF',color:'#1D4ED8'},
  'Festival': {bg:'#FFF7ED',color:'#C2410C'},
  'Wildlife': {bg:'#F0FDF4',color:'#15803D'},
  'Adventure': {bg:'#F5F3FF',color:'#7C3AED'},
  'Historic': {bg:'#FFFBEB',color:'#92400E'},
  'Must See': {bg:'#FFF1F2',color:'#BE123C'},
  'Cultural': {bg:'#FDF4FF',color:'#9333EA'},
  'Natural Wonder': {bg:'#ECFDF5',color:'#065F46'},
  'Day Trip': {bg:'#F0FDFA',color:'#0F766E'},
  'Extreme': {bg:'#FEF2F2',color:'#991B1B'},
}

const SUBCATS = ['All','Tourist Attraction','National Park','Nature & Wildlife','Museum & Heritage','Religious Site','Festival & Cultural Event','Concert & Entertainment','Sports Event','Food & Dining Experience','Market & Shopping','Tour Package']
const REGIONS = ['All Regions','Addis Ababa','Amhara','Oromia','Tigray','SNNPR','Afar','Harari']

export default function DiscoverPage() {
  const params = useParams()
  const locale = params.locale as string
  const [listings, setListings] = useState<any[]>([])
  const [filter, setFilter] = useState('All')
  const [regionFilter, setRegionFilter] = useState('All Regions')
  const [search, setSearch] = useState('')

  useEffect(() => {
    createClient().from('listings').select('*').eq('category','Discover Ethiopia').eq('status','active').order('created_at',{ascending:false}).limit(100)
      .then(({ data }) => setListings(data || []))
  }, [])

  const all = [...CURATED, ...listings]
  const filtered = all.filter(l => {
    const matchSub = filter === 'All' || l.subcategory === filter
    const matchReg = regionFilter === 'All Regions' || l.region === regionFilter
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.city?.toLowerCase().includes(search.toLowerCase()) || l.description?.toLowerCase().includes(search.toLowerCase())
    return matchSub && matchReg && matchSearch
  })

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
            <a href={`/${locale}/post`} style={{fontSize:'13px',fontWeight:600,padding:'9px 18px',background:'#111',color:'white',borderRadius:'8px',textDecoration:'none',whiteSpace:'nowrap'}}>+ Add Listing</a>
            <LanguageSwitcher/>
            <AIAssistant/>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{background:'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)',padding:'60px 20px 50px',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'url(https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1400&q=60)',backgroundSize:'cover',backgroundPosition:'center',opacity:0.2}}/>
        <div style={{position:'relative',maxWidth:'700px',margin:'0 auto'}}>
          <div style={{fontSize:'13px',fontWeight:700,letterSpacing:'4px',color:'#FCD34D',marginBottom:'12px',textTransform:'uppercase'}}>🇪🇹 Discover Ethiopia</div>
          <h1 style={{fontSize:'clamp(28px,5vw,48px)',fontWeight:900,color:'white',lineHeight:1.2,marginBottom:'16px'}}>
            The Land of Origins
          </h1>
          <p style={{fontSize:'16px',color:'rgba(255,255,255,0.8)',lineHeight:1.7,marginBottom:'28px'}}>
            Ancient churches hewn from rock. Volcanoes with lava lakes. Tribal cultures unchanged for centuries. Africa's most extraordinary country — all in one place.
          </p>
          <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap',marginBottom:'8px'}}>
            {[{n:'9',l:'UNESCO Sites'},{n:'22+',l:'National Parks'},{n:'80+',l:'Ethnic Groups'},{n:'3,000+',l:'Years of History'}].map(s=>(
              <div key={s.l} style={{background:'rgba(255,255,255,0.1)',backdropFilter:'blur(10px)',borderRadius:'12px',padding:'12px 20px',textAlign:'center'}}>
                <div style={{fontSize:'22px',fontWeight:900,color:'#FCD34D'}}>{s.n}</div>
                <div style={{fontSize:'11px',color:'rgba(255,255,255,0.7)',letterSpacing:'0.5px'}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SEARCH + FILTERS */}
      <div style={{background:'#fff',borderBottom:'1px solid #F3F4F6',padding:'16px 20px',position:'sticky',top:'56px',zIndex:99}}>
        <div style={{maxWidth:'1280px',margin:'0 auto'}}>
          <div style={{display:'flex',gap:'10px',flexWrap:'wrap',alignItems:'center'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search attractions, parks, events..."
              style={{flex:1,minWidth:'200px',padding:'10px 14px',border:'1.5px solid #E5E7EB',borderRadius:'10px',fontSize:'13px',fontFamily:'inherit',outline:'none'}}/>
            <select value={regionFilter} onChange={e=>setRegionFilter(e.target.value)}
              style={{padding:'10px 14px',border:'1.5px solid #E5E7EB',borderRadius:'10px',fontSize:'13px',fontFamily:'inherit',outline:'none',cursor:'pointer',background:'#fff'}}>
              {REGIONS.map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
          <div style={{display:'flex',gap:'8px',marginTop:'10px',overflowX:'auto',paddingBottom:'2px'}}>
            {SUBCATS.map(s=>(
              <button key={s} onClick={()=>setFilter(s)}
                style={{padding:'7px 14px',borderRadius:'20px',border:'1.5px solid',borderColor:filter===s?'#111':'#E5E7EB',background:filter===s?'#111':'#fff',color:filter===s?'white':'#374151',fontSize:'12px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',flexShrink:0}}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULTS */}
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'24px 20px 48px'}}>
        <div style={{fontSize:'13px',color:'#9CA3AF',marginBottom:'16px'}}>{filtered.length} experiences found</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'20px'}}>
          {filtered.map(l=>{
            const tagStyle = TAG_COLORS[l.tag] || {bg:'#F3F4F6',color:'#6B7280'}
            const href = l.curated ? null : `/${locale}/listing/${l.id}`
            return (
              <div key={l.id} style={{background:'#fff',borderRadius:'16px',border:'1px solid #F3F4F6',overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.06)',transition:'transform 0.2s,box-shadow 0.2s'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';(e.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(0,0,0,0.1)'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(0)';(e.currentTarget as HTMLElement).style.boxShadow='0 1px 3px rgba(0,0,0,0.06)'}}>
                <div style={{height:'180px',background:'#F3F4F6',overflow:'hidden',position:'relative'}}>
                  <img src={l.image_urls?.[0]||''} alt={l.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  <div style={{position:'absolute',top:'10px',left:'10px',background:tagStyle.bg,color:tagStyle.color,fontSize:'10px',fontWeight:700,padding:'3px 8px',borderRadius:'6px',letterSpacing:'0.3px'}}>
                    {l.tag || l.subcategory}
                  </div>
                  {l.curated && <div style={{position:'absolute',top:'10px',right:'10px',background:'rgba(0,0,0,0.6)',color:'white',fontSize:'9px',fontWeight:700,padding:'3px 7px',borderRadius:'5px',letterSpacing:'0.5px'}}>FEATURED</div>}
                </div>
                <div style={{padding:'16px'}}>
                  <div style={{fontSize:'11px',color:'#9CA3AF',marginBottom:'4px'}}>{l.subcategory} · {l.city}{l.region && l.region !== l.city ? `, ${l.region}` : ''}</div>
                  <div style={{fontSize:'15px',fontWeight:700,color:'#111',marginBottom:'6px',lineHeight:1.3}}>{l.title}</div>
                  <div style={{fontSize:'12px',color:'#6B7280',lineHeight:1.6,marginBottom:'12px',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical'} as any}>
                    {l.description}
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{fontSize:'13px',fontWeight:700,color:'#059669'}}>{l.price_label || l.admission_fee || 'See details'}</div>
                    {href ? (
                      <a href={href} style={{fontSize:'12px',fontWeight:600,color:'#2563EB',textDecoration:'none',padding:'6px 12px',background:'#EFF6FF',borderRadius:'8px'}}>View →</a>
                    ) : (
                      <span style={{fontSize:'10px',color:'#9CA3AF',fontStyle:'italic'}}>Curated</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{textAlign:'center',padding:'80px 20px',color:'#9CA3AF'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>🔍</div>
            <div style={{fontSize:'16px',fontWeight:600,color:'#374151',marginBottom:'8px'}}>No results found</div>
            <div style={{fontSize:'13px'}}>Try a different filter or be the first to add this experience</div>
            <a href={`/${locale}/post`} style={{display:'inline-block',marginTop:'16px',padding:'10px 24px',background:'#111',color:'white',borderRadius:'10px',textDecoration:'none',fontSize:'13px',fontWeight:600}}>+ Add Experience</a>
          </div>
        )}

        {/* CTA */}
        <div style={{marginTop:'48px',background:'linear-gradient(135deg,#111,#333)',borderRadius:'20px',padding:'40px',textAlign:'center'}}>
          <div style={{fontSize:'22px',fontWeight:800,color:'white',marginBottom:'8px'}}>Know a hidden gem?</div>
          <div style={{fontSize:'14px',color:'rgba(255,255,255,0.7)',marginBottom:'20px',maxWidth:'400px',margin:'0 auto 20px'}}>Share local events, attractions, tours and experiences with the world. Help put Ethiopia on the map.</div>
          <a href={`/${locale}/post`} style={{display:'inline-block',padding:'14px 32px',background:'#FCD34D',color:'#111',borderRadius:'12px',textDecoration:'none',fontSize:'15px',fontWeight:800}}>
            🇪🇹 Add to Discover Ethiopia
          </a>
        </div>
      </div>
    </main>
  )
}
