'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Types
interface AztecWalletContextType {
  sdk: any
  isConnected: boolean
  account: any
  connectedWallet: string | null
  isLoading: boolean
  error: string | null
  connect: (walletId: string) => Promise<void>
  disconnect: () => Promise<void>
}

const AztecWalletContext = createContext<AztecWalletContextType | null>(null)

interface AztecWalletProviderProps {
  children: ReactNode
}

export function AztecWalletProvider({ children }: AztecWalletProviderProps) {
  const [sdk, setSdk] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<any>(null)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        let walletSdk: any;
        
        try {
          const { AztecWalletSdk, obsidion } = await import('@nemi-fi/wallet-sdk')
          
          walletSdk = new AztecWalletSdk({
            aztecNode: process.env.NODE_ENV === 'development' 
              ? 'http://localhost:8080' 
              : 'https://aztec-alpha-testnet.zkv.xyz',
            connectors: [obsidion()],
          })
        } catch (importError) {
          console.warn('Failed to import @nemi-fi/wallet-sdk:', importError)
          
          // Fallback mock implementation
          walletSdk = {
            connect: async () => { throw new Error('Wallet SDK not available') },
            getAccount: async () => null,
            disconnect: async () => {},
          }
        }
        
        setSdk(walletSdk)
        
        // Check for saved connection
        const savedWallet = localStorage.getItem('aztecConnectedWallet')
        if (savedWallet) {
          setConnectedWallet(savedWallet)
          try {
            await walletSdk.connect(savedWallet)
            const acc = await walletSdk.getAccount()
            if (acc) {
              setAccount(acc)
              setIsConnected(true)
            }
          } catch (e) {
            localStorage.removeItem('aztecConnectedWallet')
          }
        }
      } catch (e) {
        setError('Failed to initialize wallet SDK')
      } finally {
        setIsLoading(false)
      }
    }

    initializeSDK()
  }, [])

  const connect = async (walletId: string) => {
    if (!sdk) throw new Error('SDK not initialized')
    
    try {
      setError(null)
      await sdk.connect(walletId)
      const acc = await sdk.getAccount()
      
      if (acc) {
        setAccount(acc)
        setConnectedWallet(walletId)
        setIsConnected(true)
        localStorage.setItem('aztecConnectedWallet', walletId)
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Connection failed'
      setError(message)
      throw e
    }
  }

  const disconnect = async () => {
    try {
      if (sdk && sdk.disconnect) {
        await sdk.disconnect()
      }
      
      setAccount(null)
      setConnectedWallet(null)
      setIsConnected(false)
      localStorage.removeItem('aztecConnectedWallet')
    } catch (e) {
      console.error('Disconnect error:', e)
    }
  }

  const value: AztecWalletContextType = {
    sdk,
    isConnected,
    account,
    connectedWallet,
    isLoading,
    error,
    connect,
    disconnect
  }

  return (
    <AztecWalletContext.Provider value={value}>
      {children}
    </AztecWalletContext.Provider>
  )
}

export function useAztecWallet() {
  const context = useContext(AztecWalletContext)
  if (!context) {
    throw new Error('useAztecWallet must be used within AztecWalletProvider')
  }
  return context
} 