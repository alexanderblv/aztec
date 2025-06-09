'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AztecService } from './aztec'
import { aztecDemoService } from './aztec-demo'

interface AztecContextType {
  service: any
  isTestnet: boolean
  network: 'sandbox' | 'testnet'
  isConnected: boolean
  walletAddress: string | null
  switchNetwork: (network: 'sandbox' | 'testnet') => Promise<void>
  connectWallet: (privateKey?: string) => Promise<string>
  disconnect: () => void
}

const AztecContext = createContext<AztecContextType | null>(null)

export function useAztec() {
  const context = useContext(AztecContext)
  if (!context) {
    throw new Error('useAztec must be used within AztecProvider')
  }
  return context
}

interface AztecProviderProps {
  children: ReactNode
  initialNetwork?: 'sandbox' | 'testnet'
}

export function AztecProvider({ children, initialNetwork = 'sandbox' }: AztecProviderProps) {
  const [network, setNetwork] = useState<'sandbox' | 'testnet'>(initialNetwork)
  const [service, setService] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  // Initialize service when network changes
  useEffect(() => {
    const initializeService = async () => {
      try {
        const newService = network === 'testnet' ? new AztecService() : aztecDemoService
        
        if (network === 'testnet') {
          const testnetUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
            ? 'https://aztec-alpha-testnet-fullnode.zkv.xyz'
            : 'https://aztec-alpha-testnet-fullnode.zkv.xyz'
          await newService.initialize(testnetUrl)
          console.log('🌐 Connected to Aztec Testnet')
          console.warn('⚠️ Contract not yet deployed. To place bids, you need to compile and deploy the contract or switch to demo mode.')
        } else {
          await newService.initialize()
          console.log('🔧 Connected to Aztec Sandbox (demo)')
        }
        
        setService(newService)
      } catch (error) {
        console.error('Error initializing Aztec service:', error)
        // In case of testnet error, fall back to demo
        if (network === 'testnet') {
          console.log('⚠️ Switching to demo mode due to testnet connection error')
          try {
            await aztecDemoService.initialize()
            setService(aztecDemoService)
            setNetwork('sandbox')
            if (typeof window !== 'undefined') {
              localStorage.setItem('aztecNetwork', 'sandbox')
            }
          } catch (demoError) {
            console.error('Critical error: failed to initialize even demo service:', demoError)
          }
        }
      }
    }

    initializeService()
  }, [network])

  // Restore state on load
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const savedNetwork = localStorage.getItem('aztecNetwork') as 'sandbox' | 'testnet'
    const savedAddress = localStorage.getItem('walletAddress')
    
    if (savedNetwork && savedNetwork !== network) {
      setNetwork(savedNetwork)
    }
    
    if (savedAddress) {
      setWalletAddress(savedAddress)
      setIsConnected(true)
    }
  }, [network])

  const switchNetwork = async (newNetwork: 'sandbox' | 'testnet') => {
    if (newNetwork === network) return
    
    console.log(`Switching network: ${network} → ${newNetwork}`)
    
    // Disconnect current wallet
    if (isConnected) {
      disconnect()
    }
    
    setNetwork(newNetwork)
    if (typeof window !== 'undefined') {
      localStorage.setItem('aztecNetwork', newNetwork)
    }
  }

  const connectWallet = async (privateKey?: string): Promise<string> => {
    if (!service) {
      throw new Error('Service not initialized')
    }

    try {
      let address: string
      
      if (privateKey) {
        address = await service.connectWallet(privateKey)
      } else {
        address = await service.createWallet()
      }
      
      setWalletAddress(address)
      setIsConnected(true)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('walletAddress', address)
        localStorage.setItem('walletMode', 'demo')
      }
      
      return address
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setWalletAddress(null)
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletAddress')
      localStorage.removeItem('walletMode')
    }
  }

  const value: AztecContextType = {
    service,
    isTestnet: network === 'testnet',
    network,
    isConnected,
    walletAddress,
    switchNetwork,
    connectWallet,
    disconnect
  }

  return (
    <AztecContext.Provider value={value}>
      {children}
    </AztecContext.Provider>
  )
} 