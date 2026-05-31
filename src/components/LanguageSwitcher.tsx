'use client'
import {useLocale} from 'next-intl'
import {useRouter, usePathname} from 'next/navigation'

const LANGS = [
  {code:'en', label:'English'},
  {code:'am', label:'አማርኛ'},
  {code:'ar', label:'العربية'},
  {code:'fr', label:'Français'},
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
    <div style={{position:'relative'}}>
      <select
        value={locale}
        onChange={e=>switchLocale(e.target.value)}
        style={{background:'#F3F4F6',color:'#111',border:'1px solid #E5E7EB',borderRadius:'8px',padding:'8px 12px',fontSize:'13px',fontWeight:500,cursor:'pointer',fontFamily:'inherit',outline:'none'}}>
        {LANGS.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </div>
  )
}
