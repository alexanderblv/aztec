import type { Metadata } from 'next'
import { AztecProvider } from '@/lib/aztec-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Приватные Аукционы',
  description: 'Платформа приватных аукционов на основе Aztec Network',
  keywords: ['аукцион', 'приватность', 'блокчейн', 'Aztec', 'zk-доказательства'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="min-h-screen">
          <AztecProvider>
            {children}
          </AztecProvider>
        </div>
      </body>
    </html>
  )
} 