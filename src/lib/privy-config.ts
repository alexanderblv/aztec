import { createConfig } from 'wagmi'
import { http, createPublicClient } from 'viem'
import { mainnet, polygon, sepolia } from 'viem/chains'

// Конфигурация для Wagmi (используется Privy под капотом)
export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, sepolia],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
  },
})

// Конфигурация для Privy
export const privyConfig = {
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'your-privy-app-id',
  config: {
    // Включенные методы входа
    loginMethods: ['email', 'wallet', 'sms', 'google', 'github'],
    
    // Настройки внешнего вида
    appearance: {
      theme: 'light',
      accentColor: '#3B82F6',
      logo: undefined,
    },
    
    // Поддерживаемые сети
    supportedChains: [mainnet, polygon, sepolia],
    
    // Настройки кошелька
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
      requireUserPasswordOnCreate: false,
    },
    
    // Настройки интерфейса
    legal: {
      termsAndConditionsUrl: undefined,
      privacyPolicyUrl: undefined,
    },
  },
} 