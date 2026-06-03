import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'NUASS - National Union of Anambra State Students',
  description: 'Official Membership Portal of the National Union of Anambra State Students. Unity • Culture • Progress',
  keywords: ['NUASS', 'Anambra', 'Students Union', 'UNIZIK', 'Membership'],
  authors: [{ name: 'NUASS ICT Department' }],
  openGraph: {
    title: 'NUASS Membership Portal',
    description: 'Unity • Culture • Progress',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/nuass-logo.jpg" type="image/jpeg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0d5c2e',
              color: '#fff',
              border: '1px solid #d4a017',
              borderRadius: '8px',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: {
              iconTheme: { primary: '#d4a017', secondary: '#fff' },
            },
            error: {
              style: { background: '#7f1d1d', color: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
