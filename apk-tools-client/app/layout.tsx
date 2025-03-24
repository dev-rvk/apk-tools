import { type Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'APK Tools',
  description: 'Android APK Analysis Tools'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  )
}
