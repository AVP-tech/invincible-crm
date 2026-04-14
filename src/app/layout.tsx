import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import { CursorSpotlight } from "@/components/cursor-spotlight";
import "@/app/globals.css";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif"
});

export const metadata: Metadata = {
  title: {
    default: "Invincible CRM",
    template: "%s | Invincible CRM"
  },
  description: "Invincible CRM turns plain-language updates into structured contacts, deals, tasks, and notes before anything is saved.",
  applicationName: "Invincible CRM",
  openGraph: {
    title: "Invincible CRM",
    description: "Invincible CRM turns plain-language updates into structured contacts, deals, tasks, and notes before anything is saved."
  }
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
      </head>
      <body className={`${sans.variable} ${serif.variable} font-sans text-ink antialiased`}>
        <CursorSpotlight />
        {children}
        <Providers />
      </body>
    </html>
  );
}
