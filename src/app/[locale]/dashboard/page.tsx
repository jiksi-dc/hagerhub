'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AuthButton from '@/components/AuthButton'
import LanguageSwitcher from '@/components/LanguageSwitcher'

interface Listing {
  id: string; title: string; price_label: string; city: string; neighbourhood: string
  category: string; subcategory: string; image_urls?: string[]; status: string; created_at: string
}

const IMGS: Record<string,string> = {
  Properties:'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80',
  Vehicles:  'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&q=80',
  Machinery: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=400&q=80',
  Classifieds:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
  Jobs:      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80',
}

const COUNTRIES = ['Ethiopia','United States','United Kingdom','Canada','Australia','UAE','Saudi Arabia','Germany','Sweden','Norway','Netherlands','France','Italy','Israel','China','India','Kenya','South Africa','Other']

const TAB_STYLE = (active: boolean) => ({
  padding:'10px 20px', fontSize:'13px', fontWeight: active ? 700 : 400,
  color: active ? '#111' : '#6B7280', background:'none', border:'none',
  borderBottom: active ? '2px solid #111' : '2px solid transparent',
  cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' as const
})

export default function Dashboard() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [saved, setSaved] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'listings'|'saved'|'profile'>('listings')
  const [deleting, setDeleting] = useState<string|null>(null)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editCountry, setEditCountry] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push(`/${locale}/login`); return }
      setUser(data.user)
      const [{ data: p }, { data: l }, { data: s }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', data.user.id).single(),
        supabase.from('listings').select('*').eq('user_id', data.user.id).order('created_at', { ascending: false }),
        supabase.from('saved_listings').select('listing_id, listings(*)').eq('user_id', data.user.id)
      ])
      setProfile(p)
      setListings(l || [])
      setSaved(s || [])
      setEditName(p?.full_name || '')
      setEditPhone(p?.phone || '')
      setEditCountry(p?.country || '')
      setLoading(false)
    })
  }, [])

  const deleteListing = async (id: string) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('listings').delete().eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
    setDeleting(null)
  }

  const markSold = async (id: string) => {
    const supabase = createClient()
    await supabase.from('listings').update({ status: 'sold' }).eq('id', id)
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'sold' } : l))
  }

  const markActive = async (id: string) => {
    const supabase = createClient()
    await supabase.from('listings').update({ status: 'active' }).eq('id', id)
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'active' } : l))
  }

  const unsaveListing = async (listingId: string) => {
    const supabase = createClient()
    await supabase.from('saved_listings').delete().eq('user_id', user.id).eq('listing_id', listingId)
    setSaved(prev => prev.filter((s: any) => s.listing_id !== listingId))
  }

  const saveProfile = async () => {
    setSavingProfile(true)
    const supabase = createClient()
    await supabase.from('profiles').upsert({ id: user.id, full_name: editName, phone: editPhone, country: editCountry })
    setProfile((prev: any) => ({ ...prev, full_name: editName, phone: editPhone, country: editCountry }))
    setSavingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  const activeListings = listings.filter(l => l.status === 'active')
  const soldListings = listings.filter(l => l.status === 'sold')
  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-ET', { year: 'numeric', month: 'long' }) : ''

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,sans-serif',color:'#9CA3AF'}}>Loading...</div>
  )

  const ListingCard = ({ l }: { l: Listing }) => {
    const img = l.image_urls?.[0] || IMGS[l.category] || ''
    const isSold = l.status === 'sold'
    return (
      <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #F3F4F6',overflow:'hidden',opacity: isSold ? 0.7 : 1}}>
        <div style={{height:'140px',background:'#F9FAFB',position:'relative',cursor:'pointer'}}
          onClick={() => window.location.href = `/${locale}/listing/${l.id}`}>
          {img && <img src={img} alt={l.title} style={{width:'100%',height:'100%',objectFit:'contain'}}/>}
          <div style={{position:'absolute',top:'8px',left:'8px',background: isSold ? '#6B7280' : '#2563EB',color:'white',fontSize:'10px',fontWeight:600,padding:'2px 7px',borderRadius:'5px'}}>
            {isSold ? 'SOLD' : l.subcategory || l.category}
          </div>
          <div style={{position:'absolute',bottom:'8px',left:'8px',background:'rgba(0,0,0,0.7)',color:'white',fontSize:'11px',fontWeight:700,padding:'2px 8px',borderRadius:'5px'}}>
            {l.price_label}
          </div>
        </div>
        <div style={{padding:'10px 12px'}}>
          <div style={{fontSize:'13px',fontWeight:600,color:'#111',marginBottom:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
          <div style={{fontSize:'11px',color:'#9CA3AF',marginBottom:'10px'}}>{l.neighbourhood}, {l.city} · {new Date(l.created_at).toLocaleDateString()}</div>
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
            <button onClick={() => window.location.href = `/${locale}/listing/${l.id}`}
              style={{fontSize:'11px',padding:'5px 10px',borderRadius:'7px',border:'1px solid #E5E7EB',background:'#fff',cursor:'pointer',fontFamily:'inherit',color:'#374151'}}>
              View
            </button>
            <button onClick={() => window.location.href = `/${locale}/post?edit=${l.id}`}
              style={{fontSize:'11px',padding:'5px 10px',borderRadius:'7px',border:'1px solid #DBEAFE',background:'#EFF6FF',cursor:'pointer',fontFamily:'inherit',color:'#2563EB',fontWeight:600}}>
              Edit
            </button>
            {!isSold ? (
              <button onClick={() => markSold(l.id)}
                style={{fontSize:'11px',padding:'5px 10px',borderRadius:'7px',border:'1px solid #E5E7EB',background:'#fff',cursor:'pointer',fontFamily:'inherit',color:'#374151'}}>
                Mark sold
              </button>
            ) : (
              <button onClick={() => markActive(l.id)}
                style={{fontSize:'11px',padding:'5px 10px',borderRadius:'7px',border:'1px solid #E5E7EB',background:'#fff',cursor:'pointer',fontFamily:'inherit',color:'#374151'}}>
                Relist
              </button>
            )}
            <button onClick={() => deleteListing(l.id)} disabled={deleting === l.id}
              style={{fontSize:'11px',padding:'5px 10px',borderRadius:'7px',border:'1px solid #FEE2E2',background:'#FEF2F2',cursor:'pointer',fontFamily:'inherit',color:'#DC2626'}}>
              {deleting === l.id ? '...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main style={{minHeight:'100vh',background:'#F9FAFB',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <style>{'*{box-sizing:border-box;margin:0;padding:0}'}</style>
      <nav style={{position:'sticky',top:0,zIndex:100,background:'#fff',borderBottom:'1px solid #EBEBEB'}}>
        <div className="gb-navbar" style={{maxWidth:'1280px',margin:'0 auto',padding:'0 20px',height:'56px',display:'flex',alignItems:'center',gap:'12px'}}>
          <a href={`/${locale}`} style={{textDecoration:'none',flexShrink:0}}>
            <div style={{fontSize:'15px',fontWeight:900,color:'#111',letterSpacing:'2px'}}>GOHBAY</div>
            <div style={{fontSize:'8px',color:'#9CA3AF',letterSpacing:'1.5px',marginTop:'1px'}}>ETHIOPIA'S #1 MARKETPLACE</div>
          </a>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'10px'}}>
            <AuthButton/>
            <a href={`/${locale}/post`} style={{fontSize:'13px',fontWeight:600,padding:'9px 18px',background:'#111',color:'white',borderRadius:'8px',textDecoration:'none',whiteSpace:'nowrap'}}>+ Post Ad</a>
            <LanguageSwitcher/>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'32px 20px'}}>
        {/* PROFILE HEADER */}
        <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #F3F4F6',padding:'24px',marginBottom:'24px',display:'flex',alignItems:'center',gap:'20px',flexWrap:'wrap'}}>
          <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'linear-gradient(135deg,#2563EB,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',fontWeight:800,color:'white',flexShrink:0}}>
            {initials}
          </div>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
              <h1 style={{fontSize:'18px',fontWeight:800,color:'#111'}}>{profile?.full_name || user?.email}</h1>
              {profile?.verified && <span style={{background:'#ECFDF5',color:'#059669',fontSize:'10px',fontWeight:700,padding:'2px 8px',borderRadius:'20px'}}>✓ Verified</span>}
            </div>
            <div style={{fontSize:'12px',color:'#9CA3AF'}}>
              Member since {memberSince}
              {profile?.country && ` · ${profile.country}`}
              {` · ${activeListings.length} active listing${activeListings.length !== 1 ? 's' : ''}`}
            </div>
          </div>
          <div style={{display:'flex',gap:'16px',flexShrink:0}}>
            {[
              {label:'Active',value:activeListings.length,color:'#2563EB'},
              {label:'Sold',value:soldListings.length,color:'#059669'},
              {label:'Saved',value:saved.length,color:'#F59E0B'},
            ].map(stat=>(
              <div key={stat.label} style={{textAlign:'center'}}>
                <div style={{fontSize:'22px',fontWeight:800,color:stat.color}}>{stat.value}</div>
                <div style={{fontSize:'11px',color:'#9CA3AF'}}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #F3F4F6',marginBottom:'20px',display:'flex',overflowX:'auto'}}>
          {(['listings','saved','profile'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={TAB_STYLE(tab===t)}>
              {t==='listings'?`My Listings (${listings.length})`:t==='saved'?`Saved (${saved.length})`:'Profile'}
            </button>
          ))}
        </div>

        {/* MY LISTINGS */}
        {tab==='listings' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <div style={{fontSize:'13px',color:'#6B7280'}}>{listings.length} total · {activeListings.length} active · {soldListings.length} sold</div>
              <a href={`/${locale}/post`} style={{fontSize:'13px',fontWeight:600,padding:'9px 18px',background:'#111',color:'white',borderRadius:'8px',textDecoration:'none'}}>+ Post new ad</a>
            </div>
            {listings.length===0 ? (
              <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #F3F4F6',padding:'60px',textAlign:'center'}}>
                <div style={{fontSize:'14px',color:'#9CA3AF',marginBottom:'16px'}}>You have no listings yet.</div>
                <a href={`/${locale}/post`} style={{fontSize:'13px',fontWeight:600,padding:'10px 24px',background:'#111',color:'white',borderRadius:'8px',textDecoration:'none'}}>Post your first ad</a>
              </div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'16px'}}>
                {listings.map(l=><ListingCard key={l.id} l={l}/>)}
              </div>
            )}
          </div>
        )}

        {/* SAVED */}
        {tab==='saved' && (
          <div>
            {saved.length===0 ? (
              <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #F3F4F6',padding:'60px',textAlign:'center',color:'#9CA3AF',fontSize:'14px'}}>
                No saved listings yet. Heart a listing to save it.
              </div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'16px'}}>
                {saved.map((s:any)=>{
                  const l=s.listings; if(!l) return null
                  const img=l.image_urls?.[0]||IMGS[l.category]||''
                  return (
                    <div key={s.listing_id} style={{background:'#fff',borderRadius:'12px',border:'1px solid #F3F4F6',overflow:'hidden'}}>
                      <div style={{height:'140px',background:'#F9FAFB',position:'relative',cursor:'pointer'}} onClick={()=>window.location.href=`/${locale}/listing/${l.id}`}>
                        {img&&<img src={img} alt={l.title} style={{width:'100%',height:'100%',objectFit:'contain'}}/>}
                        <div style={{position:'absolute',bottom:'8px',left:'8px',background:'rgba(0,0,0,0.7)',color:'white',fontSize:'11px',fontWeight:700,padding:'2px 8px',borderRadius:'5px'}}>{l.price_label}</div>
                      </div>
                      <div style={{padding:'10px 12px'}}>
                        <div style={{fontSize:'13px',fontWeight:600,color:'#111',marginBottom:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
                        <div style={{fontSize:'11px',color:'#9CA3AF',marginBottom:'10px'}}>{l.city}</div>
                        <button onClick={()=>unsaveListing(s.listing_id)}
                          style={{fontSize:'11px',padding:'5px 10px',borderRadius:'7px',border:'1px solid #FEE2E2',background:'#FEF2F2',cursor:'pointer',fontFamily:'inherit',color:'#DC2626'}}>
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* PROFILE */}
        {tab==='profile' && (
          <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #F3F4F6',padding:'28px',maxWidth:'500px'}}>
            <h2 style={{fontSize:'15px',fontWeight:700,color:'#111',marginBottom:'20px'}}>Edit Profile</h2>
            {[
              {label:'Full Name',value:editName,set:setEditName,placeholder:'Your full name',type:'text'},
              {label:'Phone Number',value:editPhone,set:setEditPhone,placeholder:'+1 206 555 0100 or +251 911 000 000',type:'tel'},
            ].map(f=>(
              <div key={f.label} style={{marginBottom:'16px'}}>
                <label style={{fontSize:'12px',fontWeight:700,color:'#6B7280',display:'block',marginBottom:'6px',textTransform:'uppercase' as const,letterSpacing:'0.5px'}}>{f.label}</label>
                <input type={f.type} value={f.value} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder}
                  style={{width:'100%',padding:'10px 14px',border:'1.5px solid #E5E7EB',borderRadius:'10px',fontSize:'14px',fontFamily:'inherit',outline:'none'}}/>
              </div>
            ))}
            <div style={{marginBottom:'16px'}}>
              <label style={{fontSize:'12px',fontWeight:700,color:'#6B7280',display:'block',marginBottom:'6px',textTransform:'uppercase' as const,letterSpacing:'0.5px'}}>Country of Residence</label>
              <select value={editCountry} onChange={e=>setEditCountry(e.target.value)}
                style={{width:'100%',padding:'10px 14px',border:'1.5px solid #E5E7EB',borderRadius:'10px',fontSize:'14px',fontFamily:'inherit',outline:'none',background:'#fff'}}>
                <option value="">Select country...</option>
                {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{marginBottom:'20px'}}>
              <label style={{fontSize:'12px',fontWeight:700,color:'#6B7280',display:'block',marginBottom:'6px',textTransform:'uppercase' as const,letterSpacing:'0.5px'}}>Email</label>
              <input value={user?.email||''} disabled
                style={{width:'100%',padding:'10px 14px',border:'1.5px solid #E5E7EB',borderRadius:'10px',fontSize:'14px',fontFamily:'inherit',outline:'none',background:'#F9FAFB',color:'#9CA3AF'}}/>
              <div style={{fontSize:'11px',color:'#9CA3AF',marginTop:'4px'}}>Email cannot be changed here</div>
            </div>
            <button onClick={saveProfile} disabled={savingProfile}
              style={{padding:'11px 28px',background:'#111',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
              {savingProfile?'Saving...':'Save profile'}
            </button>
            {profileSaved&&<span style={{marginLeft:'12px',fontSize:'13px',color:'#059669'}}>✓ Saved</span>}
          </div>
        )}
      </div>
    </main>
  )
}
