import type { Metadata } from 'next'
import { Inter, Exo_2 } from 'next/font/google'
import { ThemeProvider } from '@/src/context/ThemeProvider'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900']
})
const exo2 = Exo_2({ subsets: ['latin'] })

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${exo2.className}`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}