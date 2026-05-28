'use client'
import {useLocale} from 'next-intl'
import {useRouter, usePathname} from 'next/navigation'

const LANGS = [
  {code:'en', label:'🇺🇸'},
  {code:'am', label:'🇪🇹'},
  {code:'ar', label:'🇸🇦'},
  {code:'fr', label:'🇫🇷'},
]

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/')
    if (['en','am','ar','fr'].includes(segments[1])) {
      segments[1] = newLocale
    } else {
      segments.splice(1, 0, newLocale)
    }
    router.push(segments.join('/'))
  }

  return (
    <div style={{position:'fixed',top:'12px',right:'12px',zIndex:9999,display:'flex',gap:'4px',background:'rgba(0,0,0,0.6)',borderRadius:'30px',padding:'4px 8px',backdropFilter:'blur(8px)'}}>
      {LANGS.map(l=>(
        <button key={l.code} onClick={()=>switchLocale(l.code)}
          style={{background:locale===l.code?'#078754':'transparent',border:'none',borderRadius:'20px',padding:'3px 6px',cursor:'pointer',fontSize:'16px'}}>
          {l.label}
        </button>
      ))}
    </div>
  )
}
