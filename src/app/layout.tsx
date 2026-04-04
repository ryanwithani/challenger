import type { Metadata } from 'next'
import { Nunito_Sans, Fraunces } from 'next/font/google'
import { ThemeProvider } from '@/src/context/ThemeProvider'
import { ToastContainer } from '@/src/components/ui/Toast'
import './globals.css'

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'opsz'],
  variable: '--font-display',
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
    <html lang="en" suppressHydrationWarning className={`${nunitoSans.variable} ${fraunces.variable}`}>
      <body>
        <ThemeProvider>
          {children}
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  )
}
