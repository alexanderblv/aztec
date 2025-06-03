'use client'

import { useEffect, useState } from 'react'

interface PrivyWalletConnectFullProps {
  onWalletConnected: (address: string) => void
  onError?: (error: string) => void
}

// Компонент для непосредственного использования Privy хуков
function PrivyWalletContent({ onWalletConnected, onError }: PrivyWalletConnectFullProps) {
  const { usePrivy, useWallets } = require('@privy-io/react-auth')
  
  const { 
    ready, 
    authenticated, 
    user, 
    login, 
    logout 
  } = usePrivy()
  
  const { wallets } = useWallets()

  useEffect(() => {
    if (authenticated && user && wallets.length > 0) {
      const wallet = wallets[0]
      onWalletConnected(wallet.address)
    }
  }, [authenticated, user, wallets, onWalletConnected])

  if (!ready) {
    return (
      <div className="card max-w-md mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (authenticated) {
    return (
      <div className="card max-w-md mx-auto">
        <div className="text-center">
          <div className="text-green-600 text-4xl mb-4">✅</div>
          <h2 className="text-xl font-semibold mb-2">Кошелек подключен</h2>
          <p className="text-gray-600 mb-4">
            {user?.email?.address || user?.phone?.number || 'Пользователь авторизован'}
          </p>
          {wallets.length > 0 && (
            <p className="text-sm text-gray-500 mb-4 font-mono">
              {wallets[0].address.slice(0, 6)}...{wallets[0].address.slice(-4)}
            </p>
          )}
          <button
            onClick={logout}
            className="btn-secondary"
          >
            Отключить
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Подключение через Privy</h2>
      
      <p className="text-gray-600 text-center mb-6">
        Войдите любым удобным способом. Privy автоматически создаст безопасный кошелек.
      </p>

      <button
        onClick={login}
        className="w-full btn-primary flex items-center justify-center space-x-2"
      >
        <span>🔐</span>
        <span>Войти</span>
      </button>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Поддерживаемые методы входа:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 📧 Email</li>
          <li>• 📱 SMS</li>
          <li>• 🌐 Google</li>
          <li>• 👛 Внешние кошельки (MetaMask, WalletConnect)</li>
          <li>• 🔒 Встроенные кошельки Privy</li>
        </ul>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>
          🔒 Безопасность обеспечивается технологией TEE и распределенным шардингом ключей
        </p>
      </div>
    </div>
  )
}

export default function PrivyWalletConnectFull({ onWalletConnected, onError }: PrivyWalletConnectFullProps) {
  const [hasPrivyDeps, setHasPrivyDeps] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Проверяем наличие Privy
    try {
      require('@privy-io/react-auth')
      setHasPrivyDeps(true)
    } catch (e) {
      setHasPrivyDeps(false)
      onError?.('Privy не настроен. Используйте демо режим.')
    } finally {
      setIsLoading(false)
    }
  }, [onError])

  if (isLoading) {
    return (
      <div className="card max-w-md mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Проверка настроек...</p>
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
            Privy не настроен
          </h2>
          <p className="text-yellow-700 text-sm mb-4">
            Зависимости не установлены или не настроен App ID
          </p>
          <button 
            onClick={() => onError?.('Переключитесь на демо режим')}
            className="btn-secondary"
          >
            Использовать демо режим
          </button>
        </div>
      </div>
    )
  }

  // Создаем провайдер только когда зависимости установлены
  try {
    const React = require('react')
    const { PrivyProvider } = require('@privy-io/react-auth')
    const { WagmiProvider } = require('@privy-io/wagmi')
    const { QueryClient, QueryClientProvider } = require('@tanstack/react-query')
    const { mainnet, polygon, sepolia } = require('viem/chains')
    const { http, createConfig } = require('wagmi')

    const config = createConfig({
      chains: [mainnet, polygon, sepolia],
      transports: {
        [mainnet.id]: http(),
        [polygon.id]: http(),
        [sepolia.id]: http(),
      },
    })

    const queryClient = new QueryClient()
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'clz2h1m7w00jmpfof8v6gbyou'

    return React.createElement(PrivyProvider, {
      appId: appId,
      config: {
        loginMethods: ['email', 'wallet', 'sms', 'google'],
        appearance: {
          theme: 'light',
          accentColor: '#3B82F6',
          landingHeader: 'Добро пожаловать в Private Auction',
          loginMessage: 'Войдите для участия в приватных аукционах',
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
        React.createElement(PrivyWalletContent, { onWalletConnected, onError })
      )
    ))
  } catch (e) {
    onError?.('Ошибка инициализации Privy: ' + e.message)
    return (
      <div className="card max-w-md mx-auto">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-800 mb-4">
            Ошибка Privy
          </h2>
          <p className="text-red-700 text-sm">
            Проверьте конфигурацию
          </p>
        </div>
      </div>
    )
  }
} 