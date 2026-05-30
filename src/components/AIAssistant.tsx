'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m HagerHub AI. I can help you find listings, answer questions about properties, vehicles, jobs and more. How can I help you today? 🦁🇪🇹' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{position:'fixed',top:'12px',right:'12px',zIndex:9999,width:'48px',height:'48px',borderRadius:'50%',background:'linear-gradient(135deg,#6B7280,#05613d)',border:'none',cursor:'pointer',boxShadow:'0 4px 20px rgba(0,87,217,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'19px',color:'white',fontWeight:900,transition:'transform 0.2s'}}
        onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.1)')}
        onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}>
        {open ? '✕' : '✦'}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{position:'fixed',top:'80px',right:'12px',zIndex:9999,width:'320px',height:'480px',background:'white',borderRadius:'20px',boxShadow:'0 8px 40px rgba(0,0,0,0.2)',display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {/* Header */}
          <div style={{background:'linear-gradient(135deg,#6B7280,#05613d)',padding:'16px',display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>🤖</div>
            <div>
              <div style={{color:'white',fontWeight:800,fontSize:'14px'}}>HagerHub AI</div>
              <div style={{color:'rgba(255,255,255,0.7)',fontSize:'11px'}}>Ethiopia's Marketplace Assistant</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{flex:1,overflowY:'auto',padding:'12px',display:'flex',flexDirection:'column',gap:'8px'}}>
            {messages.map((m, i) => (
              <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
                <div style={{maxWidth:'80%',padding:'10px 14px',borderRadius:m.role==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px',background:m.role==='user'?'#6B7280':'#F0F2F5',color:m.role==='user'?'white':'#111',fontSize:'13px',lineHeight:1.5}}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{display:'flex',justifyContent:'flex-start'}}>
                <div style={{padding:'10px 14px',borderRadius:'18px 18px 18px 4px',background:'#F0F2F5',color:'#999',fontSize:'13px'}}>typing...</div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div style={{padding:'12px',borderTop:'1px solid #eee',display:'flex',gap:'8px'}}>
            <input
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&send()}
              placeholder="Ask me anything..."
              style={{flex:1,border:'1.5px solid #eee',borderRadius:'20px',padding:'10px 14px',fontSize:'13px',outline:'none',fontFamily:'inherit'}}
            />
            <button
              onClick={send}
              disabled={loading}
              style={{width:'38px',height:'38px',borderRadius:'50%',background:'#6B7280',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',flexShrink:0}}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}
