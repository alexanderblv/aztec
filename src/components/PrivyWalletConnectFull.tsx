'use client'

import React, { useEffect, useState } from 'react'

interface PrivyWalletConnectFullProps {
  onWalletConnected: (address: string) => void
  onError?: (error: string) => void
  onLogoutComplete?: () => void
}

// Separate component to use Privy hooks
function PrivyWalletContent({ onWalletConnected, onError, onLogoutComplete }: PrivyWalletConnectFullProps) {
  const { ready, authenticated, user, wallets, login, logout } = require('@privy-io/react-auth')
  const [hasLoggedOut, setHasLoggedOut] = useState<boolean>(false)

  const { useState, useEffect } = require('react')

  // Check if user manually logged out
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedOut = localStorage.getItem('privyLoggedOut')
      if (loggedOut === 'true') {
        setHasLoggedOut(true)
      }
    }
  }, [])

  // Effect to handle authentication state
  useEffect(() => {
    if (ready && authenticated && !hasLoggedOut && wallets.length > 0) {
      const address = wallets[0].address
      onWalletConnected(address)
    }
  }, [ready, authenticated, wallets, hasLoggedOut, onWalletConnected])

  // Effect to handle logout
  useEffect(() => {
    if (ready && !authenticated && hasLoggedOut) {
      onLogoutComplete?.()
    }
  }, [ready, authenticated, hasLoggedOut, onLogoutComplete])

  const handleLogout = async () => {
    try {
      setHasLoggedOut(true)
      localStorage.setItem('privyLoggedOut', 'true')
      
      // Clear wallet state first
      onLogoutComplete?.()
      
      // Then perform Privy logout
      await logout()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const handleLogin = async () => {
    try {
      // Clear logout flag
      setHasLoggedOut(false)
      localStorage.removeItem('privyLoggedOut')
      
      // Perform login
      await login()
    } catch (error) {
      console.error('Error during login:', error)
    }
  }

  if (!ready) {
    return (
      <div className="card max-w-md mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (authenticated && !hasLoggedOut) {
    return (
      <div className="card max-w-md mx-auto">
        <div className="text-center">
          <div className="text-green-600 text-4xl mb-4">✅</div>
          <h2 className="text-xl font-semibold mb-2">Wallet Connected</h2>
          <p className="text-gray-600 mb-4">
            {user?.email?.address || user?.phone?.number || 'User authenticated'}
          </p>
          {wallets.length > 0 && (
            <p className="text-sm text-gray-500 mb-4 font-mono">
              {wallets[0].address.slice(0, 6)}...{wallets[0].address.slice(-4)}
            </p>
          )}
          <button
            onClick={handleLogout}
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
      <h2 className="text-2xl font-bold text-center mb-6">Connect via Privy</h2>
      
      <p className="text-gray-600 text-center mb-6">
        Login with any convenient method. Privy will automatically create a secure wallet.
      </p>

      <button
        onClick={handleLogin}
        className="w-full btn-primary flex items-center justify-center space-x-2"
      >
        <span>🔐</span>
        <span>Login</span>
      </button>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Supported login methods:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 📧 Email</li>
          <li>• 📱 SMS</li>
          <li>• 🌐 Google</li>
          <li>• 👛 External wallets (MetaMask, WalletConnect)</li>
          <li>• 🔒 Built-in Privy wallets</li>
        </ul>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>
          🔒 Security provided by TEE technology and distributed key sharding
        </p>
      </div>
    </div>
  )
}

export default function PrivyWalletConnectFull({ onWalletConnected, onError, onLogoutComplete }: PrivyWalletConnectFullProps) {
  const [hasPrivyDeps, setHasPrivyDeps] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for Privy availability
    try {
      require('@privy-io/react-auth')
      setHasPrivyDeps(true)
    } catch (e) {
      setHasPrivyDeps(false)
      onError?.('Privy not configured. Use demo mode.')
    } finally {
      setIsLoading(false)
    }
  }, [onError])

  if (isLoading) {
    return (
      <div className="card max-w-md mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking configuration...</p>
        </div>
      </div>
    )
  }

  if (!hasPrivyDeps) {
    return (
      <div className="card max-w-md mx-auto">
        <div className="text-center">
          <div className="text-yellow-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-yellow-800 mb-4">
            Privy not configured
          </h2>
          <p className="text-yellow-700 text-sm mb-4">
            Dependencies not installed or App ID not configured
          </p>
          <button 
            onClick={() => onError?.('Switch to demo mode')}
            className="btn-secondary"
          >
            Use demo mode
          </button>
        </div>
      </div>
    )
  }

  // Create provider only when dependencies are installed
  try {
    const React = require('react')
    const { PrivyProvider } = require('@privy-io/react-auth')
    // Temporarily comment out WagmiProvider from @privy-io/wagmi to avoid export issues
    // const { WagmiProvider } = require('@privy-io/wagmi')
    const { QueryClient, QueryClientProvider } = require('@tanstack/react-query')
    const { mainnet, polygon, sepolia } = require('viem/chains')
    const { http, createConfig } = require('wagmi')
    const { WagmiProvider } = require('wagmi')

    const config = createConfig({
      chains: [mainnet, polygon, sepolia],
      transports: {
        [mainnet.id]: http(),
        [polygon.id]: http(),
        [sepolia.id]: http(),
      },
    })

    const queryClient = new QueryClient()
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmbg3xtxt00ffju0mvd9uds6b'

    return React.createElement(PrivyProvider, {
      appId: appId,
      config: {
        loginMethods: ['email', 'wallet', 'sms', 'google'],
        appearance: {
          theme: 'light',
          accentColor: '#3B82F6',
          landingHeader: 'Welcome to Private Auction',
          loginMessage: 'Login to participate in private auctions',
        },
        supportedChains: [mainnet, polygon, sepolia],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
      }
    }, 
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(WagmiProvider, { config: config }, 
        React.createElement(PrivyWalletContent, { 
          onWalletConnected, 
          onError,
          onLogoutComplete 
        })
      )
    ))
  } catch (e) {
    // Fix TypeScript error by properly handling unknown type
    const errorMessage = e instanceof Error ? e.message : 'Unknown error'
    onError?.('Error initializing Privy: ' + errorMessage)
    return (
      <div className="card max-w-md mx-auto">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-800 mb-4">
            Privy Error
          </h2>
          <p className="text-red-700 text-sm">
            Check configuration
          </p>
        </div>
      </div>
    )
  }
} 