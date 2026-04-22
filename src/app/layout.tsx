import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import { CursorSpotlight } from "@/components/cursor-spotlight";
import "@/app/globals.css";

const siteUrl = "https://invinciblecrm.com";
const siteTitle = "Invincible CRM";
const siteDescription =
  "Invincible CRM turns plain-language updates into structured contacts, deals, tasks, and notes before anything is saved.";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`
  },
  description: siteDescription,
  applicationName: siteTitle,
  alternates: {
    canonical: siteUrl
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
    apple: [{ url: "/favicon.svg" }]
  },
  keywords: [
    "CRM",
    "AI CRM",
    "sales CRM",
    "contact management",
    "deal tracking",
    "task management",
    "Invincible CRM"
  ],
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: siteTitle,
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Invincible CRM"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/opengraph-image"]
  }
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: siteTitle,
      alternateName: ["InvincibleCRM"],
      description: siteDescription
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      url: siteUrl,
      name: siteTitle,
      logo: `${siteUrl}/favicon.svg`,
      description: siteDescription
    }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${sans.variable} ${serif.variable} font-sans text-ink antialiased`}>
        <CursorSpotlight />
        {children}
        <Providers />
      </body>
    </html>
  );
}
