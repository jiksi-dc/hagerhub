'use client'
import { useState } from 'react'

const CONVOS = [
  { name:'Biruk T.', preview:'Is the apartment still available?', listing:'3-bed Bole apartment', time:'2m', active:true,
    msgs:[
      {me:false, text:'Hello! I saw your listing for the 3-bedroom apartment in Bole. Is it still available?', time:'10:24 AM'},
      {me:true, text:'Yes, it is still available! Are you looking to move in soon?', time:'10:26 AM'},
      {me:false, text:'Yes, ideally within the next 2 weeks. Can I come view it this weekend?', time:'10:28 AM'},
      {me:true, text:'Of course! Saturday morning works well. The apartment is on the 4th floor with great city views.', time:'10:30 AM'},
      {me:false, text:'Perfect! Is the price negotiable at all?', time:'10:31 AM'},
    ]},
  { name:'Sara M.', preview:'Can you do ETB 3,900,000?', listing:'Toyota Land Cruiser', time:'1h', active:false,
    msgs:[
      {me:false, text:'Hi, I am interested in the Land Cruiser. Can you do ETB 3,900,000?', time:'9:15 AM'},
      {me:true, text:'The lowest I can go is ETB 4,000,000. It is in excellent condition.', time:'9:20 AM'},
      {me:false, text:'Let me think about it. Can I come see it tomorrow?', time:'9:22 AM'},
    ]},
  { name:'Dawit A.', preview:'When can I come to view?', listing:'3-bed Bole apartment', time:'3h', active:false,
    msgs:[
      {me:false, text:'Good afternoon. When can I come to view the apartment?', time:'7:00 AM'},
      {me:true, text:'Any weekday after 5pm or Saturday morning works for me.', time:'7:15 AM'},
    ]},
]

export default function Messages() {
  const [active, setActive] = useState(0)
  const [msg, setMsg] = useState('')
  const convo = CONVOS[active]

  return (
    <div style={{display:'grid',gridTemplateColumns:'300px 1fr',height:'calc(100vh - 68px)',fontFamily:'Inter,sans-serif'}}>
      <div style={{borderRight:'1px solid #eee',overflowY:'auto'}}>
        <div style={{padding:'16px',borderBottom:'1px solid #eee',fontSize:'15px',fontWeight:600}}>Messages</div>
        {CONVOS.map((c,i) => (
          <div key={i} onClick={() => setActive(i)}
            style={{padding:'14px 16px',borderBottom:'1px solid #f5f5f5',cursor:'pointer',background: active===i ? '#f8f8f8' : 'white',transition:'background .2s'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
              <span style={{fontSize:'13px',fontWeight:500}}>{c.name}</span>
              <span style={{fontSize:'11px',color:'#aaa'}}>{c.time}</span>
            </div>
            <div style={{fontSize:'12px',color:'#999',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.preview}</div>
            <div style={{fontSize:'11px',color:'#078754',marginTop:'3px'}}>Re: {c.listing}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid #eee',display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,fontSize:'14px'}}>{convo.name[0]}</div>
          <div>
            <div style={{fontSize:'14px',fontWeight:600}}>{convo.name}</div>
            <div style={{fontSize:'12px',color:'#078754'}}>Re: {convo.listing}</div>
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'20px',display:'flex',flexDirection:'column',gap:'12px',background:'#fafafa'}}>
          {convo.msgs.map((m,i) => (
            <div key={i} style={{display:'flex',flexDirection:'column',alignItems: m.me ? 'flex-end' : 'flex-start'}}>
              <div style={{maxWidth:'70%',padding:'10px 14px',borderRadius:'12px',fontSize:'13px',lineHeight:1.5,
                background: m.me ? '#078754' : 'white',color: m.me ? 'white' : '#111',
                border: m.me ? 'none' : '1px solid #eee',
                borderBottomRightRadius: m.me ? '3px' : '12px',
                borderBottomLeftRadius: m.me ? '12px' : '3px'}}>
                {m.text}
              </div>
              <div style={{fontSize:'10px',color:'#aaa',marginTop:'4px'}}>{m.time}</div>
            </div>
          ))}
        </div>

        <div style={{padding:'16px',borderTop:'1px solid #eee',display:'flex',gap:'10px',background:'white'}}>
          <input value={msg} onChange={e => setMsg(e.target.value)}
            onKeyDown={e => { if(e.key==='Enter' && msg.trim()) setMsg('') }}
            style={{flex:1,border:'1px solid #ddd',borderRadius:'24px',padding:'10px 16px',fontSize:'13px',outline:'none',fontFamily:'Inter,sans-serif'}}
            placeholder="Type a message..."/>
          <button onClick={() => setMsg('')}
            style={{background:'#078754',color:'white',border:'none',borderRadius:'24px',padding:'10px 24px',fontSize:'13px',fontWeight:500,cursor:'pointer'}}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
