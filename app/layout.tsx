import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Zach Kelling | zeekay.ai',
  description: 'Software Engineer, AI Enthusiast, Music Producer. Building the future with code and creativity.',
  openGraph: {
    title: 'Zach Kelling | zeekay.ai',
    description: 'Software Engineer, AI Enthusiast, Music Producer',
    images: ['https://github.com/zeekay.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zach Kelling',
    description: 'Software Engineer, AI Enthusiast, Music Producer',
    images: ['https://github.com/zeekay.png'],
  },
  icons: {
    icon: 'https://github.com/zeekay.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
