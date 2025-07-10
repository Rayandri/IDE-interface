import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Centre de Contrôle d'Urgence IoT",
  description: "Système d'Alertes d'Urgence IoT - Développé par Rayan Drissi EPITA",
    generator: 'Rayan Drissi'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-slate-950 text-slate-100`}>{children}</body>
    </html>
  )
}
