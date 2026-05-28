'use client'
import {useLocale} from 'next-intl'
import {useRouter, usePathname} from 'next/navigation'

const LANGS = [
  {code:'en', label:'🇺🇸', full:'English'},
  {code:'am', label:'🇪🇹', full:'አማርኛ'},
  {code:'ar', label:'🇸🇦', full:'العربية'},
  {code:'fr', label:'🇫🇷', full:'Français'},
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

  const current = LANGS.find(l=>l.code===locale) || LANGS[0]

  return (
    <div style={{position:'fixed',bottom:'16px',right:'12px',zIndex:9999,display:'flex',gap:'6px',background:'rgba(0,0,0,0.75)',borderRadius:'30px',padding:'6px 10px',backdropFilter:'blur(8px)'}}>
      {LANGS.map(l=>(
        <button key={l.code} onClick={()=>switchLocale(l.code)}
          style={{background:locale===l.code?'#078754':'transparent',border:'none',borderRadius:'20px',padding:'4px 8px',cursor:'pointer',fontSize:'18px',transition:'all 0.2s'}}>
          {l.label}
        </button>
      ))}
    </div>
  )
}
