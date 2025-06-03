'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import AuctionList from '@/components/AuctionList'
import CreateAuctionModal from '@/components/CreateAuctionModal'
import BidModal from '@/components/BidModal'
import PrivyWalletConnectFull from '@/components/PrivyWalletConnectFull'
import WalletConnect from '@/components/WalletConnect'
import NetworkSelector from '@/components/NetworkSelector'

export default function Home() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isBidModalOpen, setIsBidModalOpen] = useState(false)
  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [walletMode, setWalletMode] = useState<'privy' | 'demo'>('privy')
  const [aztecNetwork, setAztecNetwork] = useState<'sandbox' | 'testnet'>('sandbox')
  const [privyError, setPrivyError] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')

  useEffect(() => {
    // Проверяем состояние подключения кошелька при загрузке
    const savedAddress = localStorage.getItem('walletAddress')
    const savedMode = localStorage.getItem('walletMode') as 'privy' | 'demo'
    const savedNetwork = localStorage.getItem('aztecNetwork') as 'sandbox' | 'testnet'
    const privyLoggedOut = localStorage.getItem('privyLoggedOut')
    
    if (savedAddress && savedMode === 'demo') {
      // Для демо режима всегда восстанавливаем состояние
      setWalletAddress(savedAddress)
      setIsWalletConnected(true)
      setWalletMode(savedMode)
    } else if (savedAddress && savedMode === 'privy' && privyLoggedOut !== 'true') {
      // Для Privy восстанавливаем только если пользователь НЕ был явно отключен
      setWalletAddress(savedAddress)
      setIsWalletConnected(true)
      setWalletMode(savedMode)
    }
    
    if (savedNetwork) {
      setAztecNetwork(savedNetwork)
    }
    
    // НЕ очищаем флаг отключения при загрузке - это важно!
    // localStorage.removeItem('privyLoggedOut') - убираем эту строку
  }, [])

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address)
    setIsWalletConnected(true)
    localStorage.setItem('walletAddress', address)
    localStorage.setItem('walletMode', walletMode)
    localStorage.setItem('aztecNetwork', aztecNetwork)
    // Очищаем флаг logout только при новом подключении
    localStorage.removeItem('privyLoggedOut')
  }

  const handleDisconnectWallet = () => {
    // Устанавливаем флаг отключения для Privy кошельков
    if (walletMode === 'privy') {
      localStorage.setItem('privyLoggedOut', 'true')
    }
    
    // Сразу очищаем состояние для всех типов кошельков
    setIsWalletConnected(false)
    setWalletAddress('')
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

  const handleNetworkChange = (network: 'sandbox' | 'testnet') => {
    setAztecNetwork(network)
    localStorage.setItem('aztecNetwork', network)
    
    // Если кошелек уже подключен, переподключаемся к новой сети
    if (isWalletConnected) {
      // Здесь можно добавить логику переподключения к новой сети
      console.log(`Переключение на ${network}`)
    }
  }

  const handleBidClick = (auctionId: number) => {
    setSelectedAuctionId(auctionId)
    setIsBidModalOpen(true)
  }

  if (!isWalletConnected) {
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
            currentNetwork={aztecNetwork}
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
            <WalletConnect onWalletConnected={handleWalletConnected} />
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
        walletAddress={walletAddress}
        onDisconnect={handleDisconnectWallet}
        onCreateAuction={() => setIsCreateModalOpen(true)}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Аукционы
          </h1>
          <p className="text-gray-600">
            Участвуйте в приватных аукционах. Ваши ставки останутся конфиденциальными до завершения торгов.
          </p>
        </div>

        {/* Вкладки */}
        <div className="mb-6">
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

        <AuctionList onBidClick={handleBidClick} filterType={activeTab} />
      </main>

      <CreateAuctionModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
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