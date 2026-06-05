import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Garagem V8 — Estética Automotiva',
  description: 'Agende sua lavagem e serviços automotivos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
