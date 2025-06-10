'use client'

import React, { useEffect, useState } from 'react'

// Types for wallet connectors
interface WalletConnector {
  id: string
  name: string
  icon: string
  description: string
  available: boolean
}

interface AztecWalletConnectProps {
  onWalletConnected: (address: string) => void
  onError?: (error: string) => void
  onLogoutComplete?: () => void
}

export default function AztecWalletConnect({ 
  onWalletConnected, 
  onError, 
  onLogoutComplete 
}: AztecWalletConnectProps) {
  const [sdk, setSdk] = useState<any>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [account, setAccount] = useState<any>(null)
  const [hasSDK, setHasSDK] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Available wallet connectors
  const wallets: WalletConnector[] = [
    {
      id: 'obsidion',
      name: 'Obsidion Wallet',
      icon: '🌐',
      description: 'Privacy-first wallet for Aztec Network',
      available: true
    },
    {
      id: 'azguard',
      name: 'Azguard Wallet',
      icon: '🛡️',
      description: 'Secure Aztec wallet (Alpha)',
      available: true
    }
  ]

  // Initialize SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Try-catch wrapped dynamic import with fallback
        let walletSdk: any;
        
        try {
          // Dynamic import with explicit module resolution
          const { AztecWalletSdk, obsidion } = await import('@nemi-fi/wallet-sdk')
          
          walletSdk = new AztecWalletSdk({
            aztecNode: process.env.NODE_ENV === 'development' 
              ? 'http://localhost:8080' 
              : 'https://aztec-alpha-testnet.zkv.xyz',
            connectors: [obsidion()],
          })
        } catch (importError) {
          console.warn('Failed to import @nemi-fi/wallet-sdk, falling back to mock:', importError)
          
          // Fallback mock implementation for development
          walletSdk = {
            connect: async () => { throw new Error('Wallet SDK not available') },
            getAccount: async () => null,
            disconnect: async () => {},
          }
        }
        
        setSdk(walletSdk)
        setHasSDK(true)
        
        // Check if there's a previously connected wallet
        const savedWallet = localStorage.getItem('aztecConnectedWallet')
        if (savedWallet) {
          setConnectedWallet(savedWallet)
        }
      } catch (error) {
        console.error('Failed to initialize Aztec Wallet SDK:', error)
        onError?.('Failed to initialize wallet SDK')
      } finally {
        setIsLoading(false)
      }
    }

    initializeSDK()
  }, [onError])

  // Check connection status
  useEffect(() => {
    const checkConnection = async () => {
      if (sdk && connectedWallet) {
        try {
          const account = await sdk.getAccount()
          if (account) {
            setAccount(account)
            onWalletConnected(account.address.toString())
          }
        } catch (error) {
          console.error('Failed to get account:', error)
          // Clear saved wallet if connection failed
          localStorage.removeItem('aztecConnectedWallet')
          setConnectedWallet(null)
        }
      }
    }

    checkConnection()
  }, [sdk, connectedWallet, onWalletConnected])

  const handleConnect = async (walletId: string) => {
    if (!sdk) {
      onError?.('Wallet SDK not initialized')
      return
    }

    setIsConnecting(true)
    try {
      await sdk.connect(walletId)
      const account = await sdk.getAccount()
      
      if (account) {
        setAccount(account)
        setConnectedWallet(walletId)
        localStorage.setItem('aztecConnectedWallet', walletId)
        onWalletConnected(account.address.toString())
      } else {
        throw new Error('No account found after connection')
      }
    } catch (error) {
      console.error(`Failed to connect to ${walletId}:`, error)
      onError?.(`Failed to connect to ${walletId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      if (sdk && sdk.disconnect) {
        await sdk.disconnect()
      }
      
      setConnectedWallet(null)
      setAccount(null)
      localStorage.removeItem('aztecConnectedWallet')
      onLogoutComplete?.()
    } catch (error) {
      console.error('Error during disconnect:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="card max-w-md mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Initializing wallet SDK...</p>
        </div>
      </div>
    )
  }

  if (!hasSDK) {
    return (
      <div className="card max-w-md mx-auto">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-800 mb-4">
            Wallet SDK Not Available
          </h2>
          <p className="text-red-700 text-sm mb-4">
            Could not load Aztec Wallet SDK. Please check your internet connection.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-secondary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (connectedWallet && account) {
    return (
      <div className="card max-w-md mx-auto">
        <div className="text-center">
          <div className="text-green-600 text-4xl mb-4">✅</div>
          <h2 className="text-xl font-semibold mb-2">Wallet Connected</h2>
          <p className="text-gray-600 mb-2">
            {wallets.find(w => w.id === connectedWallet)?.name}
          </p>
          <p className="text-sm text-gray-500 mb-4 font-mono">
            {account.address.toString().slice(0, 6)}...{account.address.toString().slice(-4)}
          </p>
          <button
            onClick={handleDisconnect}
            className="btn-secondary"
          >
            Disconnect
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Connect Aztec Wallet</h2>
      
      <p className="text-gray-600 text-center mb-6">
        Choose your preferred Aztec wallet to start participating in private auctions.
      </p>

      <div className="space-y-3">
        {wallets.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => handleConnect(wallet.id)}
            disabled={isConnecting || !wallet.available}
            className={`w-full p-4 border rounded-lg text-left transition-colors ${
              wallet.available && !isConnecting
                ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                : 'border-gray-100 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{wallet.icon}</span>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{wallet.name}</div>
                <div className="text-sm text-gray-600">{wallet.description}</div>
                {!wallet.available && (
                  <div className="text-xs text-orange-600 mt-1">Coming Soon</div>
                )}
              </div>
              {isConnecting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">What are Aztec wallets?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 🔒 Built for privacy-preserving transactions</li>
          <li>• 🌐 Native support for Aztec Network</li>
          <li>• 🛡️ Advanced cryptographic protection</li>
          <li>• ⚡ Optimized for private DeFi</li>
        </ul>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>
          🔒 Your private keys never leave your wallet
        </p>
      </div>
    </div>
  )
} 