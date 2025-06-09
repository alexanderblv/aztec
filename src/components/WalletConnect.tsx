'use client'

import { useState } from 'react'
import { useAztec } from '@/lib/aztec-context'
// import { aztecDemoService } from '@/lib/aztec-demo'
// import { AztecService } from '@/lib/aztec'

interface WalletConnectProps {
  onWalletConnected: (address: string) => void
  network: 'sandbox' | 'testnet'
}

export default function WalletConnect({ onWalletConnected, network }: WalletConnectProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [showPrivateKeyInput, setShowPrivateKeyInput] = useState(false)
  const [privateKey, setPrivateKey] = useState('')

  // Using unified Aztec context
  const { service, connectWallet } = useAztec()

  const handleCreateWallet = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const address = await connectWallet()
      onWalletConnected(address)
    } catch (err: any) {
      console.error('Error creating wallet:', err)
      setError(err.message || 'Error creating wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectExisting = async () => {
    if (!privateKey.trim()) {
      setError('Enter private key')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const address = await connectWallet(privateKey)
      onWalletConnected(address)
    } catch (err: any) {
      console.error('Error connecting wallet:', err)
      setError(err.message || 'Error connecting wallet')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">
        Connect to Aztec {network === 'testnet' ? 'Testnet' : 'Sandbox'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleCreateWallet}
          disabled={isLoading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create new wallet'}
        </button>

        <div className="text-center">
          <span className="text-gray-500">or</span>
        </div>

        {!showPrivateKeyInput ? (
          <button
            onClick={() => setShowPrivateKeyInput(true)}
            className="w-full btn-secondary"
          >
            Connect existing wallet
          </button>
        ) : (
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Enter private key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="input-field"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleConnectExisting}
                disabled={isLoading || !privateKey.trim()}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Connecting...' : 'Connect'}
              </button>
              <button
                onClick={() => {
                  setShowPrivateKeyInput(false)
                  setPrivateKey('')
                  setError('')
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600 text-center">
        {network === 'testnet' ? (
          <p>
            🌐 Connecting to real Aztec Alpha Testnet
          </p>
        ) : (
          <p>
            ⚠️ This is a demo version. In production use real integration with Aztec Sandbox.
          </p>
        )}
      </div>
    </div>
  )
} 