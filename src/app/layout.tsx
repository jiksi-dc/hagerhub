import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
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
        <nav style={{background:'white',borderBottom:'1px solid #eee',padding:'0 32px',display:'flex',alignItems:'center',justifyContent:'space-between',height:'64px',position:'sticky',top:0,zIndex:50}}>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none'}}>
            <img src="/lion.jpg" alt="lion" style={{width:'36px',height:'36px',borderRadius:'50%',objectFit:'cover',border:'2px solid #ddd'}}/>
            <span style={{fontSize:'22px',fontWeight:700,letterSpacing:'1px',color:'#111'}}>HAGERHUB</span>
          </Link>
          <div style={{display:'flex'}}>
            {['Properties','Vehicles','Machinery','Classifieds','Jobs'].map(c => (
              <Link key={c} href="/" style={{padding:'0 16px',height:'64px',display:'flex',alignItems:'center',fontSize:'13px',color:'#666',textDecoration:'none'}}>
                {c}
              </Link>
            ))}
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <Link href="/auth" style={{fontSize:'13px',color:'#555',border:'1px solid #ddd',padding:'8px 16px',borderRadius:'8px',textDecoration:'none'}}>Log in</Link>
            <Link href="/post" style={{fontSize:'13px',color:'white',background:'#EF2118',padding:'9px 20px',borderRadius:'8px',textDecoration:'none',fontWeight:500}}>+ Post an ad</Link>
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
