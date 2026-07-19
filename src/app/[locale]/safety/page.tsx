'use client'
import { useParams } from 'next/navigation'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import AuthButton from '@/components/AuthButton'

export default function SafetyPage() {
  const params = useParams()
  const locale = params.locale as string

  const sections = [
      { title: "Meet in Public", content: "Always meet in a safe, public location during daylight hours. Popular, busy areas are best. Bring a friend if you can." },
      { title: "Inspect Before You Pay", content: "Examine the item thoroughly before handing over any money. For vehicles and property, verify documents and ownership carefully." },
      { title: "Never Pay in Advance", content: "Do not send money, deposits, or transfers to someone you have not met in person. Be especially cautious of anyone who refuses to meet or pressures you to pay quickly." },
      { title: "Protect Your Information", content: "Share only what's necessary. Never give out bank details, passwords, or verification codes to a buyer or seller." },
      { title: "Trust Your Instincts", content: "If a deal seems too good to be true, it usually is. If something feels wrong, walk away." },
      { title: "Report Suspicious Activity", content: "If you encounter a suspicious listing or user, use the \"Report Listing\" option so our team can review it." }
    ]

  return (
    <main style={{minHeight:'100vh',background:'#F9FAFB',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <style>{'*{box-sizing:border-box;margin:0;padding:0}'}</style>
      <nav style={{position:'sticky',top:0,zIndex:100,background:'#fff',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 20px',height:'56px',display:'flex',alignItems:'center',gap:'12px'}}>
          <a href={`/${locale}`} style={{textDecoration:'none',flexShrink:0}}>
            <div style={{fontSize:'15px',fontWeight:900,color:'#111',letterSpacing:'2px'}}>ETHIOFY</div>
            <div style={{fontSize:'8px',color:'#9CA3AF',letterSpacing:'1.5px',marginTop:'1px'}}>ETHIOPIA&apos;S #1 MARKETPLACE</div>
          </a>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'10px'}}>
            <AuthButton/>
            <a href={`/${locale}/post`} style={{fontSize:'13px',fontWeight:600,padding:'9px 18px',background:'#111',color:'white',borderRadius:'8px',textDecoration:'none',whiteSpace:'nowrap'}}>+ Post Ad</a>
            <LanguageSwitcher/>
          </div>
        </div>
      </nav>
      <div style={{maxWidth:'800px',margin:'0 auto',padding:'48px 20px 80px'}}>
        <div style={{marginBottom:'40px'}}>
          <h1 style={{fontSize:'28px',fontWeight:900,color:'#111',marginBottom:'8px'}}>Safety Tips</h1>
          <div style={{fontSize:'14px',color:'#6B7280',lineHeight:1.7}}>How to buy and sell safely on Ethiofy.</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'0'}}>
          {sections.map((s, i) => (
            <div key={i} style={{padding:'24px 0',borderBottom:'1px solid #F3F4F6'}}>
              <h2 style={{fontSize:'15px',fontWeight:700,color:'#111',marginBottom:'10px'}}>{s.title}</h2>
              <p style={{fontSize:'14px',color:'#374151',lineHeight:1.8,whiteSpace:'pre-line'}}>{s.content}</p>
            </div>
          ))}
        </div>
        <div style={{marginTop:'40px',padding:'20px 24px',background:'#fff',borderRadius:'12px',border:'1px solid #E5E7EB',textAlign:'center'}}>
          <div style={{fontSize:'13px',color:'#6B7280',lineHeight:1.7}}>Have a question? <a href={`/${locale}/contact`} style={{color:'#2563EB',fontWeight:600,textDecoration:'none'}}>Contact us</a> and our team will get back to you.</div>
        </div>
      </div>
    </main>
  )
}
