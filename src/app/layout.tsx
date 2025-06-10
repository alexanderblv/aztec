import type { Metadata } from 'next'
import { AztecProvider } from '@/lib/aztec-context'
import { AztecWalletProvider } from '@/components/AztecWalletProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Private Auctions',
  description: 'Private auction platform based on Aztec Network',
  keywords: ['auction', 'privacy', 'blockchain', 'Aztec', 'zk-proofs'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="min-h-screen">
          <AztecWalletProvider>
            <AztecProvider>
              {children}
            </AztecProvider>
          </AztecWalletProvider>
        </div>
      </body>
    </html>
  )
} 