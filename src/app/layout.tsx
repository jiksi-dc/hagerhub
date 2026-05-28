import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import './desktop.css'
import Link from 'next/link'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400','500','600','700','800','900'] })

export const metadata: Metadata = {
  title: 'HagerHub — The Hub of the Homeland',
  description: "Ethiopia's #1 marketplace",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <nav style={{background:'white',borderBottom:'1px solid #eee',padding:'0 16px',display:'flex',alignItems:'center',justifyContent:'space-between',height:'56px',position:'sticky',top:0,zIndex:50}}>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:'8px',textDecoration:'none'}}>
            <img src="/lion.jpg" alt="lion" style={{width:'32px',height:'32px',borderRadius:'50%',objectFit:'cover',objectPosition:'center 15%',border:'2px solid #ddd'}}/>
            <span style={{fontSize:'18px',fontWeight:800,letterSpacing:'1px',color:'#111'}}>HAGERHUB</span>
          </Link>
          <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
            <Link href="/auth" style={{fontSize:'12px',fontWeight:500,color:'#555',border:'1px solid #ddd',padding:'6px 12px',borderRadius:'8px',textDecoration:'none',whiteSpace:'nowrap'}}>Log in</Link>
            <Link href="/post" style={{fontSize:'12px',fontWeight:600,color:'white',background:'#EF2118',padding:'7px 14px',borderRadius:'8px',textDecoration:'none',whiteSpace:'nowrap'}}>+ Post</Link>
          </div>
        </nav>
        <div style={{display:'flex',height:'3px'}}>
          <div style={{flex:1,background:'#078754'}}/>
          <div style={{flex:1,background:'#FCDD09'}}/>
          <div style={{flex:1,background:'#EF2118'}}/>
        </div>
        {children}
      </body>
    </html>
  )
}
// deploy
