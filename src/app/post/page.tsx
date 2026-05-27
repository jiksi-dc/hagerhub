'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATS = ['Properties','Vehicles','Machinery','Classifieds','Jobs','Agriculture']

export default function Post() {
  const [selectedCat, setSelectedCat] = useState('Properties')
  const router = useRouter()

  return (
    <div style={{padding:'32px',maxWidth:'760px',margin:'0 auto',fontFamily:'Inter,sans-serif'}}>
      <h1 style={{fontSize:'24px',fontWeight:700,marginBottom:'8px'}}>Post an ad</h1>
      <p style={{fontSize:'14px',color:'#777',marginBottom:'28px'}}>Reach thousands of buyers across Ethiopia. Free to post.</p>

      <div style={{background:'white',border:'1px solid #eee',borderRadius:'12px',padding:'24px',marginBottom:'16px'}}>
        <h2 style={{fontSize:'16px',fontWeight:600,marginBottom:'20px',display:'flex',alignItems:'center',gap:'10px'}}>
          <span style={{width:'28px',height:'28px',borderRadius:'50%',background:'#078754',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:600,flexShrink:0}}>1</span>
          Choose a category
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}}>
          {CATS.map(c => (
            <div key={c} onClick={() => setSelectedCat(c)}
              style={{border: selectedCat===c ? '2px solid #078754' : '1.5px solid #eee',borderRadius:'8px',padding:'14px',textAlign:'center',cursor:'pointer',background: selectedCat===c ? '#f0faf5' : 'white',transition:'all .2s'}}>
              <span style={{fontSize:'13px',fontWeight:500,color: selectedCat===c ? '#078754' : '#333'}}>{c}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:'white',border:'1px solid #eee',borderRadius:'12px',padding:'24px',marginBottom:'16px'}}>
        <h2 style={{fontSize:'16px',fontWeight:600,marginBottom:'20px',display:'flex',alignItems:'center',gap:'10px'}}>
          <span style={{width:'28px',height:'28px',borderRadius:'50%',background:'#078754',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:600,flexShrink:0}}>2</span>
          Ad details
        </h2>
        {[{label:'Title',placeholder:'e.g. Modern 3-bedroom apartment for rent in Bole'},{label:'Description',placeholder:'Describe your listing in detail...',area:true}].map(f => (
          <div key={f.label} style={{marginBottom:'16px'}}>
            <label style={{fontSize:'13px',fontWeight:500,color:'#333',display:'block',marginBottom:'6px'}}>{f.label}</label>
            {f.area
              ? <textarea style={{width:'100%',border:'1px solid #ddd',borderRadius:'8px',padding:'10px 14px',fontSize:'13px',outline:'none',fontFamily:'Inter,sans-serif',minHeight:'100px',resize:'vertical'}} placeholder={f.placeholder}/>
              : <input style={{width:'100%',border:'1px solid #ddd',borderRadius:'8px',padding:'10px 14px',fontSize:'13px',outline:'none',fontFamily:'Inter,sans-serif'}} placeholder={f.placeholder}/>
            }
          </div>
        ))}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
          <div>
            <label style={{fontSize:'13px',fontWeight:500,color:'#333',display:'block',marginBottom:'6px'}}>City</label>
            <select style={{width:'100%',border:'1px solid #ddd',borderRadius:'8px',padding:'10px 14px',fontSize:'13px',outline:'none',fontFamily:'Inter,sans-serif'}}>
              {['Addis Ababa','Hawassa','Bahir Dar','Dire Dawa','Mekelle','Gondar'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:'13px',fontWeight:500,color:'#333',display:'block',marginBottom:'6px'}}>Neighbourhood</label>
            <input style={{width:'100%',border:'1px solid #ddd',borderRadius:'8px',padding:'10px 14px',fontSize:'13px',outline:'none',fontFamily:'Inter,sans-serif'}} placeholder="e.g. Bole, Kazanchis, CMC..."/>
          </div>
        </div>
        <div>
          <label style={{fontSize:'13px',fontWeight:500,color:'#333',display:'block',marginBottom:'6px'}}>Price (ETB)</label>
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <span style={{background:'#f5f5f5',border:'1px solid #ddd',borderRadius:'8px',padding:'10px 14px',fontSize:'13px',color:'#555',fontWeight:500}}>ETB</span>
            <input type="number" style={{flex:1,border:'1px solid #ddd',borderRadius:'8px',padding:'10px 14px',fontSize:'13px',outline:'none',fontFamily:'Inter,sans-serif'}} placeholder="Enter price"/>
          </div>
        </div>
      </div>

      <div style={{background:'white',border:'1px solid #eee',borderRadius:'12px',padding:'24px',marginBottom:'16px'}}>
        <h2 style={{fontSize:'16px',fontWeight:600,marginBottom:'20px',display:'flex',alignItems:'center',gap:'10px'}}>
          <span style={{width:'28px',height:'28px',borderRadius:'50%',background:'#078754',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:600,flexShrink:0}}>3</span>
          Upload photos
        </h2>
        <div>
          <input type="file" id="photo-upload" accept="image/*" multiple
            style={{display:'none'}}
            onChange={e => {
              const files = Array.from(e.target.files || [])
              setPhotos(files)
            }}/>
          <label htmlFor="photo-upload"
            style={{display:'block',border:'2px dashed #ddd',borderRadius:'12px',padding:'28px 16px',textAlign:'center',cursor:'pointer',background:'#fafafa'}}>
            <div style={{fontSize:'36px',marginBottom:'8px'}}>📸</div>
            <div style={{fontSize:'14px',fontWeight:700,color:'#333',marginBottom:'4px'}}>Tap to add photos</div>
            <div style={{fontSize:'12px',color:'#aaa'}}>JPG, PNG · Up to 10 photos · Max 5MB each</div>
          </label>
          {photos.length > 0 && (
            <div style={{marginTop:'12px',display:'flex',gap:'8px',flexWrap:'wrap'}}>
              {photos.map((p,i) => (
                <div key={i} style={{position:'relative'}}>
                  <img src={URL.createObjectURL(p)} alt="preview"
                    style={{width:'72px',height:'72px',borderRadius:'10px',objectFit:'cover',border:'2px solid #078754'}}/>
                  <button onClick={() => setPhotos(photos.filter((_,j)=>j!==i))}
                    style={{position:'absolute',top:'-6px',right:'-6px',background:'#EF2118',color:'white',border:'none',borderRadius:'50%',width:'20px',height:'20px',fontSize:'11px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{background:'white',border:'1px solid #eee',borderRadius:'12px',padding:'24px',marginBottom:'24px'}}>
        <h2 style={{fontSize:'16px',fontWeight:600,marginBottom:'20px',display:'flex',alignItems:'center',gap:'10px'}}>
          <span style={{width:'28px',height:'28px',borderRadius:'50%',background:'#078754',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:600,flexShrink:0}}>4</span>
          Your contact details
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
          <div>
            <label style={{fontSize:'13px',fontWeight:500,color:'#333',display:'block',marginBottom:'6px'}}>Full name</label>
            <input style={{width:'100%',border:'1px solid #ddd',borderRadius:'8px',padding:'10px 14px',fontSize:'13px',outline:'none',fontFamily:'Inter,sans-serif'}} placeholder="Full name"/>
          </div>
          <div>
            <label style={{fontSize:'13px',fontWeight:500,color:'#333',display:'block',marginBottom:'6px'}}>Phone number</label>
            <input style={{width:'100%',border:'1px solid #ddd',borderRadius:'8px',padding:'10px 14px',fontSize:'13px',outline:'none',fontFamily:'Inter,sans-serif'}} placeholder="+251 9XX XXX XXX"/>
          </div>
        </div>
      </div>

      <button onClick={() => router.push('/dashboard')}
        style={{width:'100%',background:'#EF2118',color:'white',border:'none',borderRadius:'10px',padding:'16px',fontSize:'16px',fontWeight:600,cursor:'pointer'}}>
        Post your ad — FREE
      </button>
    </div>
  )
}
