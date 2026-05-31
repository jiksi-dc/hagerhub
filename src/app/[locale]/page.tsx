'use client'
import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase'
import AuthButton from '@/components/AuthButton'
import AIAssistant from '@/components/AIAssistant'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const POPULAR = [
  { key:'properties', name:'Properties', items:['Residential for Rent','Residential for Sale','Commercial','Land & Plots'] },
  { key:'vehicles',   name:'Vehicles',   items:['Used Cars','New Cars','Trucks & LGVs','Motorcycles'] },
  { key:'machinery',  name:'Machinery',  items:['Farm Equipment','Construction','Generators','Industrial'] },
  { key:'classifieds',name:'Classifieds',items:['Mobile Phones','Electronics','Furniture & Home','Clothing'] },
  { key:'jobs',       name:'Jobs',       items:['Accounting & Finance','Engineering','IT & Technology','Healthcare'] },
]

const SUBCATS: Record<string,string[]> = {
  Properties: ['Residential for Rent','Residential for Sale','Commercial','Land & Plots'],
  Vehicles:   ['Used Cars','New Cars','Trucks & LGVs','Motorcycles'],
  Machinery:  ['Farm Equipment','Construction','Generators','Industrial'],
  Classifieds:['Mobile Phones','Electronics','Furniture & Home','Clothing','IT & Technology'],
  Jobs:       ['Accounting & Finance','Engineering','IT & Technology','Healthcare','Education'],
}

const CITIES = ['Addis Ababa','Hawassa','Bahir Dar','Dire Dawa','Mekelle','Adama','Jimma','Gondar']

const IMGS: Record<string,string[]> = {
  Properties:['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=85','https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=85'],
  Vehicles:  ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=85','https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=85'],
  Machinery: ['https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=600&q=85','https://images.unsplash.com/photo-1530685932526-48ec92998eaa?w=600&q=85'],
  Classifieds:['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=85','https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=85'],
  Jobs:      ['https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=85','https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=85'],
}

interface Listing {
  image_urls?:string[]; id:string; title:string; price_label:string; city:string
  neighbourhood:string; category:string; subcategory:string; created_at:string
}

const adBase:React.CSSProperties = {borderRadius:'12px',overflow:'hidden',border:'1px solid #E5E7EB'}

const AdCard = ({bg,name,sub,cta,tag,delay='0s',height=150}:{bg:string,name:string,sub:string,cta:string,tag:string,delay?:string,height?:number}) => (
  <div style={{marginBottom:'4px'}}>
    <div style={{fontSize:'9px',color:'#9CA3AF',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'3px'}}>{tag}</div>
    <div style={{...adBase,animation:`adpulse 4s ease-in-out infinite ${delay}`}}>
      <div style={{height:`${height}px`,background:bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'7px',padding:'14px'}}>
        <div style={{fontSize:'13px',fontWeight:600,color:'white',textAlign:'center'}}>{name}</div>
        <div style={{fontSize:'10px',color:'rgba(255,255,255,0.85)',textAlign:'center',lineHeight:1.5}}>{sub}</div>
        <button style={{background:'rgba(255,255,255,0.18)',color:'white',fontSize:'10px',padding:'5px 14px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.3)',cursor:'pointer',marginTop:'3px'}}>{cta}</button>
      </div>
      <div style={{background:'#fff',padding:'9px 11px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontSize:'11px',fontWeight:500,color:'#111'}}>{name}</div>
        <div style={{fontSize:'10px',color:'#2563EB',cursor:'pointer'}}>Visit →</div>
      </div>
    </div>
  </div>
)

const SIDEBARS: Record<string, React.ReactNode> = {
  All: (
    <div style={{display:'flex',flexDirection:'column',gap:'10px',position:'sticky',top:'120px',alignSelf:'start'}}>
      <AdCard bg="#006400" name="Ethiopian Airlines" sub="Fly to 130+ destinations worldwide" cta="Book Now" tag="Premium partner" delay="0s" height={150}/>
      <AdCard bg="#003087" name="CBE Home Loans" sub="Up to ETB 5,000,000 · Low interest" cta="Apply Now" tag="Partner" delay="1s" height={100}/>
      <div style={{fontSize:'9px',color:'#9CA3AF',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'3px',marginTop:'4px'}}>Ad</div>
      <div style={{...adBase,animation:'adpulse 6s ease-in-out infinite 2s'}}>
        <div style={{height:'80px',background:'#FF6B00',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px'}}>
          <div><div style={{fontSize:'12px',fontWeight:600,color:'white'}}>Telebirr</div><div style={{fontSize:'10px',color:'rgba(255,255,255,0.85)',marginTop:'2px'}}>Pay smarter across Ethiopia</div></div>
          <button style={{background:'rgba(255,255,255,0.18)',color:'white',fontSize:'9px',padding:'4px 10px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.25)',cursor:'pointer',flexShrink:0}}>Get App</button>
        </div>
      </div>
    </div>
  ),
  Properties: (
    <div style={{display:'flex',flexDirection:'column',gap:'10px',position:'sticky',top:'120px',alignSelf:'start'}}>
      <AdCard bg="#1a3a5c" name="Midroc Real Estate" sub="Premium residential & commercial properties across Ethiopia" cta="View Properties" tag="Property partner" delay="0s" height={160}/>
      <AdCard bg="#0C4A6E" name="CBE Home Loans" sub="Finance your dream home · Up to ETB 5,000,000 at low interest" cta="Apply for a Loan" tag="Property partner" delay="1s" height={160}/>
    </div>
  ),
  Vehicles: (
    <div style={{display:'flex',flexDirection:'column',gap:'10px',position:'sticky',top:'120px',alignSelf:'start'}}>
      <AdCard bg="#1a1a2e" name="Ethiopian Insurance" sub="Comprehensive vehicle insurance · Best rates in Ethiopia" cta="Get a Quote" tag="Vehicle partner" delay="0s" height={160}/>
      <AdCard bg="#006400" name="Ethiopian Airlines" sub="Fly to 130+ destinations worldwide" cta="Book Now" tag="Partner" delay="1s" height={100}/>
    </div>
  ),
  Machinery: (
    <div style={{display:'flex',flexDirection:'column',gap:'10px',position:'sticky',top:'120px',alignSelf:'start'}}>
      <AdCard bg="#78350F" name="Midroc Construction" sub="Leading construction company in Ethiopia · Equipment & Services" cta="Learn More" tag="Machinery partner" delay="0s" height={160}/>
      <AdCard bg="#166534" name="Ethiopian Agri-Business" sub="Farm equipment financing & leasing across Ethiopia" cta="Apply Now" tag="Partner" delay="1s" height={100}/>
    </div>
  ),
  Classifieds: (
    <div style={{display:'flex',flexDirection:'column',gap:'10px',position:'sticky',top:'120px',alignSelf:'start'}}>
      <AdCard bg="#FF6B00" name="Telebirr" sub="Pay for anything across Ethiopia · Send & Receive money instantly" cta="Get App" tag="Payment partner" delay="0s" height={160}/>
      <AdCard bg="#003087" name="CBE" sub="Digital banking · Instant transfers · Mobile banking" cta="Learn More" tag="Partner" delay="1s" height={100}/>
    </div>
  ),
  Jobs: (
    <div style={{display:'flex',flexDirection:'column',gap:'10px',position:'sticky',top:'120px',alignSelf:'start'}}>
      <AdCard bg="#006400" name="Ethiopian Airlines" sub="We are hiring · Join Africa's largest airline today" cta="View Jobs" tag="Employer partner" delay="0s" height={160}/>
      <AdCard bg="#1a3a5c" name="Midroc Group" sub="Career opportunities across Ethiopia · Apply now" cta="Apply Now" tag="Employer partner" delay="1s" height={100}/>
    </div>
  ),
}

const filterLabel:React.CSSProperties = {fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:'#6B7280',marginBottom:'8px',display:'block'}
const filterSelect:React.CSSProperties = {width:'100%',padding:'8px 10px',border:'1.5px solid #E5E7EB',borderRadius:'8px',fontSize:'13px',color:'#111',background:'#fff',fontFamily:'inherit',outline:'none',cursor:'pointer'}
const filterInput:React.CSSProperties = {width:'100%',padding:'8px 10px',border:'1.5px solid #E5E7EB',borderRadius:'8px',fontSize:'13px',color:'#111',fontFamily:'inherit',outline:'none'}

export default function Home() {
  const t = useTranslations()
  const locale = useLocale()
  const [activeCat, setActiveCat] = useState('All')
  const [search, setSearch] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<any>(null)

  // Filter state
  const [filterCity, setFilterCity] = useState('')
  const [filterSubcat, setFilterSubcat] = useState('')
  const [filterMinPrice, setFilterMinPrice] = useState('')
  const [filterMaxPrice, setFilterMaxPrice] = useState('')
  const [filterSort, setFilterSort] = useState('newest')

  const TABS = [
    { key:'all',        name:'All' },
    { key:'properties', name:'Properties' },
    { key:'vehicles',   name:'Vehicles' },
    { key:'machinery',  name:'Machinery' },
    { key:'classifieds',name:'Classifieds' },
    { key:'jobs',       name:'Jobs' },
  ]

  useEffect(()=>{
    fetchListings()
    const supabase = createClient()
    supabase.auth.getUser().then(({data})=>{
      setUser(data.user)
      if(data.user) loadSaved(data.user.id)
    })
  },[activeCat])

  // Reset filters when category changes
  useEffect(()=>{
    setFilterCity('')
    setFilterSubcat('')
    setFilterMinPrice('')
    setFilterMaxPrice('')
    setFilterSort('newest')
  },[activeCat])

  async function loadSaved(userId: string) {
    const supabase = createClient()
    const {data} = await supabase.from('saved_listings').select('listing_id').eq('user_id',userId)
    if(data) setSaved(new Set(data.map((r:any)=>r.listing_id)))
  }

  async function fetchListings() {
    setLoading(true)
    const supabase = createClient()
    let q = supabase.from('listings').select('*').eq('status','active').order('created_at',{ascending:false})
    if (activeCat!=='All') q = q.eq('category',activeCat)
    const {data} = await q.limit(100)
    setListings(data||[])
    setLoading(false)
  }

  const toggleSave = async (id:string,e:React.MouseEvent) => {
    e.stopPropagation()
    if(!user) { window.location.href='/login'; return }
    const supabase = createClient()
    const isSaved = saved.has(id)
    setSaved(prev=>{ const n=new Set(prev); isSaved?n.delete(id):n.add(id); return n })
    if(isSaved) {
      await supabase.from('saved_listings').delete().eq('user_id',user.id).eq('listing_id',id)
    } else {
      await supabase.from('saved_listings').insert({user_id:user.id,listing_id:id})
    }
  }

  const clearFilters = () => {
    setFilterCity('')
    setFilterSubcat('')
    setFilterMinPrice('')
    setFilterMaxPrice('')
    setFilterSort('newest')
    setSearch('')
  }

  const hasActiveFilters = filterCity || filterSubcat || filterMinPrice || filterMaxPrice || search

  // Apply all filters client-side
  let filtered = listings.filter(l => {
    if (search && !l.title?.toLowerCase().includes(search.toLowerCase())) return false
    if (filterCity && l.city !== filterCity) return false
    if (filterSubcat && l.subcategory !== filterSubcat) return false
    if (filterMinPrice && Number(l.price_label?.replace(/[^0-9]/g,'')) < Number(filterMinPrice)) return false
    if (filterMaxPrice && Number(l.price_label?.replace(/[^0-9]/g,'')) > Number(filterMaxPrice)) return false
    return true
  })

  if (filterSort === 'price_asc') filtered = [...filtered].sort((a,b) => Number(a.price_label?.replace(/[^0-9]/g,'')) - Number(b.price_label?.replace(/[^0-9]/g,'')))
  if (filterSort === 'price_desc') filtered = [...filtered].sort((a,b) => Number(b.price_label?.replace(/[^0-9]/g,'')) - Number(a.price_label?.replace(/[^0-9]/g,'')))

  const Card = ({l}:{l:Listing}) => {
    const imgs = l.image_urls?.length ? l.image_urls : IMGS[l.category]||[]
    const img = imgs[0]||''
    return (
      <div onClick={()=>window.location.href=`/${locale}/listing/${l.id}`}
        style={{background:'#fff',borderRadius:'12px',overflow:'hidden',border:'1px solid #F3F4F6',cursor:'pointer',transition:'box-shadow .15s'}}>
        <div style={{position:'relative',paddingTop:'66%',background:'#F9FAFB'}}>
          {img && <img src={img} alt={l.title} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>}
          <div style={{position:'absolute',bottom:'8px',left:'8px',background:'rgba(0,0,0,0.7)',color:'white',fontSize:'12px',fontWeight:700,padding:'3px 8px',borderRadius:'6px'}}>
            {l.price_label}
          </div>
          <button onClick={(e)=>toggleSave(l.id,e)}
            style={{position:'absolute',top:'8px',right:'8px',background:'rgba(255,255,255,0.9)',border:'none',borderRadius:'50%',width:'30px',height:'30px',cursor:'pointer',fontSize:'15px',display:'flex',alignItems:'center',justifyContent:'center'}}>
            {saved.has(l.id)?'♥':'♡'}
          </button>
          <div style={{position:'absolute',top:'8px',left:'8px',background:'#2563EB',color:'white',fontSize:'10px',fontWeight:600,padding:'2px 7px',borderRadius:'5px'}}>
            {l.subcategory||l.category}
          </div>
        </div>
        <div style={{padding:'10px 12px 12px'}}>
          <div style={{fontSize:'13px',fontWeight:600,color:'#111',marginBottom:'3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
          <div style={{fontSize:'11px',color:'#6B7280'}}>{l.neighbourhood}, {l.city}</div>
        </div>
      </div>
    )
  }

  const FilterPanel = () => (
    <div style={{position:'sticky',top:'120px',alignSelf:'start',background:'#fff',borderRadius:'14px',border:'1px solid #F3F4F6',padding:'18px',display:'flex',flexDirection:'column',gap:'18px',minWidth:'200px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:'13px',fontWeight:700,color:'#111'}}>Filters</span>
        {hasActiveFilters && (
          <button onClick={clearFilters} style={{fontSize:'11px',color:'#2563EB',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>Clear all</button>
        )}
      </div>

      {/* Sort */}
      <div>
        <label style={filterLabel}>Sort by</label>
        <select value={filterSort} onChange={e=>setFilterSort(e.target.value)} style={filterSelect}>
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Location */}
      <div>
        <label style={filterLabel}>City</label>
        <select value={filterCity} onChange={e=>setFilterCity(e.target.value)} style={filterSelect}>
          <option value="">All cities</option>
          {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Subcategory */}
      {SUBCATS[activeCat] && (
        <div>
          <label style={filterLabel}>Type</label>
          <select value={filterSubcat} onChange={e=>setFilterSubcat(e.target.value)} style={filterSelect}>
            <option value="">All types</option>
            {SUBCATS[activeCat].map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {/* Price range */}
      <div>
        <label style={filterLabel}>Price (ETB)</label>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <input
            type="number"
            placeholder="Min"
            value={filterMinPrice}
            onChange={e=>setFilterMinPrice(e.target.value)}
            style={{...filterInput,width:'50%'}}
          />
          <span style={{color:'#9CA3AF',fontSize:'12px'}}>—</span>
          <input
            type="number"
            placeholder="Max"
            value={filterMaxPrice}
            onChange={e=>setFilterMaxPrice(e.target.value)}
            style={{...filterInput,width:'50%'}}
          />
        </div>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
          {filterCity && <span style={{fontSize:'11px',background:'#EFF6FF',color:'#2563EB',padding:'3px 8px',borderRadius:'20px',fontWeight:500}}>{filterCity} ×</span>}
          {filterSubcat && <span style={{fontSize:'11px',background:'#EFF6FF',color:'#2563EB',padding:'3px 8px',borderRadius:'20px',fontWeight:500}}>{filterSubcat} ×</span>}
          {(filterMinPrice||filterMaxPrice) && <span style={{fontSize:'11px',background:'#EFF6FF',color:'#2563EB',padding:'3px 8px',borderRadius:'20px',fontWeight:500}}>ETB {filterMinPrice||'0'} – {filterMaxPrice||'∞'} ×</span>}
        </div>
      )}
    </div>
  )

  return (
    <main style={{minHeight:'100vh',background:'#F9FAFB',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <style>{`
        @keyframes adpulse { 0%,100%{opacity:1} 50%{opacity:.92} }
        *{box-sizing:border-box;margin:0;padding:0}
        select:focus,input:focus{border-color:#2563EB!important}
      `}</style>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,background:'#fff',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 20px',height:'56px',display:'flex',alignItems:'center',gap:'12px'}}>
          <a href={`/${locale}`} style={{textDecoration:'none',flexShrink:0}}>
            <div style={{fontSize:'15px',fontWeight:900,color:'#111',letterSpacing:'2px'}}>HAGERHUB</div>
            <div style={{fontSize:'8px',color:'#9CA3AF',letterSpacing:'1.5px',marginTop:'1px'}}>ETHIOPIA'S #1 MARKETPLACE</div>
          </a>
          <div style={{flex:1,maxWidth:'480px',position:'relative'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder={t('nav.search')}
              style={{width:'100%',padding:'9px 14px 9px 38px',border:'1.5px solid #E5E7EB',borderRadius:'10px',fontSize:'13px',outline:'none',fontFamily:'inherit'}}/>
            <span style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'#9CA3AF',fontSize:'14px'}}>⌕</span>
          </div>
          <button style={{padding:'9px 18px',background:'#111',color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',flexShrink:0}}>
            {t('nav.searchBtn')}
          </button>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'10px',flexShrink:0}}>
            <AuthButton/>
            <a href={`/${locale}/post`} style={{fontSize:'13px',fontWeight:600,padding:'9px 18px',background:'#111',color:'white',borderRadius:'8px',textDecoration:'none',border:'none',whiteSpace:'nowrap'}}>
              {t('nav.post')}
            </a>
            <LanguageSwitcher/>
            <AIAssistant/>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 20px',display:'flex',gap:'0',borderTop:'1px solid #F3F4F6'}}>
          {TABS.map(tab=>(
            <button key={tab.key} onClick={()=>setActiveCat(tab.name)}
              style={{padding:'12px 18px',fontSize:'13px',fontWeight:activeCat===tab.name?700:400,
                color:activeCat===tab.name?'#111':'#6B7280',background:'none',border:'none',
                borderBottom:activeCat===tab.name?'2px solid #111':'2px solid transparent',
                cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',transition:'color .15s'}}>
              {t('cats.' + tab.key)}
            </button>
          ))}
        </div>
      </nav>

      {/* MAIN */}
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'24px 20px',display:'grid',gridTemplateColumns: activeCat==='All' ? '1fr 240px' : '220px 1fr 240px',gap:'24px',alignItems:'start'}}>

        {/* FILTER PANEL — only when category is active */}
        {activeCat !== 'All' && <FilterPanel/>}

        <div>
          {/* POPULAR CATEGORIES GRID — only on All */}
          {activeCat==='All' && (
            <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #F3F4F6',padding:'20px 24px',marginBottom:'24px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <h2 style={{fontSize:'15px',fontWeight:700,color:'#111'}}>{t('home.browse')}</h2>
                <span style={{fontSize:'12px',color:'#6B7280',cursor:'pointer'}}>{t('home.seeAll')}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'16px'}}>
                {POPULAR.map(cat=>(
                  <div key={cat.key} onClick={()=>setActiveCat(cat.name)} style={{cursor:'pointer'}}>
                    <div style={{fontSize:'12px',fontWeight:700,color:'#111',marginBottom:'6px'}}>
                      {t('cats.' + cat.key)}
                    </div>
                    {cat.items.map(item=>(
                      <div key={item} style={{fontSize:'11px',color:'#6B7280',marginBottom:'4px'}}>{item}</div>
                    ))}
                    <div style={{fontSize:'11px',color:'#2563EB',fontWeight:600,marginTop:'8px'}}>
                      {t('home.viewAll')} →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results count when filtering */}
          {activeCat !== 'All' && (
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
              <div>
                <h2 style={{fontSize:'15px',fontWeight:700,color:'#111',margin:0,display:'inline'}}>{t('cats.' + TABS.find(tab=>tab.name===activeCat)?.key || 'all')}</h2>
                <span style={{fontSize:'12px',color:'#9CA3AF',marginLeft:'8px'}}>{filtered.length} {t('home.available')}</span>
              </div>
              <button onClick={()=>setActiveCat('All')} style={{fontSize:'12px',color:'#6B7280',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>← Back</button>
            </div>
          )}

          {loading ? (
            <div style={{textAlign:'center',padding:'60px',color:'#9CA3AF',background:'#fff',borderRadius:'12px'}}>{t('home.loading')}</div>
          ) : filtered.length===0 ? (
            <div style={{textAlign:'center',padding:'60px',color:'#9CA3AF',background:'#fff',borderRadius:'12px'}}>{t('home.none')}</div>
          ) : activeCat==='All' ? (
            POPULAR.map(cat=>{
              const items=filtered.filter(l=>l.category===cat.name)
              if(items.length===0) return null
              return (
                <div key={cat.key} style={{marginBottom:'24px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                    <h2 style={{fontSize:'15px',fontWeight:700,color:'#111',margin:0}}>
                      Popular in {t('cats.' + cat.key)}
                    </h2>
                    <span onClick={()=>setActiveCat(cat.name)} style={{fontSize:'12px',color:'#6B7280',cursor:'pointer'}}>{t('home.seeAll')}</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'12px'}}>
                    {items.slice(0,4).map(l=><Card key={l.id} l={l}/>)}
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'12px'}}>
              {filtered.map(l=><Card key={l.id} l={l}/>)}
            </div>
          )}
        </div>

        {SIDEBARS[activeCat] || SIDEBARS['All']}
      </div>

      <footer style={{background:'#fff',borderTop:'1px solid #EBEBEB',padding:'32px 20px 24px',marginTop:'16px'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto'}}>
          <div style={{fontSize:'15px',fontWeight:900,color:'#111',letterSpacing:'2px',marginBottom:'4px'}}>HAGERHUB</div>
          <div style={{fontSize:'11px',color:'#9CA3AF',letterSpacing:'1.5px',marginBottom:'24px'}}>ETHIOPIA'S #1 MARKETPLACE · የኢትዮጵያ ቁጥር 1 ገበያ</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'24px',marginBottom:'28px'}}>
            {[
              {title:t('footer.company'), links:['About Us','Careers','Advertise with Us','Legal Hub']},
              {title:t('footer.ethiopia'),links:['Addis Ababa','Hawassa','Bahir Dar','Dire Dawa']},
              {title:t('footer.support'), links:['Help Center','Contact Us','Safety Tips','Report Listing']},
              {title:t('footer.follow'),  links:['Facebook','Telegram','Instagram','TikTok']},
              {title:'Languages',         links:['English','አማርኛ']},
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
              <button style={{background:'#111',color:'white',fontSize:'11px',fontWeight:700,padding:'5px 14px',borderRadius:'7px',cursor:'pointer',border:'none',fontFamily:'inherit'}}>App Store</button>
              <button style={{background:'#374151',color:'white',fontSize:'11px',fontWeight:700,padding:'5px 14px',borderRadius:'7px',cursor:'pointer',border:'none',fontFamily:'inherit'}}>Google Play</button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
