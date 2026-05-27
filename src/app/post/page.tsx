'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const CATS = ['Properties','Vehicles','Machinery','Classifieds','Jobs','Agriculture']

export default function Post() {
  const [cat, setCat] = useState('Properties')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [price, setPrice] = useState('')
  const [city, setCity] = useState('Addis Ababa')
  const [area, setArea] = useState('')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit() {
    if (!title || !price || !phone || !name) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setError('')
    setStatus('🤖 AI is reviewing your listing...')
    try {
      const modRes = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: desc, category: cat, price })
      })
      const mod = await modRes.json()
      if (!mod.approved) {
        setError('Listing rejected: ' + mod.reason)
        setLoading(false)
        setStatus('')
        return
      }
      setStatus('✅ Approved! Saving your listing...')
      const { error: dbErr } = await supabase.from('listings').insert({
        title, description: desc,
        price: parseFloat(price),
        price_label: 'ETB ' + parseFloat(price).toLocaleString(),
        category: cat, city, neighbourhood: area,
        contact_name: name, contact_phone: phone, status: 'active', image_urls
      })
      if (dbErr) { setError('Failed to save. Please try again.'); setLoading(false); setStatus(''); return }
      setStatus('🎉 Your listing is live on HagerHub!')
      setTimeout(() => router.push('/'), 2000)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      setStatus('')
    }
  }

  const inp: React.CSSProperties = {
    width:'100%', border:'1px solid #ddd', borderRadius:'10px',
    padding:'12px 14px', fontSize:'14px', outline:'none',
    fontFamily:'inherit', boxSizing:'border-box'
  }
  const lbl: React.CSSProperties = {
    fontSize:'13px', fontWeight:600, color:'#333', display:'block', marginBottom:'6px'
  }

  return (
    <div style={{padding:'24px 16px',maxWidth:'680px',margin:'0 auto'}}>
      <div style={{marginBottom:'24px'}}>
        <h1 style={{fontSize:'24px',fontWeight:900,color:'#111',margin:'0 0 6px'}}>Post an ad</h1>
        <p style={{fontSize:'14px',color:'#888',margin:0}}>Free to post · AI moderated · Live instantly</p>
      </div>

      {error && (
        <div style={{background:'#fff0f0',border:'1px solid #ffcccc',borderRadius:'12px',padding:'14px',marginBottom:'16px',fontSize:'14px',color:'#cc0000',display:'flex',gap:'10px'}}>
          <span>🚫</span><span>{error}</span>
        </div>
      )}
      {status && (
        <div style={{background:'#f0fff4',border:'1px solid #b7f0c8',borderRadius:'12px',padding:'14px',marginBottom:'16px',fontSize:'14px',color:'#078754'}}>
          {status}
        </div>
      )}

      <div style={{background:'white',border:'1px solid #eee',borderRadius:'16px',padding:'20px',marginBottom:'14px'}}>
        <h2 style={{fontSize:'16px',fontWeight:800,margin:'0 0 16px',display:'flex',alignItems:'center',gap:'10px'}}>
          <span style={{width:'28px',height:'28px',borderRadius:'50%',background:'#078754',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',flexShrink:0}}>1</span>
          Choose a category
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px'}}>
          {CATS.map(c=>(
            <div key={c} onClick={()=>setCat(c)}
              style={{border:cat===c?'2px solid #078754':'1.5px solid #eee',borderRadius:'10px',padding:'14px',textAlign:'center',cursor:'pointer',background:cat===c?'#f0faf5':'white'}}>
              <span style={{fontSize:'13px',fontWeight:700,color:cat===c?'#078754':'#333'}}>{c}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:'white',border:'1px solid #eee',borderRadius:'16px',padding:'20px',marginBottom:'14px'}}>
        <h2 style={{fontSize:'16px',fontWeight:800,margin:'0 0 20px',display:'flex',alignItems:'center',gap:'10px'}}>
          <span style={{width:'28px',height:'28px',borderRadius:'50%',background:'#078754',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',flexShrink:0}}>2</span>
          Ad details
        </h2>
        <div style={{marginBottom:'16px'}}>
          <label style={lbl}>Title *</label>
          <input style={inp} placeholder="e.g. Modern 3-bedroom apartment for rent in Bole" value={title} onChange={e=>setTitle(e.target.value)}/>
        </div>
        <div style={{marginBottom:'16px'}}>
          <label style={lbl}>Description</label>
          <textarea style={{...inp,minHeight:'90px',resize:'vertical'}} placeholder="Describe your listing..." value={desc} onChange={e=>setDesc(e.target.value)}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'16px'}}>
          <div>
            <label style={lbl}>City *</label>
            <select style={inp} value={city} onChange={e=>setCity(e.target.value)}>
              {['Addis Ababa','Hawassa','Bahir Dar','Dire Dawa','Mekelle','Gondar','Jimma','Adama'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Neighbourhood</label>
            <input style={inp} placeholder="e.g. Bole, CMC..." value={area} onChange={e=>setArea(e.target.value)}/>
          </div>
        </div>
        <div>
          <label style={lbl}>Price (ETB) *</label>
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <span style={{background:'#f5f5f5',border:'1px solid #ddd',borderRadius:'10px',padding:'12px 14px',fontSize:'13px',color:'#555',fontWeight:600}}>ETB</span>
            <input type="number" style={inp} placeholder="Enter amount" value={price} onChange={e=>setPrice(e.target.value)}/>
          </div>
        </div>
      </div>

      <div style={{background:'white',border:'1px solid #eee',borderRadius:'16px',padding:'20px',marginBottom:'14px'}}>
        <h2 style={{fontSize:'16px',fontWeight:800,margin:'0 0 16px',display:'flex',alignItems:'center',gap:'10px'}}>
          <span style={{width:'28px',height:'28px',borderRadius:'50%',background:'#078754',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',flexShrink:0}}>3</span>
          Upload photos
        </h2>
        <input type="file" id="photos" accept="image/*" multiple style={{display:'none'}}
          onChange={e => setPhotos(Array.from(e.target.files || []))}/>
        <label htmlFor="photos" style={{display:'block',border:'2px dashed #ddd',borderRadius:'12px',padding:'28px 16px',textAlign:'center',cursor:'pointer',background:'#fafafa'}}>
          <div style={{fontSize:'36px',marginBottom:'8px'}}>📸</div>
          <div style={{fontSize:'14px',fontWeight:700,color:'#333',marginBottom:'4px'}}>Tap to add photos</div>
          <div style={{fontSize:'12px',color:'#aaa'}}>JPG, PNG · Up to 10 photos</div>
        </label>
        {photos.length > 0 && (
          <div style={{marginTop:'12px',display:'flex',gap:'8px',flexWrap:'wrap'}}>
            {photos.map((p,i)=>(
              <div key={i} style={{position:'relative'}}>
                <img src={URL.createObjectURL(p)} alt="preview"
                  style={{width:'72px',height:'72px',borderRadius:'10px',objectFit:'cover',border:'2px solid #078754'}}/>
                <button onClick={()=>setPhotos(photos.filter((_,j)=>j!==i))}
                  style={{position:'absolute',top:'-6px',right:'-6px',background:'#EF2118',color:'white',border:'none',borderRadius:'50%',width:'20px',height:'20px',fontSize:'12px',cursor:'pointer'}}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{background:'white',border:'1px solid #eee',borderRadius:'16px',padding:'20px',marginBottom:'20px'}}>
        <h2 style={{fontSize:'16px',fontWeight:800,margin:'0 0 20px',display:'flex',alignItems:'center',gap:'10px'}}>
          <span style={{width:'28px',height:'28px',borderRadius:'50%',background:'#078754',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',flexShrink:0}}>4</span>
          Your contact details
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
          <div>
            <label style={lbl}>Full name *</label>
            <input style={inp} placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/>
          </div>
          <div>
            <label style={lbl}>Phone number *</label>
            <input style={inp} placeholder="+251 9XX XXX XXX" value={phone} onChange={e=>setPhone(e.target.value)}/>
          </div>
        </div>
      </div>

      <div style={{background:'linear-gradient(135deg,#f0faf5,#e8f5e9)',border:'1px solid #b7f0c8',borderRadius:'12px',padding:'14px 16px',marginBottom:'20px',display:'flex',gap:'12px',alignItems:'flex-start'}}>
        <span style={{fontSize:'24px'}}>🤖</span>
        <div>
          <div style={{fontSize:'13px',fontWeight:700,color:'#078754',marginBottom:'3px'}}>AI-powered content moderation</div>
          <div style={{fontSize:'12px',color:'#555',lineHeight:1.5}}>Every listing is reviewed by Claude AI before going live. This keeps HagerHub safe for all Ethiopian users.</div>
        </div>
      </div>

      <button onClick={handleSubmit} disabled={loading}
        style={{width:'100%',background:loading?'#aaa':'#EF2118',color:'white',border:'none',borderRadius:'14px',padding:'18px',fontSize:'16px',fontWeight:900,cursor:loading?'not-allowed':'pointer',boxShadow:loading?'none':'0 6px 20px rgba(239,33,24,0.35)'}}>
        {loading ? (status || 'Processing...') : 'Post your ad — FREE'}
      </button>
    </div>
  )
}
