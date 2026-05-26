'use client'
import { useRouter } from 'next/navigation'

const ADS = [
  { title: 'Modern 3-bed apartment — Bole', price: 'ETB 18,000/mo', views: 147, status: 'Active', days: '2 days ago' },
  { title: 'Toyota Land Cruiser V8 — 2020', price: 'ETB 4,200,000', views: 312, status: 'Active', days: '5 days ago' },
  { title: 'John Deere 5075E tractor', price: 'ETB 2,100,000', views: 0, status: 'Pending', days: '1 hour ago' },
  { title: 'iPhone 15 Pro — like new', price: 'ETB 95,000', views: 89, status: 'Active', days: '1 week ago' },
]

export default function Dashboard() {
  const router = useRouter()
  const stats = [
    { num: '12', label: 'Active ads', color: '#078754' },
    { num: '1,847', label: 'Total views', color: '#111' },
    { num: '38', label: 'Messages', color: '#111' },
    { num: '3', label: 'Expiring soon', color: '#EF2118' },
  ]

  return (
    <div style={{padding:'24px 32px',fontFamily:'Inter,sans-serif'}}>
      <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'28px',paddingBottom:'24px',borderBottom:'1px solid #eee'}}>
        <div style={{width:'56px',height:'56px',borderRadius:'50%',background:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',fontWeight:700,color:'#555',border:'2px solid #FCDD09'}}>J</div>
        <div style={{flex:1}}>
          <h1 style={{fontSize:'22px',fontWeight:700,margin:0}}>Welcome back, Jiksi!</h1>
          <p style={{fontSize:'13px',color:'#999',margin:'2px 0 0'}}>Manage your ads, messages and account</p>
        </div>
        <button onClick={() => router.push('/post')}
          style={{background:'#EF2118',color:'white',border:'none',borderRadius:'8px',padding:'10px 20px',fontSize:'13px',fontWeight:500,cursor:'pointer'}}>
          + Post new ad
        </button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'28px'}}>
        {stats.map(s => (
          <div key={s.label} style={{background:'white',border:'1px solid #eee',borderRadius:'10px',padding:'20px',textAlign:'center'}}>
            <div style={{fontSize:'32px',fontWeight:700,color:s.color,marginBottom:'4px'}}>{s.num}</div>
            <div style={{fontSize:'12px',color:'#999'}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:'24px'}}>
        <div>
          <h2 style={{fontSize:'16px',fontWeight:600,marginBottom:'16px'}}>My ads</h2>
          {ADS.map((ad, i) => (
            <div key={i} style={{display:'flex',gap:'14px',padding:'14px 0',borderBottom:'1px solid #f0f0f0',alignItems:'center'}}>
              <div style={{width:'80px',height:'60px',borderRadius:'8px',background:'#f5f5f5',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'11px',color:'#aaa',textAlign:'center',padding:'4px'}}>
                Photo
              </div>
              <div style={{flex:1}}>
                <div style={{display:'inline-block',padding:'2px 8px',borderRadius:'4px',fontSize:'10px',fontWeight:500,marginBottom:'4px',background: ad.status==='Active' ? '#e8f5e9' : '#fff8e1',color: ad.status==='Active' ? '#2e7d32' : '#f57f17'}}>
                  {ad.status}
                </div>
                <div style={{fontSize:'13px',fontWeight:500,marginBottom:'3px'}}>{ad.title}</div>
                <div style={{fontSize:'14px',fontWeight:700,color:'#EF2118',marginBottom:'2px'}}>{ad.price}</div>
                <div style={{fontSize:'11px',color:'#aaa'}}>Posted {ad.days} · {ad.views} views</div>
              </div>
              <div style={{display:'flex',gap:'8px'}}>
                <button onClick={() => router.push('/post')} style={{padding:'5px 12px',borderRadius:'6px',fontSize:'12px',cursor:'pointer',border:'1px solid #078754',color:'#078754',background:'white'}}>Edit</button>
                <button style={{padding:'5px 12px',borderRadius:'6px',fontSize:'12px',cursor:'pointer',border:'1px solid #EF2118',color:'#EF2118',background:'white'}}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={{background:'white',border:'1px solid #eee',borderRadius:'10px',padding:'20px',marginBottom:'16px'}}>
            <h3 style={{fontSize:'14px',fontWeight:600,marginBottom:'14px'}}>Recent messages</h3>
            {[
              {name:'Biruk T.',msg:'Is the apartment still available?',ref:'3-bed Bole apartment',time:'2m'},
              {name:'Sara M.',msg:'Can you do ETB 3,900,000?',ref:'Land Cruiser',time:'1h'},
              {name:'Dawit A.',msg:'When can I come to view?',ref:'3-bed Bole apartment',time:'3h'},
            ].map((m,i) => (
              <div key={i} onClick={() => router.push('/messages')}
                style={{display:'flex',gap:'10px',marginBottom:'14px',cursor:'pointer'}}>
                <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,fontSize:'13px',flexShrink:0}}>{m.name[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:'13px',fontWeight:500}}>{m.name}</div>
                  <div style={{fontSize:'12px',color:'#999',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.msg}</div>
                  <div style={{fontSize:'11px',color:'#078754'}}>Re: {m.ref}</div>
                </div>
                <div style={{fontSize:'10px',color:'#aaa',flexShrink:0}}>{m.time}</div>
              </div>
            ))}
            <div style={{textAlign:'center'}}>
              <button onClick={() => router.push('/messages')} style={{fontSize:'13px',color:'#078754',background:'none',border:'none',cursor:'pointer'}}>View all messages →</button>
            </div>
          </div>

          <div style={{background:'white',border:'1px solid #eee',borderRadius:'10px',padding:'20px'}}>
            <h3 style={{fontSize:'14px',fontWeight:600,marginBottom:'14px'}}>Quick links</h3>
            {[
              {label:'Post a new ad', action:() => router.push('/post')},
              {label:'Account settings', action:() => {}},
              {label:'Upgrade my ads', action:() => {}},
              {label:'Saved / favourites', action:() => {}},
              {label:'Safety & help', action:() => {}},
            ].map((l,i) => (
              <div key={i} onClick={l.action}
                style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f5f5f5',cursor:'pointer',fontSize:'13px',color:'#555'}}
                onMouseEnter={e => (e.currentTarget.style.color='#078754')}
                onMouseLeave={e => (e.currentTarget.style.color='#555')}>
                {l.label} <span>→</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
