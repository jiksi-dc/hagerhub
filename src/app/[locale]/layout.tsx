import type { Metadata } from 'next'
import {NextIntlClientProvider} from 'next-intl'
import {getMessages} from 'next-intl/server'
import InstallButton from '@/components/InstallButton'
import '../globals.css'
import '../desktop.css'

export const metadata: Metadata = {
title: { default: "Ethiofy — Ethiopia's #1 Marketplace", template: "%s | Ethiofy" },
description: "Buy and sell properties, vehicles, machinery, jobs and more in Ethiopia. Ethiofy is Ethiopia's largest online marketplace.",
keywords: ['Ethiopia marketplace', 'buy sell Ethiopia', 'properties Ethiopia', 'jobs Ethiopia', 'Ethiofy'],
manifest: '/manifest.json',
appleWebApp: { capable: true, statusBarStyle: 'black', title: 'Ethiofy' },
openGraph: {
siteName: 'Ethiofy',
type: 'website',
locale: 'en_ET',
url: 'https://hagerhub.vercel.app',
images: [{ url: 'https://hagerhub.vercel.app/og-image.png', width: 1200, height: 630, alt: "Ethiofy — Ethiopia's #1 Marketplace" }],
},
twitter: { card: 'summary_large_image', site: '@hagerhub' },
robots: { index: true, follow: true },
}

export const viewport = {
width: 'device-width',
initialScale: 1,
maximumScale: 5,
userScalable: true,
}

export default async function LocaleLayout({children, params}: {children: React.ReactNode, params: Promise<{locale: string}>}) {
const {locale} = await params
const messages = await getMessages()
return (
<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
<body>
<NextIntlClientProvider messages={messages}>
{children}
<InstallButton/>
</NextIntlClientProvider>
</body>
</html>
)
}
