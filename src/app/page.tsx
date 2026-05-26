'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const CATS = ['All', 'Properties', 'Vehicles', 'Machinery', 'Classifieds', 'Jobs']

const POPULAR = [
  { name: 'Properties', items: ['Residential for Rent', 'Residential for Sale', 'Commercial', 'Land & Plots', 'Holiday Homes', 'Off-plan / New'] },
  { name: 'Vehicles', items: ['Used Cars', 'New Cars', 'Trucks & LGVs', 'Motorcycles', 'Bajaj / Tuk-tuks', 'Car Rentals'] },
  { name: 'Machinery', items: ['Farm Equipment', 'Construction', 'Generators', 'Industrial Tools', 'Spare Parts', 'Irrigation'] },
  { name: 'Classifieds', items: ['Mobile Phones', 'Electronics', 'Furniture & Home', 'Clothing', 'Food & Agriculture', 'Kids & Baby'] },
  { name: 'Jobs', items: ['Accounting & Finance', 'Engineering', 'Healthcare', 'NGO & Charity', 'Government', 'Internships'] },
]

interface Listing {
  id: string
  title: string
  price_label: string
  city: string
  neighbourhood: string
  category: string
  subcategory: string
  created_at: string
}

export default function Home() {
  const [activeCat, setActiveCat] = useState('All')
  const [search, setSearch] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchListings() }, [activeCat])

  async function fetchListings() {
    setLoading(true)
    let query = supabase.from('listings').select('*').eq('status', 'active').order('created_at', { ascending: false })
    if (activeCat !== 'All') query = query.eq('category', activeCat)
    const { data, error } = await query.limit(20)
    if (error) console.error(error)
    else setListings(data || [])
    setLoading(false)
  }

  const filtered = listings.filter(l => search === '' || l.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <main style={{fontFamily:'Inter,sans-serif',background:'white',minHeight:'100vh'}}>

      <section style={{background:'#f9fafb',padding:'56px 32px 40px',textAlign:'center',borderBottom:'1px solid #eee'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'20px',marginBottom:'14px'}}>
          <span style={{fontSize:'72px',fontWeight:700,letterSpacing:'4px',color:'#111',lineHeight:1}}>HAGER</span>
          <img src="/lion.jpg" alt="HagerHub Lion"
            style={{width:'88px',height:'88px',borderRadius:'50%',objectFit:'cover',objectPosition:'center 15%',
              border:'2px solid #ddd',flexShrink:0}}/>
          <span style={{fontSize:'72px',fontWeight:700,letterSpacing:'4px',color:'#111',lineHeight:1}}>HUB</span>
        </div>
        <p style={{color:'#aaa',letterSpacing:'3px',fontSize:'11px',textTransform:'uppercase',marginBottom:'28px'}}>
          The Hub of the Homeland · ሃገር ሃብ · Ethiopia's #1 Marketplace
        </p>
        <div style={{maxWidth:'600px',margin:'0 auto 16px',display:'flex',background:'white',border:'1.5px solid #ddd',borderRadius:'12px',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
          <select style={{background:'#f8f8f8',color:'#555',border:'none',borderRight:'1px solid #eee',padding:'0 16px',fontSize:'13px',outline:'none'}}
            onChange={e => setActiveCat(e.target.value)}>
            {CATS.map(c => <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>)}
          </select>
          <input style={{flex:1,border:'none',padding:'14px 18px',fontSize:'14px',outline:'none'}}
            placeholder="What are you looking for?"
            value={search} onChange={e => setSearch(e.target.value)}/>
          <button onClick={fetchListings}
            style={{background:'#078754',border:'none',color:'white',padding:'14px 28px',fontSize:'13px',fontWeight:500,cursor:'pointer'}}>
            Search
          </button>
        </div>
        <div style={{display:'flex',justifyContent:'center',gap:'8px',flexWrap:'wrap'}}>
          {CATS.map(c => (
            <button key={c} onClick={() => setActiveCat(c)}
              style={{padding:'6px 18px',borderRadius:'20px',fontSize:'12px',fontWeight:500,cursor:'pointer',border:'1.5px solid',
                borderColor:activeCat===c?'#078754':'#ddd',
                background:activeCat===c?'#078754':'white',
                color:activeCat===c?'white':'#555',transition:'all .2s'}}>
              {c}
            </button>
          ))}
        </div>
      </section>

      <div style={{display:'flex',height:'3px'}}>
        <div style={{flex:1,background:'#078754'}}/>
        <div style={{flex:1,background:'#FCDD09'}}/>
        <div style={{flex:1,background:'#EF2118'}}/>
      </div>

      <nav style={{background:'white',borderBottom:'1px solid #f0f0f0',overflowX:'auto'}}>
        <div style={{display:'flex',padding:'0 32px',minWidth:'max-content'}}>
          {CATS.map(c => (
            <button key={c} onClick={() => setActiveCat(c)}
              style={{padding:'0 20px',height:'52px',fontSize:'13px',border:'none',
                borderBottom:activeCat===c?'2px solid #078754':'2px solid transparent',
                background:'none',color:activeCat===c?'#078754':'#666',
                fontWeight:activeCat===c?600:400,cursor:'pointer',whiteSpace:'nowrap',transition:'all .2s'}}>
              {c}
            </button>
          ))}
        </div>
      </nav>

      {activeCat === 'All' && (
        <section style={{padding:'32px',background:'white'}}>
          <h2 style={{fontSize:'20px',fontWeight:600,color:'#111',marginBottom:'20px'}}>Popular Categories</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'32px'}}>
            {POPULAR.map(cat => (
              <div key={cat.name}>
                <h3 style={{fontSize:'13px',fontWeight:600,color:'#078754',marginBottom:'10px',display:'flex',alignItems:'center',gap:'6px'}}>
                  <span style={{width:'3px',height:'16px',background:'#078754',borderRadius:'2px',display:'inline-block'}}/>
                  {cat.name}
                </h3>
                <ul style={{listStyle:'none',padding:0,margin:0}}>
                  {cat.items.map(item => (
                    <li key={item} onClick={() => setActiveCat(cat.name)}
                      style={{fontSize:'12px',color:'#666',padding:'3px 0',cursor:'pointer'}}
                      onMouseEnter={e => (e.currentTarget.style.color='#078754')}
                      onMouseLeave={e => (e.currentTarget.style.color='#666')}>
                      {item}
                    </li>
                  ))}
                </ul>
                <div onClick={() => setActiveCat(cat.name)}
                  style={{fontSize:'12px',color:'#078754',fontWeight:500,marginTop:'8px',cursor:'pointer'}}>
                  All in {cat.name} →
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{padding:'0 32px 40px',background:'white',borderTop:'1px solid #f5f5f5'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 0'}}>
          <h2 style={{fontSize:'18px',fontWeight:600,margin:0}}>
            {activeCat === 'All' ? 'Latest Listings' : activeCat}
            <span style={{fontSize:'13px',color:'#999',fontWeight:400,marginLeft:'8px'}}>({filtered.length} listings)</span>
          </h2>
          {activeCat !== 'All' && (
            <button onClick={() => setActiveCat('All')}
              style={{fontSize:'12px',color:'#078754',background:'none',border:'none',cursor:'pointer'}}>← Back to all</button>
          )}
        </div>
        {loading ? (
          <div style={{textAlign:'center',padding:'60px',color:'#aaa'}}>
            <p>Loading listings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px',color:'#aaa'}}>
            <p>No listings found.</p>
            <button onClick={() => { setActiveCat('All'); setSearch('') }}
              style={{marginTop:'12px',background:'#078754',color:'white',border:'none',borderRadius:'8px',padding:'10px 24px',cursor:'pointer',fontSize:'13px'}}>
              View all listings
            </button>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'16px'}}>
            {filtered.map(l => (
              <div key={l.id}
                style={{border:'1px solid #eee',borderRadius:'12px',overflow:'hidden',cursor:'pointer',transition:'all .2s'}}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'
                  el.style.borderColor='#ccc'
                  el.style.transform='translateY(-2px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.boxShadow='none'
                  el.style.borderColor='#eee'
                  el.style.transform='translateY(0)'
                }}>
                <div style={{background:'#f5f5f5',height:'120px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                  <div style={{fontSize:'10px',fontWeight:500,color:'#078754',background:'rgba(0,0,0,.05)',padding:'2px 10px',borderRadius:'4px'}}>{l.category}</div>
                  <div style={{fontSize:'11px',color:'#aaa',textAlign:'center',padding:'0 8px'}}>{l.subcategory}</div>
                  <div style={{fontSize:'10px',color:'#ccc'}}>📍 {l.neighbourhood}, {l.city}</div>
                </div>
                <div style={{padding:'12px'}}>
                  <div style={{color:'#EF2118',fontWeight:700,fontSize:'14px',marginBottom:'4px'}}>{l.price_label}</div>
                  <div style={{color:'#333',fontSize:'12px',marginBottom:'4px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
                  <div style={{color:'#aaa',fontSize:'11px'}}>{l.city}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{margin:'0 32px 32px',background:'#f8f8f8',border:'1px solid #eee',borderRadius:'16px',padding:'32px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h3 style={{fontSize:'18px',fontWeight:600,marginBottom:'4px'}}>Find amazing deals on the go.</h3>
          <p style={{color:'#EF2118',fontWeight:500,fontSize:'14px',margin:0}}>Download the HagerHub app now!</p>
        </div>
        <div style={{display:'flex',gap:'12px'}}>
          <button style={{background:'#111',color:'white',border:'none',borderRadius:'10px',padding:'12px 24px',fontSize:'13px',fontWeight:500,cursor:'pointer'}}>App Store</button>
          <button style={{background:'#111',color:'white',border:'none',borderRadius:'10px',padding:'12px 24px',fontSize:'13px',fontWeight:500,cursor:'pointer'}}>Google Play</button>
        </div>
      </section>

      <footer style={{background:'#f8f8f8',borderTop:'1px solid #eee',padding:'40px 32px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:'32px',marginBottom:'32px'}}>
          {[
            {title:'Company',links:['About Us','Careers','Advertising','Legal Hub','Sitemap']},
            {title:'Ethiopia',links:['Addis Ababa','Hawassa','Bahir Dar','Dire Dawa','Mekelle','Gondar']},
            {title:'East Africa',links:['Kenya','Tanzania','Uganda','Rwanda','Djibouti']},
            {title:'Get Social',links:['Facebook','Telegram','Instagram','YouTube','TikTok']},
            {title:'Support',links:['Help Center','Contact Us','Safety Tips','Call Us']},
            {title:'Languages',links:['English','አማርኛ','Afaan Oromoo','Tigrinya']},
          ].map(col => (
            <div key={col.title}>
              <h4 style={{fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px',color:'#111',marginBottom:'12px'}}>{col.title}</h4>
              {col.links.map(l => (
                <div key={l} style={{fontSize:'12px',color:'#777',marginBottom:'8px',cursor:'pointer'}}
                  onMouseEnter={e => (e.currentTarget.style.color='#078754')}
                  onMouseLeave={e => (e.currentTarget.style.color='#777')}>
                  {l}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid #eee',paddingTop:'20px'}}>
          <span style={{color:'#aaa',fontSize:'11px'}}>© 2025 HagerHub · by Jiksi Michael · All Rights Reserved</span>
          <div style={{display:'flex',height:'3px',width:'54px',borderRadius:'2px',overflow:'hidden'}}>
            <div style={{flex:1,background:'#078754'}}/>
            <div style={{flex:1,background:'#FCDD09'}}/>
            <div style={{flex:1,background:'#EF2118'}}/>
          </div>
          <span style={{color:'#aaa',fontSize:'11px'}}>The Hub of the Homeland · ሃገር ሃብ</span>
        </div>
      </footer>
    </main>
  )
}
