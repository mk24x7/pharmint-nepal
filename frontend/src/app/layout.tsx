import { getBaseURL } from "@lib/util/env"
import { Toaster } from "@medusajs/ui"
import { Analytics } from "@vercel/analytics/next"
import { GeistSans } from "geist/font/sans"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="dark" className={`dark ${GeistSans.variable}`}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="bg-background text-pharmint-white">
        <main className="relative min-h-screen bg-background">
          {/* Subtle gradient overlay */}
          <div className="fixed inset-0 bg-gradient-radial from-accent/10 via-transparent to-transparent pointer-events-none" />
          
          {/* Grid pattern background */}
          <div className="fixed inset-0 opacity-30 pointer-events-none">
            <div 
              className="w-full h-full" 
              style={{
                backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
                maskImage: 'radial-gradient(circle at center, black, transparent)',
                WebkitMaskImage: 'radial-gradient(circle at center, black, transparent)'
              }}
            />
          </div>
          
          {/* Animated glow orbs */}
          <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-radial from-accent/40 via-accent/20 to-transparent rounded-full blur-3xl animate-float pointer-events-none -translate-x-48 -translate-y-48" />
          <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-radial from-accent/40 via-accent/20 to-transparent rounded-full blur-3xl animate-float pointer-events-none translate-x-48 translate-y-48" style={{ animationDelay: '10s' }} />
          
          <div className="relative z-10">
            {props.children}
          </div>
        </main>
        <Toaster className="z-[99999]" position="bottom-left" />
        <Analytics />
      </body>
    </html>
  )
}
