'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AuthButton from '@/components/AuthButton'
import AIAssistant from '@/components/AIAssistant'
import LanguageSwitcher from '@/components/LanguageSwitcher'

interface Listing {
  id: string; title: string; description: string; price_label: string
  city: string; neighbourhood: string; category: string; subcategory: string
  image_urls?: string[]; created_at: string; user_id: string
}

const IMGS: Record<string,string> = {
  Properties:'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=85',
  Vehicles:  'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=85',
  Machinery: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=800&q=85',
  Classifieds:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=85',
  Jobs:      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=85',
}

export default function ListingPage() {
  const params = useParams()
  const locale = params.locale as string
  const id = params.id as string

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [activeImg, setActiveImg] = useState(0)
  const [verified, setVerified] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [sellerPhone, setSellerPhone] = useState('')
  const [copied, setCopied] = useState(false)
const [shareCopied, setShareCopied] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [reportSubmitted, setReportSubmitted] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
const [similar, setSimilar] = useState<Listing[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('listings').select('*').eq('id', id).single()
      .then(({ data }) => {
        setListing(data)
        setLoading(false)
        if (data?.user_id) {
          supabase.from('profiles').select('verified, phone').eq('id', data.user_id).single()
            .then(({ data: p }) => {
              setVerified(p?.verified || false)
              setSellerPhone(p?.phone || '')
            })
        }
      })
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        supabase.from('saved_listings').select('id').eq('user_id', data.user.id).eq('listing_id', id).single()
          .then(({ data: s }) => setSaved(!!s))
      }
    })
  }, [id])

  // Close lightbox on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const toggleSave = async () => {
    if (!user) { window.location.href = `/${locale}/login`; return }
    const supabase = createClient()
    if (saved) {
      await supabase.from('saved_listings').delete().eq('user_id', user.id).eq('listing_id', id)
    } else {
      await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: id })
    }
    setSaved(!saved)
  }

  const handleContact = () => {
    if (!user) { window.location.href = `/${locale}/login`; return }
    setShowContact(true)
  }

  const copyPhone = () => {
    navigator.clipboard.writeText(sellerPhone)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareListing = async () => {
const url = window.location.href
if (navigator.share) {
try { await navigator.share({ title: listing?.title, text: listing?.price_label, url }) } catch(e) {}
} else {
navigator.clipboard.writeText(url)
setShareCopied(true)
setTimeout(() => setShareCopied(false), 2000)
}
}

const submitReport = async () => {
    if (!reportReason) return
    setReportLoading(true)
    const supabase = createClient()
    await supabase.from('reports').insert({
      listing_id: id,
      reporter_id: user?.id || null,
      reason: reportReason,
      details: reportDetails
    })
    setReportLoading(false)
    setReportSubmitted(true)
  }

  const imgs = listing?.image_urls?.length ? listing.image_urls : [IMGS[listing?.category || ''] || '']

  const prevImg = (e: React.MouseEvent) => { e.stopPropagation(); setActiveImg(i => (i - 1 + imgs.length) % imgs.length) }
  const nextImg = (e: React.MouseEvent) => { e.stopPropagation(); setActiveImg(i => (i + 1) % imgs.length) }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,sans-serif',color:'#9CA3AF'}}>Loading...</div>
  )
  if (!listing) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,sans-serif',color:'#9CA3AF'}}>Listing not found.</div>
  )

  return (
    <main style={{minHeight:'100vh',background:'#F9FAFB',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <style>{'*{box-sizing:border-box;margin:0;padding:0}'}</style>

      {/* CONTACT MODAL */}
      {showContact && (
        <div onClick={()=>setShowContact(false)} style={{position:'fixed',inset:0,zIndex:99998,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'white',borderRadius:'20px',padding:'28px',width:'100%',maxWidth:'380px',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <h3 style={{fontSize:'16px',fontWeight:700,color:'#111'}}>Contact Seller</h3>
              <button onClick={()=>setShowContact(false)} style={{background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'#6B7280'}}>×</button>
            </div>
            {sellerPhone ? (
              <>
                <div style={{background:'#F9FAFB',borderRadius:'12px',padding:'16px 20px',marginBottom:'16px',textAlign:'center'}}>
                  <div style={{fontSize:'11px',color:'#9CA3AF',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'1px'}}>Phone Number</div>
                  <div style={{fontSize:'22px',fontWeight:800,color:'#111',letterSpacing:'1px'}}>{sellerPhone}</div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  <button onClick={copyPhone}
                    style={{width:'100%',padding:'12px',background:copied?'#059669':'#111',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'background 0.2s'}}>
                    {copied ? '✓ Copied!' : 'Copy number'}
                  </button>
                  <a href={`https://wa.me/${sellerPhone.replace(/[^0-9]/g,'')}`} target="_blank" rel="noopener noreferrer"
                    style={{width:'100%',padding:'12px',background:'#25D366',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',textAlign:'center',textDecoration:'none',display:'block'}}>
                    WhatsApp
                  </a>
                  <a href={`tel:${sellerPhone}`}
                    style={{width:'100%',padding:'12px',background:'#F3F4F6',color:'#111',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',textAlign:'center',textDecoration:'none',display:'block'}}>
                    Call now
                  </a>
                </div>
                <div style={{marginTop:'16px',padding:'12px 14px',background:'#FFFBEB',borderRadius:'10px',border:'1px solid #FEF3C7'}}>
                  <div style={{fontSize:'11px',color:'#92400E',lineHeight:1.6}}>Always meet in a public place. Never send money before seeing the item.</div>
                </div>
              </>
            ) : (
              <div style={{textAlign:'center',padding:'20px',color:'#9CA3AF',fontSize:'14px'}}>
                This seller has not added a phone number yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {showReport && (
        <div onClick={()=>setShowReport(false)} style={{position:'fixed',inset:0,zIndex:99998,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'white',borderRadius:'20px',padding:'28px',width:'100%',maxWidth:'420px',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
            {reportSubmitted ? (
              <div style={{textAlign:'center',padding:'20px 0'}}>
                <div style={{fontSize:'40px',marginBottom:'12px'}}>✓</div>
                <div style={{fontSize:'16px',fontWeight:700,color:'#111',marginBottom:'8px'}}>Report submitted</div>
                <div style={{fontSize:'13px',color:'#6B7280',marginBottom:'24px'}}>Thank you. Our team will review this listing.</div>
                <button onClick={()=>{setShowReport(false);setReportSubmitted(false);setReportReason('');setReportDetails('')}}
                  style={{padding:'10px 24px',background:'#111',color:'white',border:'none',borderRadius:'10px',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                  <h3 style={{fontSize:'16px',fontWeight:700,color:'#111'}}>Report this listing</h3>
                  <button onClick={()=>setShowReport(false)} style={{background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'#6B7280'}}>×</button>
                </div>
                <div style={{fontSize:'13px',color:'#6B7280',marginBottom:'16px'}}>Why are you reporting this listing?</div>
                <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'16px'}}>
                  {['Scam or fraud','Wrong category','Offensive content','Already sold','Duplicate listing','Other'].map(r=>(
                    <button key={r} onClick={()=>setReportReason(r)}
                      style={{padding:'10px 14px',borderRadius:'10px',border:`1.5px solid ${reportReason===r?'#111':'#E5E7EB'}`,background:reportReason===r?'#111':'#fff',color:reportReason===r?'white':'#374151',fontSize:'13px',fontWeight:500,cursor:'pointer',fontFamily:'inherit',textAlign:'left'}}>
                      {r}
                    </button>
                  ))}
                </div>
                <textarea
                  value={reportDetails}
                  onChange={e=>setReportDetails(e.target.value)}
                  placeholder="Additional details (optional)"
                  rows={3}
                  style={{width:'100%',padding:'10px 14px',border:'1.5px solid #E5E7EB',borderRadius:'10px',fontSize:'13px',fontFamily:'inherit',outline:'none',resize:'none',marginBottom:'16px'}}
                />
                <button onClick={submitReport} disabled={!reportReason||reportLoading}
                  style={{width:'100%',padding:'12px',background:reportReason?'#DC2626':'#F3F4F6',color:reportReason?'white':'#9CA3AF',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:600,cursor:reportReason?'pointer':'default',fontFamily:'inherit'}}>
                  {reportLoading ? 'Submitting...' : 'Submit report'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{position:'fixed',inset:0,zIndex:99999,background:'rgba(0,0,0,0.95)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'zoom-out'}}
        >
          {/* Close button */}
          <button
            onClick={() => setLightbox(false)}
            style={{position:'absolute',top:'16px',right:'20px',background:'none',border:'none',color:'white',fontSize:'32px',cursor:'pointer',lineHeight:1,zIndex:100000}}
          >×</button>

          {/* Prev arrow */}
          {imgs.length > 1 && (
            <button onClick={prevImg}
              style={{position:'absolute',left:'16px',background:'rgba(255,255,255,0.15)',border:'none',color:'white',fontSize:'24px',width:'44px',height:'44px',borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              ‹
            </button>
          )}

          {/* Main image */}
          <img
            src={imgs[activeImg]}
            alt={listing.title}
            onClick={e => e.stopPropagation()}
            style={{maxWidth:'90vw',maxHeight:'90vh',objectFit:'contain',borderRadius:'8px',userSelect:'none'}}
          />

          {/* Next arrow */}
          {imgs.length > 1 && (
            <button onClick={nextImg}
              style={{position:'absolute',right:'16px',background:'rgba(255,255,255,0.15)',border:'none',color:'white',fontSize:'24px',width:'44px',height:'44px',borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              ›
            </button>
          )}

          {/* Image counter */}
          {imgs.length > 1 && (
            <div style={{position:'absolute',bottom:'20px',left:'50%',transform:'translateX(-50%)',color:'rgba(255,255,255,0.7)',fontSize:'13px',background:'rgba(0,0,0,0.4)',padding:'4px 12px',borderRadius:'20px'}}>
              {activeImg + 1} / {imgs.length}
            </div>
          )}
        </div>
      )}

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,background:'#fff',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 20px',height:'56px',display:'flex',alignItems:'center',gap:'12px'}}>
          <a href={`/${locale}`} style={{textDecoration:'none',flexShrink:0}}>
            <div style={{fontSize:'15px',fontWeight:900,color:'#111',letterSpacing:'2px'}}>HAGERHUB</div>
            <div style={{fontSize:'8px',color:'#9CA3AF',letterSpacing:'1.5px',marginTop:'1px'}}>ETHIOPIA'S #1 MARKETPLACE</div>
          </a>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'10px'}}>
            <AuthButton/>
            <a href={`/${locale}/post`} style={{fontSize:'13px',fontWeight:600,padding:'9px 18px',background:'#111',color:'white',borderRadius:'8px',textDecoration:'none',whiteSpace:'nowrap'}}>+ Post Ad</a>
            <LanguageSwitcher/>
            <AIAssistant/>
          </div>
        </div>
      </nav>

      {/* BREADCRUMB */}
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'14px 20px',fontSize:'12px',color:'#6B7280'}}>
        <a href={`/${locale}`} style={{color:'#6B7280',textDecoration:'none'}}>Home</a>
        <span style={{margin:'0 6px'}}>›</span>
        <span style={{color:'#6B7280'}}>{listing.category}</span>
        <span style={{margin:'0 6px'}}>›</span>
        <span style={{color:'#111'}}>{listing.title}</span>
      </div>

      {/* MAIN */}
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 20px 40px',display:'grid',gridTemplateColumns:'1fr',gap:'24px',alignItems:'start'}}>

        {/* LEFT */}
        <div>
          {/* IMAGE GALLERY */}
          <div style={{background:'#fff',borderRadius:'14px',overflow:'hidden',border:'1px solid #F3F4F6',marginBottom:'16px'}}>
            {/* Main image — click to open lightbox */}
            <div
              onClick={() => setLightbox(true)}
              style={{position:'relative',height:'420px',background:'#F3F4F6',cursor:'zoom-in',overflow:'hidden'}}
            >
              {imgs[activeImg] && (
                <img src={imgs[activeImg]} alt={listing.title}
                  style={{width:'100%',height:'100%',objectFit:'contain',transition:'transform 0.2s'}}
                  onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.02)')}
                  onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
                />
              )}
              {/* Zoom hint */}
              <div style={{position:'absolute',bottom:'12px',right:'12px',background:'rgba(0,0,0,0.5)',color:'white',fontSize:'11px',padding:'4px 10px',borderRadius:'20px',pointerEvents:'none'}}>
                Click to zoom
              </div>
              <div style={{position:'absolute',top:'12px',left:'12px',background:'#2563EB',color:'white',fontSize:'11px',fontWeight:600,padding:'3px 10px',borderRadius:'6px'}}>
                {listing.subcategory || listing.category}
              </div>
              <button onClick={e=>{e.stopPropagation();toggleSave()}}
                style={{position:'absolute',top:'12px',right:'12px',background:'rgba(255,255,255,0.95)',border:'none',borderRadius:'50%',width:'36px',height:'36px',fontSize:'18px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
                {saved ? '♥' : '♡'}
              </button>
              {/* Prev/Next on main image */}
              {imgs.length > 1 && (
                <>
                  <button onClick={prevImg}
                    style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.9)',border:'none',borderRadius:'50%',width:'36px',height:'36px',fontSize:'20px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}}>
                    ‹
                  </button>
                  <button onClick={nextImg}
                    style={{position:'absolute',right:'52px',top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.9)',border:'none',borderRadius:'50%',width:'36px',height:'36px',fontSize:'20px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}}>
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {imgs.length > 1 && (
              <div style={{display:'flex',gap:'8px',padding:'12px',overflowX:'auto'}}>
                {imgs.map((img, i) => (
                  <div key={i} onClick={() => setActiveImg(i)}
                    style={{width:'72px',height:'54px',borderRadius:'6px',overflow:'hidden',cursor:'pointer',border:activeImg===i?'2px solid #2563EB':'2px solid transparent',flexShrink:0,background:'#F9FAFB'}}>
                    <img src={img} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #F3F4F6',padding:'24px'}}>
            <h1 style={{fontSize:'20px',fontWeight:700,color:'#111',marginBottom:'8px'}}>{listing.title}</h1>
            <div style={{fontSize:'12px',color:'#9CA3AF',marginBottom:'20px'}}>
              {listing.neighbourhood}, {listing.city} · Posted {new Date(listing.created_at).toLocaleDateString('en-ET',{year:'numeric',month:'long',day:'numeric'})}
            </div>
            <div style={{fontSize:'13px',color:'#374151',lineHeight:1.7,whiteSpace:'pre-wrap'}}>
              {listing.description || 'No description provided.'}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #F3F4F6',padding:'20px'}}>
            <div style={{fontSize:'26px',fontWeight:800,color:'#111',marginBottom:'4px'}}>{listing.price_label}</div>
            {verified && (
              <div style={{display:'inline-flex',alignItems:'center',gap:'4px',background:'#ECFDF5',color:'#059669',fontSize:'11px',fontWeight:700,padding:'3px 10px',borderRadius:'20px',marginBottom:'8px'}}>
                ✓ Verified Seller
              </div>
            )}
            <div style={{fontSize:'12px',color:'#9CA3AF',marginBottom:'8px'}}>{listing.city}</div>
            {listing.user_id && (
              <a href={`/${locale}/seller/${listing.user_id}`}
              style={{display:'inline-flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'#2563EB',fontWeight:600,textDecoration:'none',marginBottom:'16px'}}>
              View seller profile →
              </a>
            )}
            <button onClick={handleContact} style={{width:'100%',padding:'12px',background:'#111',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',marginBottom:'10px'}}>
              Contact Seller
            </button>
            <button onClick={toggleSave}
              style={{width:'100%',padding:'12px',background:saved?'#EFF6FF':'#F9FAFB',color:saved?'#2563EB':'#374151',border:`1.5px solid ${saved?'#2563EB':'#E5E7EB'}`,borderRadius:'10px',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
              {saved ? '♥ Saved' : '♡ Save listing'}
            </button>
            <button onClick={()=>setShowReport(true)}
              style={{width:'100%',padding:'10px',background:'none',color:'#9CA3AF',border:'none',borderRadius:'10px',fontSize:'12px',cursor:'pointer',fontFamily:'inherit',marginTop:'4px'}}>
              Report this listing
            </button>
feat: similar listings section on detail page
          <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #F3F4F6',padding:'20px'}}>
            <div style={{fontSize:'12px',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:'#9CA3AF',marginBottom:'14px'}}>Details</div>
            {[['Category',listing.category],['Type',listing.subcategory],['Location',`${listing.neighbourhood}, ${listing.city}`]].map(([label,value])=>value&&(
              <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #F3F4F6',fontSize:'13px'}}>
                <span style={{color:'#6B7280'}}>{label}</span>
                <span style={{color:'#111',fontWeight:500}}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{background:'#FFFBEB',borderRadius:'14px',border:'1px solid #FEF3C7',padding:'16px'}}>
            <div style={{fontSize:'12px',fontWeight:700,color:'#92400E',marginBottom:'6px'}}>Safety tip</div>
            <div style={{fontSize:'12px',color:'#92400E',lineHeight:1.6}}>Meet in a safe public place. Never send money in advance. Verify the item before paying.</div>
          </div>
        </div>
      </div>
    </main>
  )
}
