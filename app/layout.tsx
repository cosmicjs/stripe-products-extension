import "@/styles/globals.css"
import { Suspense } from "react"
import { Metadata } from "next"

import { siteConfig } from "@/config/site"
import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "w-full justify-center bg-light-background font-sans antialiased dark:bg-dark-background",
            fontSans.variable
          )}
        >
          <Suspense>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <div>{children}</div>
              <TailwindIndicator />
              <ThemeToggle />
            </ThemeProvider>
          </Suspense>
        </body>
      </html>
    </>
  )
}
