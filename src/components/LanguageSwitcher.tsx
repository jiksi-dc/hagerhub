'use client'
import {useLocale} from 'next-intl'
import {useRouter, usePathname} from 'next/navigation'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/')
    if (['en','am'].includes(segments[1])) {
      segments[1] = newLocale
    } else {
      segments.splice(1, 0, newLocale)
    }
    router.push(segments.join('/'))
  }

  return (
    <div style={{display:'flex',alignItems:'center',gap:'4px',position:'relative'}}>
      <button
        onClick={()=>switchLocale('en')}
        style={{fontSize:'13px',fontWeight:locale==='en'?700:400,color:locale==='en'?'#111':'#6B7280',background:'none',border:'none',cursor:'pointer',padding:'4px 6px',fontFamily:'inherit'}}>
        EN
      </button>
      <span style={{color:'#D1D5DB',fontSize:'12px'}}>|</span>
      <button
        onClick={()=>switchLocale('am')}
        style={{fontSize:'13px',fontWeight:locale==='am'?700:400,color:locale==='am'?'#111':'#6B7280',background:'none',border:'none',cursor:'pointer',padding:'4px 6px',fontFamily:'inherit'}}>
        አማርኛ
      </button>
    </div>
  )
}
