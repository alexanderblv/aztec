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

  // Инициализируем сервис при изменении сети
  useEffect(() => {
    const initializeService = async () => {
      try {
        const newService = network === 'testnet' ? new AztecService() : aztecDemoService
        
        if (network === 'testnet') {
          const testnetUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
            ? 'https://aztec-alpha-testnet-fullnode.zkv.xyz'
            : 'https://aztec-alpha-testnet-fullnode.zkv.xyz'
          await newService.initialize(testnetUrl)
          console.log('🌐 Подключен к Aztec Testnet')
          console.warn('⚠️ Контракт еще не развернут. Для размещения ставок необходимо скомпилировать и развернуть контракт или переключиться в демо режим.')
        } else {
          await newService.initialize()
          console.log('🔧 Подключен к Aztec Sandbox (демо)')
        }
        
        setService(newService)
      } catch (error) {
        console.error('Ошибка инициализации Aztec сервиса:', error)
        // В случае ошибки с testnet, падаем обратно на демо
        if (network === 'testnet') {
          console.log('⚠️ Переключение на демо режим из-за ошибки подключения к testnet')
          try {
            await aztecDemoService.initialize()
            setService(aztecDemoService)
            setNetwork('sandbox')
            if (typeof window !== 'undefined') {
              localStorage.setItem('aztecNetwork', 'sandbox')
            }
          } catch (demoError) {
            console.error('Критическая ошибка: не удалось инициализировать даже демо сервис:', demoError)
          }
        }
      }
    }

    initializeService()
  }, [network])

  // Восстанавливаем состояние при загрузке
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
    
    console.log(`Переключение сети: ${network} → ${newNetwork}`)
    
    // Отключаем текущий кошелек
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
      throw new Error('Сервис не инициализирован')
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
      console.error('Ошибка подключения кошелька:', error)
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