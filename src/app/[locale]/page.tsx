'use client'
import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase'
import AuthButton from '@/components/AuthButton'
import LanguageSwitcher from '@/components/LanguageSwitcher'

function renderAiMarkdown(src: string){
  let s = src.replace(/[<>]/g, c => (c === '<' ? '&lt;' : '&gt;'))
  s = s.replace(/(?:^\|.*\|[ \t]*\n?)+/gm, block => {
    const rows = block.trim().split('\n').map(r => r.trim()).filter(Boolean)
    const cells = rows.map(r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim()))
    const body = cells.filter(row => !row.every(c => /^-+$/.test(c)))
    if (body.length === 0) return ''
    const head = body[0]; const rest = body.slice(1)
    const th = head.map(c => '<th style="text-align:left;padding:4px 8px;border-bottom:1px solid #ddd;font-weight:600;">'+c+'</th>').join('')
    const trs = rest.map(row => '<tr>' + row.map(c => '<td style="padding:4px 8px;border-bottom:1px solid #f0f0f0;">'+c+'</td>').join('') + '</tr>').join('')
    return '<table style="border-collapse:collapse;width:100%;margin:6px 0;font-size:12px;"><thead><tr>'+th+'</tr></thead><tbody>'+trs+'</tbody></table>'
  })
  s = s.replace(/^#{2,3}\s?(.*)$/gm, '<div style="font-weight:700;margin:8px 0 4px;">$1</div>')
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/^\s*---\s*$/gm, '<hr style="border:none;border-top:1px solid #eee;margin:8px 0;">')
  s = s.replace(/^\s*[-\u2022]\s+(.*)$/gm, '<li style="margin:2px 0;">$1</li>')
  s = s.replace(/(<li[\s\S]*?<\/li>)/g, '<ul style="margin:4px 0;padding-left:18px;">$1</ul>')
  s = s.replace(/<\/ul>\s*<ul[^>]*>/g, '')
  s = s.replace(/\n/g, '<br>')
  s = s.replace(/<br>\s*(<div|<hr|<ul|<table)/g, '$1')
  s = s.replace(/(<\/div>|<hr[^>]*>|<\/ul>|<\/table>)\s*<br>/g, '$1')
  return s
}

const POPULAR = [
  { key:'properties', name:'Properties', items:['Residential for Rent','Residential for Sale','Commercial','Land & Plots'] },
  { key:'vehicles',   name:'Vehicles',   items:['Used Cars','New Cars','Trucks & LGVs','Motorcycles'] },
  { key:'machinery',  name:'Machinery',  items:['Farm Equipment','Construction','Generators','Industrial'] },
  { key:'classifieds',name:'Classifieds',items:['Mobile Phones','Electronics','Furniture & Home','Clothing'] },
  { key:'jobs',       name:'Jobs',       items:['Accounting & Finance','Engineering','IT & Technology','Healthcare'] },
]

const SUBCATS: Record<string,string[]> = {
Discover: ['Tourist Attraction','National Park','Festival & Cultural Event','Concert & Entertainment','Food & Dining Experience','Museum & Heritage','Tour Package','Sports Event'],
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
  neighbourhood:string; category:string; subcategory:string; created_at:string; user_id:string; verified?:boolean
}

const FeaturedCard = ({l, locale}: {l:any, locale:string}) => {
  const imgs = l.image_urls?.length ? l.image_urls : IMGS[l.category]||[]
  const img = imgs[0]||''
  return (
    <a href={`/${locale}/listing/${l.id}`} style={{textDecoration:'none',display:'block',marginBottom:'10px'}}>
      <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #F3F4F6',overflow:'hidden',animation:'featuredshimmer 3s ease-in-out infinite',position:'relative'}}>
        <div style={{background:'linear-gradient(90deg,#B8860B,#DAA520,#B8860B)',height:'3px'}}/>
        <div style={{position:'absolute',top:'10px',right:'10px',background:'linear-gradient(135deg,#B8860B,#DAA520)',color:'white',fontSize:'9px',fontWeight:800,letterSpacing:'1px',padding:'2px 7px',borderRadius:'5px'}}>⭐ FEATURED</div>
        <div style={{height:'120px',background:'#F9FAFB',overflow:'hidden'}}>
          {img && <img src={img} alt={l.title} loading="lazy" decoding="async" style={{width:'100%',height:'100%',objectFit:'cover'}}/>}
        </div>
        <div style={{padding:'10px 12px'}}>
          <div style={{fontSize:'10px',color:'#9CA3AF',marginBottom:'3px'}}>{l.subcategory||l.category} · {l.city}</div>
          <div style={{fontSize:'13px',fontWeight:700,color:'#111',marginBottom:'5px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:'14px',fontWeight:800,color:'#111'}}>{l.price_label}</span>
            <span style={{fontSize:'11px',color:'#2563EB',fontWeight:600}}>View →</span>
          </div>
        </div>
      </div>
    </a>
  )
}

const BoostCTA = ({locale}: {locale:string}) => (
  <a href={`/${locale}/boost`} style={{textDecoration:'none',display:'block',marginBottom:'10px'}}>
    <div style={{background:'#fff',borderRadius:'14px',border:'1.5px dashed #E5E7EB',padding:'16px',textAlign:'center'}}>
      <div style={{fontSize:'18px',marginBottom:'6px'}}>⭐</div>
      <div style={{fontSize:'12px',fontWeight:700,color:'#111',marginBottom:'4px'}}>Boost your listing</div>
      <div style={{fontSize:'11px',color:'#6B7280',lineHeight:1.5,marginBottom:'10px'}}>Get 10× more views. Featured from $2/week.</div>
      <div style={{background:'#111',color:'white',fontSize:'11px',fontWeight:700,padding:'7px 14px',borderRadius:'8px',display:'inline-block'}}>Learn more →</div>
    </div>
  </a>
)

const PartnerBanner = ({bg,name,sub,cta,tag,accent='rgba(255,255,255,0.22)'}:{bg:string,name:string,sub:string,cta:string,tag:string,accent?:string}) => (
  <div style={{margin:'4px 0 28px'}}>
    <div style={{fontSize:'9px',color:'#9CA3AF',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'7px',fontWeight:600}}>Sponsored · {tag}</div>
    <div className="partner-banner" style={{
      position:'relative',width:'100%',borderRadius:'18px',overflow:'hidden',background:bg,
      boxShadow:'0 4px 24px rgba(0,0,0,0.14)',display:'flex',alignItems:'center',
      justifyContent:'space-between',gap:'20px',padding:'30px 34px',minHeight:'150px',
      cursor:'pointer',
    }}>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'55%',background:'linear-gradient(to top, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 100%)',pointerEvents:'none'}}/>
      <div style={{position:'relative',zIndex:1,maxWidth:'72%'}}>
        <div style={{fontSize:'25px',fontWeight:900,color:'#fff',marginBottom:'8px',textShadow:'0 1px 6px rgba(0,0,0,0.35)',lineHeight:1.1}}>{name}</div>
        <div style={{fontSize:'14px',color:'rgba(255,255,255,0.92)',lineHeight:1.5}}>{sub}</div>
      </div>
      <button className="partner-cta" style={{position:'relative',zIndex:1,flexShrink:0,background:accent,color:'#fff',fontSize:'14px',fontWeight:800,padding:'13px 26px',borderRadius:'26px',border:'1px solid rgba(255,255,255,0.4)',cursor:'pointer',whiteSpace:'nowrap',letterSpacing:'0.3px'}}>{cta} →</button>
    </div>
  </div>
)

// In-feed partner banners: one solo full-width placement per partner, interleaved
// between the All-view category sections. Airlines→after Properties, CBE→after
// Vehicles, Telebirr→after Machinery. Every scroller passes all three.
const AD_BANNERS: Record<string, React.ReactNode> = {
  properties: <PartnerBanner bg="linear-gradient(120deg,#006400 0%,#004d00 55%,#003300 100%)" name="Ethiopian Airlines" sub="Fly to 130+ destinations worldwide. Africa's largest airline." cta="Book Now" tag="Premium Partner" accent="rgba(255,255,255,0.22)"/>,
  vehicles:   <PartnerBanner bg="linear-gradient(120deg,#003087 0%,#001f5e 100%)" name="CBE Home Loans" sub="Finance your dream. Up to ETB 5,000,000 at the lowest rates." cta="Apply Now" tag="Financial Partner" accent="rgba(255,255,255,0.18)"/>,
  machinery:  <PartnerBanner bg="linear-gradient(120deg,#CC3700 0%,#FF6B00 100%)" name="Telebirr" sub="Send money, pay bills and shop across Ethiopia instantly." cta="Get the App" tag="Payment Partner" accent="rgba(255,255,255,0.2)"/>,
}

const filterLabel:React.CSSProperties = {fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:'#6B7280',marginBottom:'8px',display:'block'}
const filterSelect:React.CSSProperties = {width:'100%',padding:'8px 10px',border:'1.5px solid #E5E7EB',borderRadius:'8px',fontSize:'13px',color:'#111',background:'#fff',fontFamily:'inherit',outline:'none',cursor:'pointer'}
const filterInput:React.CSSProperties = {width:'100%',padding:'8px 10px',border:'1.5px solid #E5E7EB',borderRadius:'8px',fontSize:'13px',color:'#111',fontFamily:'inherit',outline:'none'}

const HERO_MAKES = ['Toyota','Suzuki','Hyundai','Kia','Nissan','Mitsubishi','Volkswagen','Ford','Honda','Mercedes-Benz','BMW','Lexus','Tesla','Isuzu','Mahindra','Other']
const HERO_FIELDS = ['Accounting & Finance','Engineering','IT & Technology','Healthcare','Education','Sales & Marketing','Administration','Hospitality']
const HERO_PURPOSE = ['For Sale','For Rent']
const HERO_FUEL = ['Petrol','Diesel','Hybrid','Electric','Plug-in Hybrid']
const HERO_TRANSMISSION = ['Automatic','Manual']
const HERO_CONDITION = ['New','Used','Refurbished','For Parts']
const HERO_EMPLOYMENT = ['Full-time','Part-time','Contract','Internship','Temporary']
const HERO_YEARS = (()=>{const y=new Date().getFullYear();const a=[];for(let v=y;v>=y-25;v--)a.push(String(v));return a})()
const heroLbl:React.CSSProperties = {fontSize:'10px',fontWeight:700,letterSpacing:'0.4px',textTransform:'uppercase',color:'#9CA3AF',marginBottom:'4px',display:'block'}
const heroField:React.CSSProperties = {width:'100%',height:'44px',padding:'0 12px',border:'1.5px solid #E5E7EB',borderRadius:'10px',fontSize:'14px',outline:'none',fontFamily:'inherit',background:'#fff',color:'#111'}


const DiscoverCard = ({l, locale}: {l: any, locale: string}) => {
const isUpcoming = l.event_date && new Date(l.event_date) >= new Date()
const isPast = l.event_date && new Date(l.event_date) < new Date()
const dateObj = l.event_date ? new Date(l.event_date) : null
const day = dateObj ? dateObj.getDate() : null
const month = dateObj ? dateObj.toLocaleString('en-ET',{month:'short'}) : null
return (
<div onClick={()=>window.location.href=`/${locale}/listing/${l.id}`}
style={{background:'#fff',borderRadius:'14px',overflow:'hidden',border:'1px solid #F3F4F6',cursor:'pointer',display:'flex',gap:'0',minHeight:'100px',transition:'box-shadow .15s'}}>
{dateObj && (
<div style={{width:'72px',minWidth:'72px',background:isUpcoming?'#0f3460':'#F3F4F6',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'12px 8px'}}>
<div style={{fontSize:'22px',fontWeight:900,color:isUpcoming?'white':'#6B7280',lineHeight:1}}>{day}</div>
<div style={{fontSize:'11px',fontWeight:700,color:isUpcoming?'rgba(255,255,255,0.8)':'#9CA3AF',textTransform:'uppercase',letterSpacing:'1px'}}>{month}</div>
</div>
)}
<div style={{flex:1,padding:'12px 14px',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
<div>
<div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'4px',flexWrap:'wrap'}}>
<span style={{fontSize:'10px',fontWeight:700,background:isUpcoming?'#ECFDF5':isPast?'#F3F4F6':'#EFF6FF',color:isUpcoming?'#059669':isPast?'#9CA3AF':'#2563EB',padding:'2px 8px',borderRadius:'10px',letterSpacing:'0.5px'}}>
{isUpcoming?'Upcoming':isPast?'Past':l.subcategory}
</span>
{l.subcategory && <span style={{fontSize:'10px',color:'#9CA3AF'}}>{l.subcategory}</span>}
</div>
<div style={{fontSize:'13px',fontWeight:700,color:'#111',marginBottom:'3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
<div style={{fontSize:'11px',color:'#6B7280'}}>{l.city}{l.event_time?' · '+l.event_time:''}</div>
</div>
<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'8px'}}>
<span style={{fontSize:'12px',fontWeight:700,color:'#111'}}>{l.price_label}</span>
{l.admission_fee && <span style={{fontSize:'10px',background:'#FFFBEB',color:'#92400E',padding:'2px 7px',borderRadius:'10px',fontWeight:600}}>{l.admission_fee}</span>}
</div>
</div>
</div>
)
}

export default function Home() {
  const t = useTranslations()
  const locale = useLocale()
  const [activeCat, setActiveCat] = useState('All')
  const [search, setSearch] = useState('')
  const [aiOpen, setAiOpen] = useState(false)
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<any>(null)
const [featuredListings, setFeaturedListings] = useState<any[]>([])

  const [filterCity, setFilterCity] = useState('')
  const [filterSubcat, setFilterSubcat] = useState('')
  const [filterMinPrice, setFilterMinPrice] = useState('')
  const [filterMaxPrice, setFilterMaxPrice] = useState('')
  const [filterSort, setFilterSort] = useState('newest')
  const [filterPurpose, setFilterPurpose] = useState('')
  const [filterBeds, setFilterBeds] = useState('')
  const [filterBaths, setFilterBaths] = useState('')
  const [filterFurnished, setFilterFurnished] = useState('')
  const [filterMake, setFilterMake] = useState('')
  const [filterFuel, setFilterFuel] = useState('')
  const [filterTransmission, setFilterTransmission] = useState('')
  const [filterMinYear, setFilterMinYear] = useState('')
  const [filterCondition, setFilterCondition] = useState('')
  const [filterEmployment, setFilterEmployment] = useState('')
  const [filterField, setFilterField] = useState('')

  const TABS = [
    { key:'all',        name:'All' },
    { key:'properties', name:'Properties' },
    { key:'vehicles',   name:'Vehicles' },
    { key:'machinery',  name:'Machinery' },
    { key:'classifieds',name:'Classifieds' },
    { key:'jobs',       name:'Jobs' },
    { key:'discover',   name:'Discover', label:'Discover Ethiopia' },
  ]

  useEffect(()=>{
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => e.target.classList.toggle('cat-row-off', !e.isIntersecting))
    }, {rootMargin: '100px'})
    const watch = () => document.querySelectorAll('.cat-row').forEach(r => obs.observe(r))
    watch()
    const mo = new MutationObserver(watch)
    mo.observe(document.body, {childList: true, subtree: true})
    return () => { obs.disconnect(); mo.disconnect() }
  }, [])

  useEffect(()=>{
    fetchListings()
    const supabase = createClient()
    supabase.auth.getUser().then(({data})=>{
      setUser(data.user)
      if(data.user) loadSaved(data.user.id)
    })
  },[activeCat])

  useEffect(()=>{
    setFilterCity('')
    setFilterSubcat('')
    setFilterMinPrice('')
    setFilterMaxPrice('')
    setFilterSort('newest')
    setFilterPurpose('')
    setFilterBeds('')
    setFilterBaths('')
    setFilterFurnished('')
    setFilterMake('')
    setFilterFuel('')
    setFilterTransmission('')
    setFilterMinYear('')
    setFilterCondition('')
    setFilterEmployment('')
    setFilterField('')
  },[activeCat])

  async function loadSaved(userId: string) {
    const supabase = createClient()
    const {data} = await supabase.from('saved_listings').select('listing_id').eq('user_id',userId)
    if(data) setSaved(new Set(data.map((r:any)=>r.listing_id)))
  }

  async function fetchProfile(userId: string) {
    const supabase = createClient()
    const {data} = await supabase.from('profiles').select('verified').eq('id', userId).single()
    return data?.verified || false
  }

  async function fetchFeatured() {
const supabase = createClient()
const {data} = await supabase.from('listings').select('*').eq('status','active').eq('is_featured',true).gte('boost_expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(6)
setFeaturedListings(data||[])
}

async function fetchListings() {
    setLoading(true)
    const supabase = createClient()
    let q = supabase.from('listings').select('*').eq('status','active').order('created_at',{ascending:false})
    if (activeCat==='Discover') q = q.eq('category','Discover Ethiopia')
else if (activeCat!=='All') q = q.eq('category',activeCat)
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
    setFilterPurpose('')
    setFilterBeds('')
    setFilterBaths('')
    setFilterFurnished('')
    setFilterMake('')
    setFilterFuel('')
    setFilterTransmission('')
    setFilterMinYear('')
    setFilterCondition('')
    setFilterEmployment('')
    setFilterField('')
    setSearch('')
  }

  const hasActiveFilters = filterCity || filterSubcat || filterMinPrice || filterMaxPrice || filterPurpose || filterBeds || filterBaths || filterFurnished || filterMake || filterFuel || filterTransmission || filterMinYear || filterCondition || filterEmployment || filterField || search

  let filtered = listings.filter(l => {
    if (search && !l.title?.toLowerCase().includes(search.toLowerCase())) return false
    if (filterCity && l.city !== filterCity) return false
    if (filterSubcat && l.subcategory !== filterSubcat) return false
    if (filterMinPrice && Number(l.price_label?.replace(/[^0-9]/g,'')) < Number(filterMinPrice)) return false
    if (filterMaxPrice && Number(l.price_label?.replace(/[^0-9]/g,'')) > Number(filterMaxPrice)) return false
    if (filterPurpose && !(l.subcategory||'').toLowerCase().includes(filterPurpose.toLowerCase())) return false
    if (filterBeds && String((l as any).bedrooms||'') !== filterBeds) return false
    if (filterBaths && String((l as any).bathrooms||'') !== filterBaths) return false
    if (filterFurnished && String((l as any).furnished||'') !== filterFurnished) return false
    if (filterMake && (l as any).make !== filterMake) return false
    if (filterFuel && (l as any).fuel_type !== filterFuel) return false
    if (filterTransmission && (l as any).transmission !== filterTransmission) return false
    if (filterMinYear && Number((l as any).year||0) < Number(filterMinYear)) return false
    if (filterCondition && (l as any).condition !== filterCondition) return false
    if (filterEmployment && (l as any).employment_type !== filterEmployment) return false
    if (filterField && l.subcategory !== filterField) return false
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
        <div style={{position:'relative',height:'180px',background:'#F9FAFB'}}>
          {img && <img src={img} alt={l.title} loading="lazy" decoding="async" style={{width:'100%',height:'100%',objectFit:'cover'}}/>}
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
          {l.verified && (
            <div style={{position:'absolute',bottom:'8px',right:'8px',background:'#059669',color:'white',fontSize:'9px',fontWeight:700,padding:'2px 7px',borderRadius:'5px',display:'flex',alignItems:'center',gap:'3px'}}>
              ✓ Verified
            </div>
          )}
        </div>
        <div style={{padding:'10px 12px 12px'}}>
          <div style={{fontSize:'13px',fontWeight:600,color:'#111',marginBottom:'3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
          <div style={{fontSize:'11px',color:'#6B7280',marginBottom:'8px'}}>{l.neighbourhood}, {l.city}</div>
          {(() => {
            const beds=(l as any).bedrooms, baths=(l as any).bathrooms, area=(l as any).area_sqm
            if(!beds && !baths && !area) return null
            return (
              <div style={{display:'flex',alignItems:'center',gap:'12px',fontSize:'11px',color:'#6B7280',borderTop:'1px solid #F3F4F6',paddingTop:'8px',marginBottom:'8px'}}>
                {beds ? <span style={{display:'flex',alignItems:'center',gap:'4px'}}>🛏 {beds}</span> : null}
                {baths ? <span style={{display:'flex',alignItems:'center',gap:'4px'}}>🛁 {baths}</span> : null}
                {area ? <span style={{display:'flex',alignItems:'center',gap:'4px'}}>⛶ {area}m²</span> : null}
              </div>
            )
          })()}
          {(() => {
            const phone=(l as any).contact_phone || (l as any).phone
            if(!phone) return null
            return (
              <a href={`tel:${phone}`} onClick={(e)=>e.stopPropagation()}
                style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',width:'100%',background:'#2563EB',color:'#fff',fontSize:'12px',fontWeight:700,padding:'8px',borderRadius:'8px',textDecoration:'none',fontFamily:'inherit'}}>
                📞 Call
              </a>
            )
          })()}
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
      <div>
        <label style={filterLabel}>Sort by</label>
        <select value={filterSort} onChange={e=>setFilterSort(e.target.value)} style={filterSelect}>
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
      <div>
        <label style={filterLabel}>City</label>
        <select value={filterCity} onChange={e=>setFilterCity(e.target.value)} style={filterSelect}>
          <option value="">All cities</option>
          {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {SUBCATS[activeCat] && (
        <div>
          <label style={filterLabel}>Type</label>
          <select value={filterSubcat} onChange={e=>setFilterSubcat(e.target.value)} style={filterSelect}>
            <option value="">All types</option>
            {SUBCATS[activeCat].map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
      <div>
        <label style={filterLabel}>Price (ETB)</label>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <input type="text" inputMode="numeric" placeholder="Min" value={filterMinPrice} onChange={e=>setFilterMinPrice(e.target.value.replace(/[^0-9]/g,''))} style={{...filterInput,width:'50%'}} />
          <span style={{color:'#9CA3AF',fontSize:'12px'}}>—</span>
          <input type="text" inputMode="numeric" placeholder="Max" value={filterMaxPrice} onChange={e=>setFilterMaxPrice(e.target.value.replace(/[^0-9]/g,''))} style={{...filterInput,width:'50%'}} />
        </div>
      </div>
      {hasActiveFilters && (
        <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
          {filterCity && <span style={{fontSize:'11px',background:'#EFF6FF',color:'#2563EB',padding:'3px 8px',borderRadius:'20px',fontWeight:500}}>{filterCity} ×</span>}
          {filterSubcat && <span style={{fontSize:'11px',background:'#EFF6FF',color:'#2563EB',padding:'3px 8px',borderRadius:'20px',fontWeight:500}}>{filterSubcat} ×</span>}
          {(filterMinPrice||filterMaxPrice) && <span style={{fontSize:'11px',background:'#EFF6FF',color:'#2563EB',padding:'3px 8px',borderRadius:'20px',fontWeight:500}}>ETB {filterMinPrice||'0'} – {filterMaxPrice||'∞'} ×</span>}
        </div>
      )}
    </div>
  )


  const askAI = async (text: string) => {
    const t = (text || '').trim()
    if (!t || aiLoading) return
    setAiOpen(true)
    setAiMessages(prev => [...prev, { role: 'user', content: t }])
    setAiLoading(true)
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: t }) })
      const data = await res.json()
      setAiMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, I could not respond.' }])
    } catch {
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    }
    setAiLoading(false)
  }

  return (
    <main style={{minHeight:'100vh',background:'#F9FAFB',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <style>{`
        @keyframes adpulse { 0%,100%{opacity:1} 50%{opacity:.94} }
@keyframes featuredshimmer { 0%,100%{box-shadow:0 0 0 rgba(218,165,32,0)} 50%{box-shadow:0 4px 20px rgba(218,165,32,0.15)} }
        *{box-sizing:border-box;margin:0;padding:0}
        select:focus,input:focus{border-color:#2563EB!important}
        .hero-tabs::-webkit-scrollbar{display:none}
        .cat-row::-webkit-scrollbar{display:none}
        @keyframes catmarquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .cat-track-anim{animation:catmarquee 40s linear infinite}
        .cat-row-off .cat-track-anim{animation-play-state:paused}
        .cat-row:hover .cat-track-anim{animation-play-state:paused}

        @media (max-width: 768px) {
          .nav-inner { padding: 0 12px !important; gap: 8px !important; height: 52px !important; }
          .nav-search, .nav-searchbtn, .nav-lang, .nav-ai-pill { display: none !important; }
          .hero-section { min-height: 0 !important; background: #E8EAED !important; }
          .hero-section img { top: 0 !important; bottom: auto !important; height: auto !important; aspect-ratio: 3/2 !important; }
          .hero-section > div:first-of-type { bottom: auto !important; height: auto !important; aspect-ratio: 3/2 !important; background: linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.3) 100%) !important; }
          .hero-tabs { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; background: rgba(0,0,0,0.35) !important; }
          .hero-inner { padding: 30px 16px !important; }
          .hero-panel { width: 100% !important; padding: 14px !important; margin-top: calc(66.667vw - 147px) !important; }
          .hero-filtergrid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .hero-searchrow { grid-template-columns: 1fr !important; }
          .hero-searchrow > button { width: 100% !important; }
          #results { grid-template-columns: 1fr !important; padding: 16px 12px !important; gap: 16px !important; }
          .browse-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 14px !important; }
          .feat-band { padding-left: 12px !important; padding-right: 12px !important; }
          .partner-banner { flex-direction: column !important; align-items: flex-start !important; padding: 22px 20px !important; gap: 16px !important; min-height: 0 !important; }
          .partner-banner > div:first-of-type { max-width: 100% !important; }
          .partner-cta { width: 100% !important; text-align: center !important; padding: 14px 20px !important; }
        }
        @media (max-width: 460px) {
          .hero-filtergrid { grid-template-columns: 1fr !important; }
          .browse-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-section h1 { font-size: 26px !important; }
        }
      `}</style>

      <nav style={{position:'sticky',top:0,zIndex:100,background:'#fff',borderBottom:'1px solid #EBEBEB'}}>
        <div className="nav-inner" style={{maxWidth:'1280px',margin:'0 auto',padding:'0 20px',height:'56px',display:'flex',alignItems:'center',gap:'12px'}}>
          <a href={`/${locale}`} style={{textDecoration:'none',flexShrink:0}}>
            <div style={{fontSize:'15px',fontWeight:900,color:'#111',letterSpacing:'2px'}}>GOHBAY</div>
            <div style={{fontSize:'8px',color:'#9CA3AF',letterSpacing:'1.5px',marginTop:'1px'}}>ETHIOPIA'S #1 MARKETPLACE</div>
          </a>
          <button className="nav-ai-pill" onClick={() => { if (search.trim()) askAI(search); else setAiOpen(o => !o) }} style={{ display:'inline-flex', alignItems:'center', gap:'6px', height:'38px', padding:'0 12px', borderRadius:'8px', background:'#fff', border:'1.5px solid #C7C4F5', color:'#4F46E5', fontSize:'12px', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit', flexShrink:0 }}>
            <span style={{ fontSize:'15px', lineHeight:0 }}>✦</span> AI Assistant
          </button>
          <div className="nav-search" style={{flex:1,maxWidth:'480px',position:'relative'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder={t('nav.search')}
              style={{width:'100%',padding:'9px 14px 9px 38px',border:'1.5px solid #E5E7EB',borderRadius:'10px',fontSize:'13px',outline:'none',fontFamily:'inherit'}}/>
            <span style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'#9CA3AF',fontSize:'14px'}}>⌕</span>
          
            {aiOpen && (
              <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'#fff', border:'1px solid #C7C4F5', borderRadius:'12px', boxShadow:'0 10px 32px rgba(0,0,0,0.14)', zIndex:9999, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderBottom:'1px solid #eee', background:'#F7F7FB' }}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'7px', fontSize:'13px', fontWeight:600, color:'#111' }}><span style={{ color:'#4F46E5', fontSize:'15px' }}>✦</span> Gohbay AI</span>
                  <span onClick={() => setAiOpen(false)} style={{ cursor:'pointer', color:'#999', fontSize:'18px', lineHeight:1 }}>×</span>
                </div>
                <div style={{ overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:'10px', minHeight:'90px', maxHeight:'360px' }}>
                  {aiMessages.length === 0 && (<div style={{ textAlign:'center', color:'#9CA3AF', fontSize:'13px', padding:'20px 0' }}>Type in the search box, then tap AI Assistant…</div>)}
                  {aiMessages.map((m, i) => (
                    <div key={i} style={{ display:'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      {m.role === 'user'
                        ? <div style={{ maxWidth:'82%', padding:'9px 13px', borderRadius:'16px 16px 4px 16px', background:'#2563EB', color:'#fff', fontSize:'13px', lineHeight:1.5 }}>{m.content}</div>
                        : <div style={{ maxWidth:'90%', padding:'10px 13px', borderRadius:'16px 16px 16px 4px', background:'#F0F2F5', color:'#111', fontSize:'13px', lineHeight:1.55 }} dangerouslySetInnerHTML={{ __html: renderAiMarkdown(m.content) }} />}
                    </div>
                  ))}
                  {aiLoading && (<div style={{ display:'flex', justifyContent:'flex-start' }}><div style={{ padding:'10px 14px', borderRadius:'16px 16px 16px 4px', background:'#F0F2F5', color:'#999', fontSize:'13px' }}>typing…</div></div>)}
                </div>
                <div style={{ display:'flex', gap:'8px', padding:'12px 14px', borderTop:'1px solid #eee', background:'#F7F7FB' }}>
                  <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { askAI(aiInput); setAiInput('') } }} placeholder="Ask a follow-up…" style={{ flex:1, height:'38px', border:'1.5px solid #e5e7eb', borderRadius:'20px', padding:'0 14px', fontSize:'13px', outline:'none', fontFamily:'inherit' }} />
                  <button onClick={() => { askAI(aiInput); setAiInput('') }} disabled={aiLoading} style={{ width:'38px', height:'38px', borderRadius:'50%', background:'#4F46E5', border:'none', color:'#fff', cursor:'pointer', fontSize:'16px', flexShrink:0 }}>↑</button>
                </div>
              </div>
            )}
            </div>
          <button className="nav-searchbtn" style={{padding:'6px 12px',background:'#2563EB',color:'white',border:'none',borderRadius:'8px',fontSize:'12px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',flexShrink:0}}>
            {t('nav.searchBtn')}
          </button>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'10px',flexShrink:0}}>
            <AuthButton/>
            <a href={`/${locale}/post`} style={{fontSize:'13px',fontWeight:600,padding:'9px 18px',background:'#111',color:'white',borderRadius:'8px',textDecoration:'none',border:'none',whiteSpace:'nowrap'}}>
              {t('nav.post')}
            </a>
            <span className="nav-lang"><LanguageSwitcher/></span>
          </div>
        </div>
      </nav>

      <section className="hero-section" style={{position:'relative',width:'100%',minHeight:'340px',background:'#1f2933',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.32) 40%,rgba(0,0,0,0.04) 64%,rgba(0,0,0,0) 100%)'}}/>
        <div className="hero-inner" style={{position:'relative',maxWidth:'1280px',margin:'0 auto',width:'100%',padding:'56px 20px'}}>
        <div style={{maxWidth:'600px',marginRight:'auto',display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
          <div style={{textAlign:'left',marginBottom:'22px'}}>
            <h1 style={{fontSize:'32px',fontWeight:900,color:'#fff',textShadow:'0 2px 14px rgba(0,0,0,0.6)',letterSpacing:'-0.5px',margin:0}}>Find anything in Ethiopia</h1>
            <p style={{fontSize:'14px',color:'rgba(255,255,255,0.95)',marginTop:'6px',textShadow:'0 1px 8px rgba(0,0,0,0.6)'}}>Properties · Vehicles · Machinery · Jobs · and more</p>
          </div>
          <div className="hero-tabs" style={{display:'flex',gap:'3px',background:'rgba(255,255,255,0.14)',backdropFilter:'blur(6px)',padding:'4px',borderRadius:'12px',marginBottom:'14px',flexWrap:'nowrap',justifyContent:'flex-start',maxWidth:'100%',overflowX:'auto',WebkitOverflowScrolling:'touch',scrollbarWidth:'none',msOverflowStyle:'none'}}>
            {TABS.map(tab=>{
              const on = activeCat===tab.name
              return (
                <button key={tab.key} onClick={()=>setActiveCat(tab.name)} className="hero-tab"
                  style={{fontSize:'12px',fontWeight:on?700:600,color:on?'#111':'#fff',background:on?'#fff':'transparent',
                    padding:'8px 11px',borderRadius:'9px',border:'none',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',flexShrink:0,transition:'all .15s'}}>
                  {(tab as any).label || tab.name}
                </button>
              )
            })}
          </div>
          <div className="hero-panel" style={{width:'560px',maxWidth:'100%',background:'#fff',borderRadius:'16px',padding:'16px',boxShadow:'0 12px 40px rgba(0,0,0,0.25)'}}>
            <div className="hero-filtergrid" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px',marginBottom:'10px'}}>
              {activeCat==='All' && <>
                <div><label style={heroLbl}>Category</label>
                  <select value={filterSubcat} onChange={e=>setFilterSubcat(e.target.value)} style={heroField}>
                    <option value="">All categories</option>{['Properties','Vehicles','Machinery','Classifieds','Jobs'].map(o=><option key={o} value={o}>{o}</option>)}
                  </select></div>
                <div><label style={heroLbl}>Min price</label>
                  <input inputMode="numeric" placeholder="ETB" value={filterMinPrice} onChange={e=>setFilterMinPrice(e.target.value.replace(/[^0-9]/g,''))} style={heroField}/></div>
                <div><label style={heroLbl}>Max price</label>
                  <input inputMode="numeric" placeholder="ETB" value={filterMaxPrice} onChange={e=>setFilterMaxPrice(e.target.value.replace(/[^0-9]/g,''))} style={heroField}/></div>
              </>}
              {activeCat==='Properties' && <>
                <div><label style={heroLbl}>Purpose</label>
                  <select value={filterPurpose} onChange={e=>setFilterPurpose(e.target.value)} style={heroField}>
                    <option value="">Any</option>{HERO_PURPOSE.map(o=><option key={o} value={o}>{o}</option>)}
                  </select></div>
                <div><label style={heroLbl}>Type</label>
                  <select value={filterSubcat} onChange={e=>setFilterSubcat(e.target.value)} style={heroField}>
                    <option value="">All types</option>{(SUBCATS['Properties']||[]).map(o=><option key={o} value={o}>{o}</option>)}
                  </select></div>
                <div><label style={heroLbl}>Furnishing</label>
                  <select value={filterFurnished} onChange={e=>setFilterFurnished(e.target.value)} style={heroField}>
                    <option value="">Any</option><option value="Furnished">Furnished</option><option value="Unfurnished">Unfurnished</option>
                  </select></div>
                <div><label style={heroLbl}>Bedrooms</label>
                  <select value={filterBeds} onChange={e=>setFilterBeds(e.target.value)} style={heroField}>
                    <option value="">Any</option>{['1','2','3','4','5'].map(o=><option key={o} value={o}>{o}+</option>)}
                  </select></div>
                <div><label style={heroLbl}>Bathrooms</label>
                  <select value={filterBaths} onChange={e=>setFilterBaths(e.target.value)} style={heroField}>
                    <option value="">Any</option>{['1','2','3','4'].map(o=><option key={o} value={o}>{o}+</option>)}
                  </select></div>
                <div><label style={heroLbl}>Min price</label>
                  <input inputMode="numeric" placeholder="ETB" value={filterMinPrice} onChange={e=>setFilterMinPrice(e.target.value.replace(/[^0-9]/g,''))} style={heroField}/></div>
                <div style={{gridColumn:'span 3'}}><label style={heroLbl}>Max price</label>
                  <input inputMode="numeric" placeholder="ETB" value={filterMaxPrice} onChange={e=>setFilterMaxPrice(e.target.value.replace(/[^0-9]/g,''))} style={heroField}/></div>
              </>}
              {activeCat==='Vehicles' && <>
                <div><label style={heroLbl}>Type</label>
                  <select value={filterSubcat} onChange={e=>setFilterSubcat(e.target.value)} style={heroField}>
                    <option value="">All types</option>{(SUBCATS['Vehicles']||[]).map(o=><option key={o} value={o}>{o}</option>)}
                  </select></div>
                <div><label style={heroLbl}>Make</label>
                  <select value={filterMake} onChange={e=>setFilterMake(e.target.value)} style={heroField}>
                    <option value="">All makes</option>{HERO_MAKES.map(o=><option key={o} value={o}>{o}</option>)}
                  </select></div>
                <div><label style={heroLbl}>Fuel</label>
                  <select value={filterFuel} onChange={e=>setFilterFuel(e.target.value)} style={heroField}>
                    <option value="">Any</option>{HERO_FUEL.map(o=><option key={o} value={o}>{o}</option>)}
                  </select></div>
                <div><label style={heroLbl}>Transmission</label>
                  <select value={filterTransmission} onChange={e=>setFilterTransmission(e.target.value)} style={heroField}>
                    <option value="">Any</option>{HERO_TRANSMISSION.map(o=><option key={o} value={o}>{o}</option>)}
                  </select></div>
                <div><label style={heroLbl}>Min year</label>
                  <select value={filterMinYear} onChange={e=>setFilterMinYear(e.target.value)} style={heroField}>
                    <option value="">Any</option>{HERO_YEARS.map(o=><option key={o} value={o}>{o}</option>)}
                  </select></div>
                <div><label style={heroLbl}>Min price</label>
                  <input inputMode="numeric" placeholder="ETB" value={filterMinPrice} onChange={e=>setFilterMinPrice(e.target.value.replace(/[^0-9]/g,''))} style={heroField}/></div>
                <div style={{gridColumn:'span 3'}}><label style={heroLbl}>Max price</label>
                  <input inputMode="numeric" placeholder="ETB" value={filterMaxPrice} onChange={e=>setFilterMaxPrice(e.target.value.replace(/[^0-9]/g,''))} style={heroField}/></div>
              </>}
              {activeCat==='Machinery' && <>
                <div><label style={heroLbl}>Type</label>
                  <select value={filterSubcat} onChange={e=>setFilterSubcat(e.target.value)} style={heroField}>
                    <option value="">All types</option>{(SUBCATS['Machinery']||[]).map(o=><option key={o} value={o}>{o}</option>)}
                  </select></div>
                <div><label style={heroLbl}>Condition</label>
                  <select value={filterCondition} onChange={e=>setFilterCondition(e.target.value)} style={heroField}>
                    <option value="">Any</option>{HERO_CONDITION.map(o=><option key={o} value={o}>{o}</option>)}
                  </select></div>
                <div><label style={heroLbl}>Min year</label>
                  <select value={filterMinYear} onChange={e=>setFilterMinYear(e.target.value)} style={heroField}>
                    <option value="">Any</option>{HERO_YEARS.map(o=><option key={o} value={o}>{o}</option>)}
                  </select></div>
                <div><label style={heroLbl}>Min price</label>
                  <input inputMode="numeric" placeholder="ETB" value={filterMinPrice} onChange={e=>setFilterMinPrice(e.target.value.replace(/[^0-9]/g,''))} style={heroField}/></div>
                <div style={{gridColumn:'span 2'}}><label style={heroLbl}>Max price</label>
                  <input inputMode="numeric" placeholder="ETB" value={filterMaxPrice} onChange={e=>setFilterMaxPrice(e.target.value.replace(/[^0-9]/g,''))} style={heroField}/></div>
              </>}
              {activeCat==='Classifieds' && <>
                <div><label style={heroLbl}>Type</label>
                  <select value={filterSubcat} onChange={e=>setFilterSubcat(e.target.value)} style={heroField}>
                    <option value="">All types</option>{(SUBCATS['Classifieds']||[]).map(o=><option key={o} value={o}>{o}</option>)}
                  </select></div>
                <div><label style={heroLbl}>Condition</label>
                  <select value={filterCondition} onChange={e=>setFilterCondition(e.target.value)} style={heroField}>
                    <option value="">Any</option>{HERO_CONDITION.map(o=><option key={o} value={o}>{o}</option>)}
                  </select></div>
                <div><label style={heroLbl}>Min price</label>
                  <input inputMode="numeric" placeholder="ETB" value={filterMinPrice} onChange={e=>setFilterMinPrice(e.target.value.replace(/[^0-9]/g,''))} style={heroField}/></div>
                <div style={{gridColumn:'span 3'}}><label style={heroLbl}>Max price</label>
                  <input inputMode="numeric" placeholder="ETB" value={filterMaxPrice} onChange={e=>setFilterMaxPrice(e.target.value.replace(/[^0-9]/g,''))} style={heroField}/></div>
              </>}
              {activeCat==='Jobs' && <>
                <div><label style={heroLbl}>Field</label>
                  <select value={filterField} onChange={e=>setFilterField(e.target.value)} style={heroField}>
                    <option value="">All fields</option>{HERO_FIELDS.map(o=><option key={o} value={o}>{o}</option>)}
                  </select></div>
                <div><label style={heroLbl}>Employment</label>
                  <select value={filterEmployment} onChange={e=>setFilterEmployment(e.target.value)} style={heroField}>
                    <option value="">Any</option>{HERO_EMPLOYMENT.map(o=><option key={o} value={o}>{o}</option>)}
                  </select></div>
                <div><label style={heroLbl}>Min salary</label>
                  <input inputMode="numeric" placeholder="ETB" value={filterMinPrice} onChange={e=>setFilterMinPrice(e.target.value.replace(/[^0-9]/g,''))} style={heroField}/></div>
              </>}
              {activeCat==='Discover' && <>
                <div style={{gridColumn:'span 3'}}><label style={heroLbl}>Type</label>
                  <select value={filterSubcat} onChange={e=>setFilterSubcat(e.target.value)} style={heroField}>
                    <option value="">All experiences</option>{(SUBCATS['Discover']||[]).map(o=><option key={o} value={o}>{o}</option>)}
                  </select></div>
              </>}
            </div>
            <div className="hero-searchrow" style={{display:'grid',gridTemplateColumns:'1fr 1.4fr auto',gap:'10px',alignItems:'end'}}>
              <div><label style={heroLbl}>City</label>
                <select value={filterCity} onChange={e=>setFilterCity(e.target.value)} style={heroField}>
                  <option value="">All cities</option>{CITIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select></div>
              <div><label style={heroLbl}>Keyword</label>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('nav.search')} style={heroField}/></div>
              <button onClick={()=>{const el=document.getElementById('results');if(el)el.scrollIntoView({behavior:'smooth'})}}
                style={{height:'30px',background:'#2563EB',color:'white',border:'none',borderRadius:'8px',padding:'0 14px',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>
                ⌕ {t('nav.searchBtn')}
              </button>
            </div>
          </div>
        </div>
        </div>
      </section>

      <div id="results" style={{maxWidth:'1280px',margin:'0 auto',padding:'24px 20px',display:'grid',gridTemplateColumns: activeCat==='All' ? '1fr' : '200px 1fr',gap:'24px',alignItems:'start',scrollMarginTop:'70px'}}>
        {activeCat !== 'All' && <FilterPanel/>}
        <div style={{minWidth:0}}>
          {activeCat==='All' && (
            <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #F3F4F6',padding:'20px 24px',marginBottom:'24px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <h2 style={{fontSize:'15px',fontWeight:700,color:'#111'}}>{t('home.browse')}</h2>
                <span style={{fontSize:'12px',color:'#6B7280',cursor:'pointer'}}>{t('home.seeAll')}</span>
              </div>
              <div className="browse-grid" style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'16px'}}>
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
          {activeCat !== 'All' && (
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
              <div>
                <h2 style={{fontSize:'15px',fontWeight:700,color:'#111',margin:0,display:'inline'}}>{(TABS.find(x=>x.name===activeCat) as any)?.label || activeCat}</h2>
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
              const banner=AD_BANNERS[cat.key]
              if(items.length===0 && !banner) return null
              return (
                <div key={cat.key}>
                  {items.length>0 && (
                    <div style={{marginBottom:'24px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                        <h2 style={{fontSize:'15px',fontWeight:700,color:'#111',margin:0}}>
                          Popular in {t('cats.' + cat.key)}
                        </h2>
                        <span onClick={()=>setActiveCat(cat.name)} style={{fontSize:'12px',color:'#6B7280',cursor:'pointer'}}>{t('home.seeAll')}</span>
                      </div>
                      <div className="cat-row" style={{overflowX:'auto',maxWidth:'100%',scrollbarWidth:'none',msOverflowStyle:'none'}}>
                        {(()=>{const row=items.slice(0,10); const animate=row.length>3; const loop=animate?[...row,...row]:row; return (
                          <div className={animate?'cat-track cat-track-anim':'cat-track'} style={{display:'flex',gap:'12px',width:'max-content'}}>
                            {loop.map((l,i)=><div key={l.id+'-'+i} style={{width:'240px',flexShrink:0}}><Card l={l}/></div>)}
                          </div>
                        )})()}
                      </div>
                    </div>
                  )}
                  {banner}
                </div>
              )
            })
          ) : activeCat==='Discover' ? (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'12px'}}>
              {filtered.map(l=><DiscoverCard key={l.id} l={l} locale={locale}/>)}
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'12px'}}>
              {filtered.map(l=><Card key={l.id} l={l}/>)}
            </div>
          )}
        </div>
      </div>
      <div className="feat-band" style={{maxWidth:'1280px',margin:'0 auto',padding:'0 20px 8px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'14px',alignItems:'start'}}>
          {featuredListings.length > 0 && (
            <div>
              <div style={{fontSize:'8px',color:'#9CA3AF',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'8px',fontWeight:600}}>Featured listings</div>
              {featuredListings.slice(0,2).map(l=><FeaturedCard key={l.id} l={l} locale={locale}/>)}
            </div>
          )}
          <BoostCTA locale={locale}/>
      </div>

      <footer style={{background:'#fff',borderTop:'1px solid #EBEBEB',padding:'32px 20px 24px',marginTop:'16px'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto'}}>
          <div style={{fontSize:'15px',fontWeight:900,color:'#111',letterSpacing:'2px',marginBottom:'4px'}}>GOHBAY</div>
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
            <span style={{color:'#9CA3AF',fontSize:'12px'}}>© 2025 Gohbay · Jiksi Michael</span>
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
