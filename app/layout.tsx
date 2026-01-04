import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { config } from "@/lib/config"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: config.site.title,
    template: `%s | ${config.site.name}`,
  },
  description: config.site.description,
  applicationName: config.site.name,
  generator: "Next.js",
  keywords: ["lawyer", "legal services", "Algeria", "consultation", "avocat", "محامي", "خدمات قانونية", "الجزائر"],
  authors: [{ name: config.site.name }],
  creator: config.site.name,
  publisher: config.site.name,
  metadataBase: new URL(config.site.url),
  openGraph: {
    type: "website",
    locale: "en_DZ",
    url: config.site.url,
    title: config.site.title,
    description: config.site.description,
    siteName: config.site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: config.site.title,
    description: config.site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
