'use client'

import { useState, useEffect } from 'react'
import { useAztec } from '@/lib/aztec-context'
import Header from '@/components/Header'
import AuctionList from '@/components/AuctionList'
import CreateAuctionModal from '@/components/CreateAuctionModal'
import BidModal from '@/components/BidModal'
import PrivyWalletConnectFull from '@/components/PrivyWalletConnectFull'
import WalletConnect from '@/components/WalletConnect'
import NetworkSelector from '@/components/NetworkSelector'
import NetworkStatusAlert from '@/components/NetworkStatusAlert'

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isBidModalOpen, setIsBidModalOpen] = useState(false)
  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null)
  const [walletMode, setWalletMode] = useState<'privy' | 'demo'>('privy')
  const [privyError, setPrivyError] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')
  const [refreshKey, setRefreshKey] = useState(0)

  // Используем контекст Aztec
  const { 
    network, 
    isConnected, 
    walletAddress, 
    switchNetwork, 
    connectWallet, 
    disconnect 
  } = useAztec()

  useEffect(() => {
    // Проверяем состояние подключения кошелька при загрузке
    const savedMode = localStorage.getItem('walletMode') as 'privy' | 'demo'
    const privyLoggedOut = localStorage.getItem('privyLoggedOut')
    
    if (savedMode === 'demo') {
      // Для демо режима всегда восстанавливаем состояние
      setWalletMode(savedMode)
    } else if (savedMode === 'privy' && privyLoggedOut !== 'true') {
      // Для Privy восстанавливаем только если пользователь НЕ был явно отключен
      setWalletMode(savedMode || 'privy')
    }
  }, [])

  const handleWalletConnected = async (address: string) => {
    try {
      // Подключаем кошелек через контекст Aztec
      const aztecAddress = await connectWallet()
      localStorage.setItem('walletAddress', aztecAddress)
      localStorage.setItem('walletMode', walletMode)
      localStorage.setItem('aztecNetwork', network)
      // Очищаем флаг logout только при новом подключении
      localStorage.removeItem('privyLoggedOut')
    } catch (error) {
      console.error('Ошибка подключения Aztec кошелька:', error)
    }
  }

  const handleDisconnectWallet = () => {
    // Устанавливаем флаг отключения для Privy кошельков
    if (walletMode === 'privy') {
      localStorage.setItem('privyLoggedOut', 'true')
    }
    
    // Отключаем через контекст Aztec
    disconnect()
    
    setPrivyError('')
    localStorage.removeItem('walletAddress')
    localStorage.removeItem('walletMode')
    localStorage.removeItem('aztecNetwork')
    
    // Принудительно перезагружаем страницу чтобы полностью очистить состояние Privy
    if (walletMode === 'privy') {
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  }

  const handleNetworkChange = async (newNetwork: 'sandbox' | 'testnet') => {
    try {
      await switchNetwork(newNetwork)
      localStorage.setItem('aztecNetwork', newNetwork)
      console.log(`Переключение на ${newNetwork}`)
    } catch (error) {
      console.error('Ошибка переключения сети:', error)
    }
  }

  const handleBidClick = (auctionId: number) => {
    setSelectedAuctionId(auctionId)
    setIsBidModalOpen(true)
  }

  const handleAuctionCreated = () => {
    // Принудительно обновляем список аукционов
    setRefreshKey(prev => prev + 1)
    console.log('Аукцион создан, обновляем список')
  }

  const handleBidPlaced = () => {
    // Принудительно обновляем список аукционов после размещения ставки
    setRefreshKey(prev => prev + 1)
    console.log('Ставка размещена, обновляем список')
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Приватные Аукционы
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Добро пожаловать на платформу приватных аукционов, работающую на технологии Aztec Network. 
            Здесь ваши ставки остаются полностью конфиденциальными до завершения торгов.
          </p>

          {/* Выбор сети Aztec */}
          <NetworkSelector 
            currentNetwork={network}
            onNetworkChange={handleNetworkChange}
            disabled={false}
          />

          {/* Выбор типа подключения */}
          <div className="mb-8 max-w-md mx-auto">
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => {
                  setWalletMode('privy')
                  setPrivyError('')
                }}
                className={`flex-1 py-2 px-4 text-sm font-medium ${
                  walletMode === 'privy'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Privy (Реальные кошельки)
              </button>
              <button
                onClick={() => {
                  setWalletMode('demo')
                  setPrivyError('')
                }}
                className={`flex-1 py-2 px-4 text-sm font-medium ${
                  walletMode === 'demo'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Демо режим
              </button>
            </div>
          </div>

          {/* Компонент подключения */}
          {walletMode === 'privy' ? (
            <div>
              <PrivyWalletConnectFull 
                onWalletConnected={handleWalletConnected}
                onError={setPrivyError}
                onLogoutComplete={handleDisconnectWallet}
              />
              {privyError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded max-w-md mx-auto">
                  <p className="text-sm">{privyError}</p>
                  <button 
                    onClick={() => setWalletMode('demo')}
                    className="mt-2 text-xs underline"
                  >
                    Переключиться на демо режим
                  </button>
                </div>
              )}
            </div>
          ) : (
            <WalletConnect onWalletConnected={handleWalletConnected} network={network} />
          )}
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="card text-center">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Полная Приватность</h3>
              <p className="text-gray-600">Ваши ставки зашифрованы и невидимы до окончания аукциона</p>
            </div>
            <div className="card text-center">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Zero-Knowledge</h3>
              <p className="text-gray-600">Использует передовые zk-доказательства для обеспечения безопасности</p>
            </div>
            <div className="card text-center">
              <div className="text-3xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold mb-2">Честные Торги</h3>
              <p className="text-gray-600">Победитель определяется автоматически без возможности манипуляций</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header 
        walletAddress={walletAddress || ''}
        onDisconnect={handleDisconnectWallet}
        onCreateAuction={() => setIsCreateModalOpen(true)}
        walletMode={walletMode}
        network={network}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Статус сети */}
        <NetworkStatusAlert />

        {/* Информация о текущей сети */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  {network === 'testnet' ? '🌐 Aztec Alpha Testnet' : '🔧 Aztec Sandbox (демо)'}
                </h3>
                <p className="text-sm text-blue-700">
                  {network === 'testnet' 
                    ? 'Подключен к реальной тестовой сети Aztec. Все операции происходят на блокчейне.'
                    : 'Демо режим для тестирования. Данные сохраняются локально в браузере.'
                  }
                </p>
              </div>
              <NetworkSelector 
                currentNetwork={network}
                onNetworkChange={handleNetworkChange}
                disabled={false}
              />
            </div>
          </div>
        </div>

        {/* Табы для фильтрации аукционов */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Активные аукционы
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Завершенные аукционы
              </button>
            </nav>
          </div>
        </div>

        {/* Список аукционов */}
        <AuctionList 
          key={refreshKey}
          onBidClick={handleBidClick} 
          filterType={activeTab}
        />
      </main>

      {/* Модальные окна */}
      <CreateAuctionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAuctionCreated={handleAuctionCreated}
      />

      <BidModal 
        isOpen={isBidModalOpen}
        auctionId={selectedAuctionId}
        onClose={() => {
          setIsBidModalOpen(false)
          setSelectedAuctionId(null)
        }}
      />
    </div>
  )
} 