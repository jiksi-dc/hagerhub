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
        <div style={{border:'2px dashed #ddd',borderRadius:'10px',padding:'40px',textAlign:'center',cursor:'pointer'}}>
          <div style={{fontSize:'32px',color:'#ddd',marginBottom:'8px'}}>+</div>
          <p style={{fontSize:'13px',color:'#aaa',margin:0}}>Drag and drop photos here, or click to browse</p>
          <p style={{fontSize:'11px',color:'#ccc',marginTop:'4px'}}>Up to 20 photos · JPG, PNG · Max 5MB each</p>
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
