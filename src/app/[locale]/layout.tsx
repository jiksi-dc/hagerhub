import type { Metadata } from 'next'
import {NextIntlClientProvider} from 'next-intl'
import {getMessages} from 'next-intl/server'
import AIAssistant from '@/components/AIAssistant'
import '../globals.css'
import '../desktop.css'

export const metadata: Metadata = {
  title: { default: "HagerHub — Ethiopia's #1 Marketplace", template: "%s | HagerHub" },
  description: "Buy and sell properties, vehicles, machinery, jobs and more in Ethiopia. HagerHub is Ethiopia's largest online marketplace.",
  keywords: ['Ethiopia marketplace', 'buy sell Ethiopia', 'properties Ethiopia', 'jobs Ethiopia', 'HagerHub'],
  openGraph: {
    siteName: 'HagerHub',
    type: 'website',
    locale: 'en_ET',
    url: 'https://hagerhub.vercel.app',
    images: [{ url: 'https://hagerhub.vercel.app/og-image.png', width: 1200, height: 630, alt: "HagerHub — Ethiopia's #1 Marketplace" }],
  },
  twitter: { card: 'summary_large_image', site: '@hagerhub' },
  robots: { index: true, follow: true },
}

export default async function LocaleLayout({children, params}: {children: React.ReactNode, params: Promise<{locale: string}>}) {
  const {locale} = await params
  const messages = await getMessages()
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
          <AIAssistant/>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
