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
  connectRealWallet: (address: string) => void
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
        // Check app mode to determine service choice
        const appMode = typeof window !== 'undefined' ? localStorage.getItem('appMode') : null
        const walletMode = typeof window !== 'undefined' ? localStorage.getItem('walletMode') : null
        
        // For Real Mode with external wallets, use demo service as backend
        // since we can't deploy contracts yet
        let newService: any
        
        if (appMode === 'real' && walletMode === 'aztec') {
          // Real Mode with external wallet - use demo service for now
          // This allows real wallet addresses to work with demo auction functionality
          newService = aztecDemoService
          console.log('🌐 Real Mode: Using demo service backend with real wallet addresses')
        } else if (network === 'testnet') {
          // Testnet mode - use real Aztec service
          newService = new AztecService()
          const testnetUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
            ? 'https://aztec-alpha-testnet-fullnode.zkv.xyz'
            : 'https://aztec-alpha-testnet-fullnode.zkv.xyz'
          await newService.initialize(testnetUrl)
          console.log('🌐 Connected to Aztec Testnet')
          console.warn('⚠️ Contract not yet deployed. To place bids, you need to compile and deploy the contract or switch to demo mode.')
        } else {
          // Demo mode - use demo service
          newService = aztecDemoService
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

  // Re-initialize when app mode changes (for Real Mode detection)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleStorageChange = () => {
      // Re-initialize service when app mode changes
      if (service) {
        setTimeout(() => {
          const appMode = localStorage.getItem('appMode')
          const walletMode = localStorage.getItem('walletMode')
          
          if (appMode === 'real' && walletMode === 'aztec' && service !== aztecDemoService) {
            console.log('🔄 Switching to demo service backend for Real Mode')
            setService(aztecDemoService)
          }
        }, 100)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [service])

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

  const connectRealWallet = (address: string) => {
    // For real wallet connections, just set the address and connected state
    // without creating a new wallet through the service
    setWalletAddress(address)
    setIsConnected(true)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('walletAddress', address)
      localStorage.setItem('walletMode', 'aztec')
    }
    
    // If we're using demo service as backend for Real Mode, set the external wallet
    if (service && service.setExternalWallet) {
      service.setExternalWallet(address)
    }
    
    console.log('Real wallet connected:', address)
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
    connectRealWallet,
    disconnect
  }

  return (
    <AztecContext.Provider value={value}>
      {children}
    </AztecContext.Provider>
  )
} 