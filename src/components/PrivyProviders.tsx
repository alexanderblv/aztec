'use client'

import React from 'react'

interface PrivyProvidersProps {
  children: React.ReactNode
}

export default function PrivyProviders({ children }: PrivyProvidersProps) {
  // Проверяем наличие App ID
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  
  // Проверяем, установлены ли зависимости Privy
  let hasPrivyDeps = false
  try {
    // Пытаемся импортировать Privy
    require('@privy-io/react-auth')
    hasPrivyDeps = true
  } catch (e) {
    hasPrivyDeps = false
  }
  
  if (!hasPrivyDeps) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50">
        <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg border border-yellow-200">
          <div className="text-yellow-600 text-4xl text-center mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-yellow-800 text-center mb-4">
            Требуется установка зависимостей Privy
          </h2>
          <div className="space-y-4 text-sm">
            <p className="text-yellow-700">
              Для работы с кошельками необходимо установить зависимости Privy:
            </p>
            
            <div className="bg-gray-100 p-3 rounded border">
              <code className="text-xs block">
                npm install --legacy-peer-deps
              </code>
            </div>
            
            <p className="text-yellow-700 text-xs">
              После установки зависимостей также понадобится настроить App ID:
            </p>
            
            <ol className="list-decimal list-inside space-y-2 text-yellow-600 text-xs">
              <li>Зарегистрируйтесь на <a href="https://console.privy.io/" target="_blank" className="underline font-medium">console.privy.io</a></li>
              <li>Создайте новое приложение</li>
              <li>Скопируйте App ID</li>
              <li>Создайте файл <code className="bg-yellow-100 px-1 rounded">.env.local</code></li>
              <li>Добавьте: <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_PRIVY_APP_ID=ваш_app_id</code></li>
            </ol>
            
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-blue-800 text-xs">
                📚 Подробная инструкция в файлах <code>PRIVY_INTEGRATION.md</code> и <code>DEPENDENCY_FIX.md</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!appId || appId === 'your_privy_app_id_here') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-red-200">
          <div className="text-red-600 text-4xl text-center mb-4">🔑</div>
          <h2 className="text-xl font-bold text-red-800 text-center mb-4">
            Требуется настройка Privy App ID
          </h2>
          <div className="space-y-4 text-sm">
            <p className="text-red-700">
              Зависимости установлены, но необходимо настроить App ID:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-red-600">
              <li>Зарегистрируйтесь на <a href="https://console.privy.io/" target="_blank" className="underline font-medium">console.privy.io</a></li>
              <li>Создайте новое приложение</li>
              <li>Скопируйте App ID</li>
              <li>Создайте файл <code className="bg-red-100 px-1 rounded">.env.local</code></li>
              <li>Добавьте: <code className="bg-red-100 px-1 rounded text-xs">NEXT_PUBLIC_PRIVY_APP_ID=ваш_app_id</code></li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  // Если зависимости установлены и App ID настроен, используем полную интеграцию
  try {
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
      React.createElement(WagmiProvider, { config: config }, children)
    ))
  } catch (e) {
    console.error('Ошибка инициализации Privy:', e)
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-red-200">
          <div className="text-red-600 text-4xl text-center mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-800 text-center mb-4">
            Ошибка инициализации Privy
          </h2>
          <p className="text-red-700 text-sm text-center">
            Проверьте конфигурацию и зависимости
          </p>
        </div>
      </div>
    )
  }
} 