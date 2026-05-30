'use client'
import {useLocale} from 'next-intl'
import {useRouter, usePathname} from 'next/navigation'

const LANGS = [
  {code:'en', label:'🇺🇸 English'},
  {code:'am', label:'🇪🇹 አማርኛ'},
  {code:'ar', label:'🇸🇦 العربية'},
  {code:'fr', label:'🇫🇷 Français'},
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
    <div style={{position:'fixed',bottom:'24px',right:'24px',zIndex:9999}}>
      <select
        value={locale}
        onChange={e=>switchLocale(e.target.value)}
        style={{background:'#60A5FA',color:'white',border:'none',borderRadius:'30px',padding:'12px 20px',fontSize:'14px',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 20px rgba(0,0,0,0.3)'}}>
        {LANGS.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </div>
  )
}
