import {NextIntlClientProvider} from 'next-intl'
import {getMessages} from 'next-intl/server'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import '../globals.css'
import '../desktop.css'

export default async function LocaleLayout({children, params: {locale}}: {children: React.ReactNode, params: {locale: string}}) {
  const messages = await getMessages()
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
          <LanguageSwitcher/>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
