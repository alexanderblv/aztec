// Полная интеграция с Privy - раскомментируйте после установки зависимостей
/*
'use client'

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useEffect } from 'react'

interface PrivyWalletConnectFullProps {
  onWalletConnected: (address: string) => void
}

export default function PrivyWalletConnectFull({ onWalletConnected }: PrivyWalletConnectFullProps) {
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
        className="w-full btn-primary"
      >
        Войти
      </button>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Поддерживаемые методы входа:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Email</li>
          <li>• SMS</li>
          <li>• Google</li>
          <li>• Внешние кошельки (MetaMask, WalletConnect)</li>
          <li>• Встроенные кошельки Privy</li>
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
*/

// Временная заглушка - удалите после установки зависимостей
export default function PrivyWalletConnectFull() {
  return (
    <div className="card max-w-md mx-auto">
      <div className="text-center text-gray-600">
        <p>Для полной интеграции с Privy установите зависимости:</p>
        <code className="block mt-2 p-2 bg-gray-100 rounded text-sm">
          npm install @privy-io/react-auth @privy-io/wagmi @tanstack/react-query viem wagmi
        </code>
      </div>
    </div>
  )
} 