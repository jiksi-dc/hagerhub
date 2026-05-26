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
    <main style={{fontFamily:'inherit',background:'white',minHeight:'100vh',width:'100%',overflowX:'hidden'}}>

      <section style={{background:'#f9fafb',padding:'24px 16px 20px',textAlign:'center',borderBottom:'1px solid #eee',width:'100%'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',marginBottom:'8px',width:'100%'}}>
          <img src="/lion.jpg" alt="lion" style={{width:'44px',height:'44px',borderRadius:'50%',objectFit:'cover',objectPosition:'center 15%',border:'2px solid #ddd',flexShrink:0}}/>
          <span style={{fontSize:'26px',fontWeight:800,letterSpacing:'1px',color:'#111'}}>HAGERHUB</span>
        </div>
        <p style={{color:'#aaa',fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'16px'}}>The Hub of the Homeland · ሃገር ሃብ</p>
        <div style={{display:'flex',background:'white',border:'1.5px solid #ddd',borderRadius:'10px',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,.06)',marginBottom:'12px',width:'100%'}}>
          <input style={{flex:1,border:'none',padding:'12px 14px',fontSize:'14px',outline:'none',fontFamily:'inherit',minWidth:0,width:'100%'}}
            placeholder="What are you looking for?"
            value={search} onChange={e => setSearch(e.target.value)}/>
          <button onClick={fetchListings}
            style={{background:'#078754',border:'none',color:'white',padding:'12px 18px',fontSize:'13px',fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>
            Search
          </button>
        </div>
        <div style={{display:'flex',gap:'6px',overflowX:'auto',paddingBottom:'4px',width:'100%'}}>
          {CATS.map(c => (
            <button key={c} onClick={() => setActiveCat(c)}
              style={{padding:'6px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:500,cursor:'pointer',border:'1.5px solid',flexShrink:0,
                borderColor:activeCat===c?'#078754':'#ddd',
                background:activeCat===c?'#078754':'white',
                color:activeCat===c?'white':'#555'}}>
              {c}
            </button>
          ))}
        </div>
      </section>

      <div style={{display:'flex',height:'3px',width:'100%'}}>
        <div style={{flex:1,background:'#078754'}}/>
        <div style={{flex:1,background:'#FCDD09'}}/>
        <div style={{flex:1,background:'#EF2118'}}/>
      </div>

      <div style={{display:'flex',gap:'0',overflowX:'auto',borderBottom:'1px solid #f0f0f0',background:'white',width:'100%'}}>
        {CATS.map(c => (
          <button key={c} onClick={() => setActiveCat(c)}
            style={{padding:'12px 16px',fontSize:'13px',border:'none',flexShrink:0,
              borderBottom:activeCat===c?'2px solid #078754':'2px solid transparent',
              background:'none',color:activeCat===c?'#078754':'#666',
              fontWeight:activeCat===c?600:400,cursor:'pointer',whiteSpace:'nowrap'}}>
            {c}
          </button>
        ))}
      </div>

      {activeCat === 'All' && (
        <section style={{background:'white',borderBottom:'1px solid #f5f5f5',padding:'16px'}}>
          <h2 style={{fontSize:'18px',fontWeight:700,color:'#111',marginBottom:'14px'}}>Popular Categories</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'12px'}}>
            {POPULAR.map(cat => (
              <div key={cat.name} style={{background:'#f9fafb',borderRadius:'10px',padding:'12px'}}>
                <h3 style={{fontSize:'13px',fontWeight:700,color:'#078754',marginBottom:'8px'}}>| {cat.name}</h3>
                <ul style={{listStyle:'none',padding:0,margin:0}}>
                  {cat.items.slice(0,3).map(item => (
                    <li key={item} onClick={() => setActiveCat(cat.name)}
                      style={{fontSize:'11px',color:'#666',padding:'2px 0',cursor:'pointer'}}>
                      {item}
                    </li>
                  ))}
                </ul>
                <div onClick={() => setActiveCat(cat.name)}
                  style={{fontSize:'11px',color:'#078754',fontWeight:600,marginTop:'6px',cursor:'pointer'}}>
                  All in {cat.name} →
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{background:'white',padding:'16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
          <h2 style={{fontSize:'16px',fontWeight:700,margin:0}}>
            {activeCat === 'All' ? 'Latest Listings' : activeCat}
            <span style={{fontSize:'12px',color:'#999',fontWeight:400,marginLeft:'6px'}}>({filtered.length})</span>
          </h2>
          {activeCat !== 'All' && (
            <button onClick={() => setActiveCat('All')}
              style={{fontSize:'12px',color:'#078754',background:'none',border:'none',cursor:'pointer'}}>← All</button>
          )}
        </div>
        {loading ? (
          <div style={{textAlign:'center',padding:'40px',color:'#aaa'}}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px',color:'#aaa'}}>
            <p>No listings found.</p>
            <button onClick={() => {setActiveCat('All');setSearch('')}}
              style={{marginTop:'12px',background:'#078754',color:'white',border:'none',borderRadius:'8px',padding:'10px 20px',cursor:'pointer',fontSize:'13px'}}>
              View all
            </button>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px'}}>
            {filtered.map(l => (
              <div key={l.id} style={{border:'1px solid #eee',borderRadius:'10px',overflow:'hidden',background:'white'}}>
                <div style={{background:'#f5f5f5',height:'80px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px',padding:'8px'}}>
                  <div style={{fontSize:'10px',fontWeight:600,color:'#078754',background:'rgba(7,135,84,.08)',padding:'2px 8px',borderRadius:'4px',textAlign:'center'}}>{l.category}</div>
                  <div style={{fontSize:'10px',color:'#aaa',textAlign:'center'}}>{l.subcategory}</div>
                </div>
                <div style={{padding:'8px'}}>
                  <div style={{color:'#EF2118',fontWeight:700,fontSize:'12px',marginBottom:'2px'}}>{l.price_label}</div>
                  <div style={{color:'#333',fontSize:'11px',marginBottom:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
                  <div style={{color:'#aaa',fontSize:'10px'}}>📍 {l.city}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{margin:'16px',background:'#f8f8f8',border:'1px solid #eee',borderRadius:'12px',padding:'20px'}}>
        <h3 style={{fontSize:'16px',fontWeight:700,marginBottom:'4px'}}>Find amazing deals on the go.</h3>
        <p style={{color:'#EF2118',fontWeight:500,fontSize:'13px',margin:'0 0 14px'}}>Download the HagerHub app now!</p>
        <div style={{display:'flex',gap:'10px'}}>
          <button style={{background:'#111',color:'white',border:'none',borderRadius:'8px',padding:'10px 20px',fontSize:'12px',fontWeight:500,cursor:'pointer'}}>App Store</button>
          <button style={{background:'#111',color:'white',border:'none',borderRadius:'8px',padding:'10px 20px',fontSize:'12px',fontWeight:500,cursor:'pointer'}}>Google Play</button>
        </div>
      </section>

      <footer style={{background:'#f8f8f8',borderTop:'1px solid #eee',padding:'24px 16px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'20px',marginBottom:'20px'}}>
          {[
            {title:'Company',links:['About Us','Careers','Advertising','Legal Hub']},
            {title:'Ethiopia',links:['Addis Ababa','Hawassa','Bahir Dar','Dire Dawa']},
            {title:'East Africa',links:['Kenya','Tanzania','Uganda','Rwanda']},
            {title:'Get Social',links:['Facebook','Telegram','Instagram','YouTube']},
            {title:'Support',links:['Help Center','Contact Us','Safety Tips','Call Us']},
            {title:'Languages',links:['English','አማርኛ','Afaan Oromoo','Tigrinya']},
          ].map(col => (
            <div key={col.title}>
              <h4 style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',color:'#111',marginBottom:'8px'}}>{col.title}</h4>
              {col.links.map(l => <div key={l} style={{fontSize:'12px',color:'#777',marginBottom:'4px',cursor:'pointer'}}>{l}</div>)}
            </div>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid #eee',paddingTop:'16px'}}>
          <span style={{color:'#aaa',fontSize:'10px'}}>© 2025 HagerHub · Jiksi Michael</span>
          <div style={{display:'flex',height:'3px',width:'36px',borderRadius:'2px',overflow:'hidden'}}>
            <div style={{flex:1,background:'#078754'}}/>
            <div style={{flex:1,background:'#FCDD09'}}/>
            <div style={{flex:1,background:'#EF2118'}}/>
          </div>
          <span style={{color:'#aaa',fontSize:'10px'}}>ሃገር ሃብ</span>
        </div>
      </footer>
    </main>
  )
}
