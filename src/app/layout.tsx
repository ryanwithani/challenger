import type { Metadata } from 'next'
import { Source_Serif_4, Fraunces, Playfair_Display } from 'next/font/google'
import { ThemeProvider } from '@/src/context/ThemeProvider'
import './globals.css'

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-body',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'opsz'],
  variable: '--font-display',
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-brand',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sims Challenge Tracker',
  description: 'Track your Sims 4 gameplay challenges with ease',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sourceSerif4.variable} ${fraunces.variable} ${playfairDisplay.variable}`}>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}