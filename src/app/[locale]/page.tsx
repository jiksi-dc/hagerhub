'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import AuthButton from '@/components/AuthButton'
import AIAssistant from '@/components/AIAssistant'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const POPULAR = [
  { name:'Properties', items:['Residential for Rent','Residential for Sale','Commercial','Land & Plots'] },
  { name:'Vehicles', items:['Used Cars','New Cars','Trucks & LGVs','Motorcycles'] },
  { name:'Machinery', items:['Farm Equipment','Construction','Generators','Industrial'] },
  { name:'Classifieds', items:['Mobile Phones','Electronics','Furniture & Home','Clothing'] },
  { name:'Jobs', items:['Accounting & Finance','Engineering','IT & Technology','Healthcare'] },
]

const IMGS: Record<string,string[]> = {
  Properties:['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=85','https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=85'],
  Vehicles:['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=85','https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=85'],
  Machinery:['https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=600&q=85','https://images.unsplash.com/photo-1530685932526-48ec92998eaa?w=600&q=85'],
  Classifieds:['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=85','https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=85'],
  Jobs:['https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=85','https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=85'],
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
        <div><div style={{fontSize:'11px',fontWeight:500,color:'#111'}}>{name}</div></div>
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

export default function Home() {
  const [activeCat, setActiveCat] = useState('All')
  const [search, setSearch] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<any>(null)

  useEffect(()=>{
    fetchListings()
    const supabase = createClient()
    supabase.auth.getUser().then(({data})=>{
      setUser(data.user)
      if(data.user) loadSaved(data.user.id)
    })
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
    const {data} = await q.limit(40)
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

  const filtered = listings.filter(l=>search===''||l.title.toLowerCase().includes(search.toLowerCase()))
  const getImg = (cat:string,id:string) => { const a=IMGS[cat]||IMGS.Properties; return a[id.charCodeAt(0)%a.length] }
  const cats = ['All',...POPULAR.map(p=>p.name)]
  const badgeColor = (cat:string) => cat==='Properties'?'#2563EB':cat==='Vehicles'?'#DC2626':cat==='Jobs'?'#059669':'#7C3AED'

  const Card = ({l}:{l:Listing}) => (
    <div onClick={()=>window.location.href=`/listing/${l.id}`} style={{background:'#fff',borderRadius:'12px',overflow:'hidden',border:'1px solid #EBEBEB',cursor:'pointer'}}>
      <div style={{position:'relative',height:'160px',overflow:'hidden',background:'#F5F5F5'}}>
        <img src={l.image_urls&&l.image_urls.length>0?l.image_urls[0]:getImg(l.category,l.id)} alt={l.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',top:'8px',left:'8px',background:badgeColor(l.category),color:'white',fontSize:'10px',fontWeight:600,padding:'2px 8px',borderRadius:'3px'}}>{l.subcategory||l.category}</div>
        <button onClick={e=>toggleSave(l.id,e)} style={{position:'absolute',top:'8px',right:'8px',background:'rgba(255,255,255,0.92)',border:'none',borderRadius:'50%',width:'26px',height:'26px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'14px',color:saved.has(l.id)?'#EF4444':'#9CA3AF'}}>
          {saved.has(l.id)?'♥':'♡'}
        </button>
        <div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(to top,rgba(0,0,0,0.65),transparent)',padding:'24px 10px 8px',color:'white',fontSize:'13px',fontWeight:600}}>{l.price_label}</div>
      </div>
      <div style={{padding:'10px 12px'}}>
        <div style={{fontSize:'12px',fontWeight:500,color:'#111',marginBottom:'3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
        <div style={{fontSize:'11px',color:'#9CA3AF'}}>{l.neighbourhood?l.neighbourhood+', ':''}{l.city}</div>
      </div>
    </div>
  )

  return (
    <main style={{fontFamily:'system-ui,-apple-system,sans-serif',background:'#F7F7F7',minHeight:'100vh'}}>
      <style>{`@keyframes adpulse{0%,100%{opacity:1;border-color:#E5E7EB}50%{opacity:0.93;border-color:#D1D5DB}}`}</style>

      <header style={{background:'#fff',borderBottom:'1px solid #EBEBEB',position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'12px 20px',display:'flex',alignItems:'center',gap:'16px'}}>
          <div style={{flexShrink:0}}>
            <div style={{fontSize:'18px',fontWeight:900,color:'#111',letterSpacing:'2px',lineHeight:1}}>HAGERHUB</div>
            <div style={{fontSize:'8px',color:'#9CA3AF',letterSpacing:'2px',marginTop:'2px'}}>ETHIOPIA'S #1 MARKETPLACE</div>
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
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 20px',display:'flex',borderTop:'1px solid #F5F5F5',overflowX:'auto'}}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setActiveCat(c)} style={{padding:'10px 20px',border:'none',background:'none',fontSize:'13px',fontWeight:600,color:activeCat===c?'#111':'#6B7280',borderBottom:activeCat===c?'2.5px solid #111':'2.5px solid transparent',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit'}}>
              {c}
            </button>
          ))}
        </div>
      </header>

      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'20px',display:'grid',gridTemplateColumns:'1fr 260px',gap:'20px',alignItems:'start'}}>
        <div>
          {activeCat==='All' && (
            <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #EBEBEB',overflow:'hidden',marginBottom:'20px'}}>
              <div style={{padding:'12px 16px',borderBottom:'1px solid #F5F5F5',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:'14px',fontWeight:700,color:'#111'}}>Popular Categories</span>
                <span style={{fontSize:'12px',color:'#6B7280',cursor:'pointer'}}>See all →</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)'}}>
                {POPULAR.map((cat,i)=>(
                  <div key={cat.name} onClick={()=>setActiveCat(cat.name)} style={{padding:'14px 12px',borderRight:i<4?'1px solid #F5F5F5':'none',cursor:'pointer'}}>
                    <div style={{fontSize:'13px',fontWeight:700,color:'#111',marginBottom:'8px'}}>{cat.name}</div>
                    {cat.items.map(item=>(
                      <div key={item} style={{fontSize:'11px',color:'#6B7280',marginBottom:'4px',lineHeight:1.3}}>{item}</div>
                    ))}
                    <div style={{fontSize:'11px',color:'#2563EB',fontWeight:600,marginTop:'8px'}}>All in {cat.name} →</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div style={{textAlign:'center',padding:'60px',color:'#9CA3AF',background:'#fff',borderRadius:'12px'}}>Loading listings...</div>
          ) : filtered.length===0 ? (
            <div style={{textAlign:'center',padding:'60px',color:'#9CA3AF',background:'#fff',borderRadius:'12px'}}>No listings yet in this category</div>
          ) : activeCat==='All' ? (
            POPULAR.map(cat=>{
              const items=filtered.filter(l=>l.category===cat.name)
              if(items.length===0) return null
              return (
                <div key={cat.name} style={{marginBottom:'24px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                    <h2 style={{fontSize:'15px',fontWeight:700,color:'#111',margin:0}}>Popular in {cat.name}</h2>
                    <span onClick={()=>setActiveCat(cat.name)} style={{fontSize:'12px',color:'#6B7280',cursor:'pointer'}}>See all →</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'12px'}}>
                    {items.slice(0,4).map(l=><Card key={l.id} l={l}/>)}
                  </div>
                </div>
              )
            })
          ) : (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                <h2 style={{fontSize:'15px',fontWeight:700,color:'#111',margin:0}}>{activeCat}</h2>
                <button onClick={()=>setActiveCat('All')} style={{fontSize:'12px',color:'#6B7280',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>← Back</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'12px'}}>
                {filtered.map(l=><Card key={l.id} l={l}/>)}
              </div>
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
              <button style={{background:'#111',color:'white',fontSize:'11px',fontWeight:700,padding:'5px 14px',borderRadius:'7px',cursor:'pointer',border:'none',fontFamily:'inherit'}}>App Store</button>
              <button style={{background:'#374151',color:'white',fontSize:'11px',fontWeight:700,padding:'5px 14px',borderRadius:'7px',cursor:'pointer',border:'none',fontFamily:'inherit'}}>Google Play</button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
