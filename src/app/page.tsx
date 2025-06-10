'use client'

import { useState, useEffect } from 'react'
import { useAztec } from '@/lib/aztec-context'
import Header from '@/components/Header'
import AuctionList from '@/components/AuctionList'
import CreateAuctionModal from '@/components/CreateAuctionModal'
import BidModal from '@/components/BidModal'
import AztecWalletConnect from '@/components/AztecWalletConnect'
import WalletConnect from '@/components/WalletConnect'

import NetworkStatusAlert from '@/components/NetworkStatusAlert'
import ModeSelector, { AppMode } from '@/components/ModeSelector'
import ModeIndicator from '@/components/ModeIndicator'
import ModeToggleModal from '@/components/ModeToggleModal'

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isBidModalOpen, setIsBidModalOpen] = useState(false)
  const [isModeToggleModalOpen, setIsModeToggleModalOpen] = useState(false)
  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null)
  const [appMode, setAppMode] = useState<AppMode>('demo')
  const [walletMode, setWalletMode] = useState<'aztec' | 'demo'>('demo')
  const [walletError, setWalletError] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')
  const [refreshKey, setRefreshKey] = useState(0)

  // Using Aztec context
  const { 
    network, 
    isConnected, 
    walletAddress, 
    switchNetwork, 
    connectWallet, 
    disconnect 
  } = useAztec()

  // Sync app mode with wallet mode
  useEffect(() => {
    setAppMode(walletMode === 'demo' ? 'demo' : 'real')
  }, [walletMode])

  useEffect(() => {
    // Check wallet connection state on load
    const savedMode = localStorage.getItem('walletMode') as 'aztec' | 'demo'
    const walletDisconnected = localStorage.getItem('aztecWalletDisconnected')
    
    if (savedMode === 'demo') {
      // For demo mode always restore state
      setWalletMode(savedMode)
      setAppMode('demo')
    } else if (savedMode === 'aztec' && walletDisconnected !== 'true') {
      // For Aztec restore only if user wasn't explicitly disconnected
      setWalletMode(savedMode || 'aztec')
      setAppMode('real')
    }
  }, [])

  const handleModeChange = async (newMode: AppMode) => {
    const newWalletMode = newMode === 'demo' ? 'demo' : 'aztec'
    
    // Disconnect current wallet if connected
    if (isConnected) {
      handleDisconnectWallet()
    }
    
    setAppMode(newMode)
    setWalletMode(newWalletMode)
    setWalletError('')
    
    // Clear any error states
    localStorage.removeItem('aztecConnectedWallet')
    
    console.log(`Mode switched to: ${newMode}`)
  }

  const handleWalletConnected = async (address: string) => {
    try {
      // Connect wallet through Aztec context
      const aztecAddress = await connectWallet()
      localStorage.setItem('walletAddress', aztecAddress)
      localStorage.setItem('walletMode', walletMode)
      localStorage.setItem('aztecNetwork', network)
      // Clear logout flag only on new connection
      localStorage.removeItem('privyLoggedOut')
    } catch (error) {
      console.error('Error connecting Aztec wallet:', error)
    }
  }

  const handleDisconnectWallet = () => {
    // Set disconnect flag for Aztec wallets
    if (walletMode === 'aztec') {
      localStorage.setItem('aztecWalletDisconnected', 'true')
    }
    
    // Disconnect through Aztec context
    disconnect()
    
    setWalletError('')
    localStorage.removeItem('walletAddress')
    localStorage.removeItem('walletMode')
    localStorage.removeItem('aztecNetwork')
    localStorage.removeItem('aztecConnectedWallet')
  }

  const handleNetworkChange = async (newNetwork: 'sandbox' | 'testnet') => {
    try {
      await switchNetwork(newNetwork)
      localStorage.setItem('aztecNetwork', newNetwork)
      console.log(`Switching to ${newNetwork}`)
    } catch (error) {
      console.error('Error switching network:', error)
    }
  }

  const handleBidClick = (auctionId: number) => {
    setSelectedAuctionId(auctionId)
    setIsBidModalOpen(true)
  }

  const handleAuctionCreated = () => {
    // Force refresh auction list
    setRefreshKey(prev => prev + 1)
    console.log('Auction created, refreshing list')
  }

  const handleBidPlaced = () => {
    // Force refresh auction list after placing bid
    setRefreshKey(prev => prev + 1)
    console.log('Bid placed, refreshing list')
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Mesh gradient background */}
          <div className="absolute inset-0 mesh-gradient opacity-50"></div>
          
          {/* Floating orbs */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/30 to-purple-600/30 rounded-full blur-3xl floating-animation"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/30 to-pink-600/30 rounded-full blur-3xl floating-animation" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl pulse-glow"></div>
          
          {/* Animated particles */}
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>

        <div className="text-center max-w-6xl mx-auto px-6 relative z-10">
          {/* Hero Title */}
          <div className="mb-8">
            <h1 className="hero-title mb-6 animate-fade-in">
              Private Auctions
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
          </div>
          
          {/* Hero Subtitle */}
          <p className="hero-subtitle mb-12 max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
            Добро пожаловать на платформу приватных аукционов на основе технологии Aztec Network. 
            <br />
            <span className="gradient-text">Ваши ставки остаются полностью конфиденциальными до завершения аукциона.</span>
          </p>

          {/* Mode Selection */}
          <div className="mb-12 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <ModeSelector 
              currentMode={appMode}
              onModeChange={handleModeChange}
              className="glow-effect"
            />
          </div>

          {/* Connection Component */}
          <div className="mb-16 animate-fade-in" style={{animationDelay: '0.6s'}}>
            {walletMode === 'aztec' ? (
              <div className="glass-morphism p-8 max-w-md mx-auto">
                <AztecWalletConnect 
                  onWalletConnected={handleWalletConnected}
                  onError={setWalletError}
                  onLogoutComplete={handleDisconnectWallet}
                />
                {walletError && (
                  <div className="mt-6 p-4 bg-red-500/20 border border-red-400/50 text-red-200 rounded-xl backdrop-blur-sm">
                    <p className="text-sm">{walletError}</p>
                    <button 
                      onClick={() => handleModeChange('demo')}
                      className="mt-3 text-xs underline text-red-300 hover:text-red-100 transition-colors"
                    >
                      Переключиться в демо режим
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-morphism p-8 max-w-md mx-auto">
                <WalletConnect onWalletConnected={handleWalletConnected} network={network} />
              </div>
            )}
          </div>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card-feature text-center animate-fade-in" style={{animationDelay: '0.8s'}}>
              <div className="text-6xl mb-6 filter drop-shadow-lg">🔒</div>
              <h3 className="text-2xl font-bold mb-4 gradient-text">Полная Приватность</h3>
              <p className="text-white/80 leading-relaxed">Ваши ставки зашифрованы и невидимы до завершения аукциона</p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-b-3xl"></div>
            </div>
            
            <div className="card-feature text-center animate-fade-in" style={{animationDelay: '1.0s'}}>
              <div className="text-6xl mb-6 filter drop-shadow-lg">⚡</div>
              <h3 className="text-2xl font-bold mb-4 gradient-text">Zero-Knowledge</h3>
              <p className="text-white/80 leading-relaxed">Использует передовые zk-доказательства для обеспечения безопасности</p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-b-3xl"></div>
            </div>
            
            <div className="card-feature text-center animate-fade-in" style={{animationDelay: '1.2s'}}>
              <div className="text-6xl mb-6 filter drop-shadow-lg">🏆</div>
              <h3 className="text-2xl font-bold mb-4 gradient-text">Честная Торговля</h3>
              <p className="text-white/80 leading-relaxed">Победитель определяется автоматически без возможности манипуляций</p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-b-3xl"></div>
            </div>
          </div>

          {/* Additional decorative elements */}
          <div className="mt-16 flex justify-center space-x-8 opacity-40">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
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
        appMode={appMode}
        onModeChange={handleModeChange}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Network Status */}
        <NetworkStatusAlert />

        {/* Current Mode and Network Information */}
        <div className="mb-8">
          <div className={`glass-morphism p-6 border transition-all duration-300 ${
            appMode === 'demo' 
              ? 'border-emerald-400/30 bg-emerald-500/10' 
              : 'border-indigo-400/30 bg-indigo-500/10'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ModeIndicator 
                  mode={appMode}
                  network={network}
                  onClick={() => setIsModeToggleModalOpen(true)}
                />
                <div>
                  <h3 className={`text-sm font-semibold ${
                    appMode === 'demo' ? 'text-emerald-300' : 'text-indigo-300'
                  }`}>
                    {appMode === 'demo' 
                      ? '🎮 Демо режим - Симуляция работы'
                      : `🌐 Реальный режим - ${network === 'testnet' ? 'Aztec Alpha Testnet' : 'Aztec Sandbox'}`
                    }
                  </h3>
                  <p className={`text-sm ${
                    appMode === 'demo' ? 'text-emerald-200/80' : 'text-indigo-200/80'
                  }`}>
                    {appMode === 'demo'
                      ? 'Все операции имитируются. Данные хранятся локально в браузере.'
                      : network === 'testnet' 
                        ? 'Подключено к настоящей тестовой сети Aztec. Все операции происходят в блокчейне.'
                        : 'Подключено к локальному Aztec Sandbox для разработки.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for auction filtering */}
        <div className="mb-8">
          <div className="glass-morphism p-2 inline-flex rounded-2xl">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-3 px-6 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === 'active'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Активные Аукционы
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-3 px-6 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === 'completed'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Завершенные Аукционы
              </button>
            </nav>
          </div>
        </div>

        {/* Auction List */}
        <AuctionList 
          key={refreshKey}
          onBidClick={handleBidClick} 
          filterType={activeTab}
        />
      </main>

      {/* Modal Windows */}
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
        onBidPlaced={handleBidPlaced}
      />

      {/* Mode Toggle Modal */}
      <ModeToggleModal
        isOpen={isModeToggleModalOpen}
        currentMode={appMode}
        network={network}
        onClose={() => setIsModeToggleModalOpen(false)}
        onModeChange={handleModeChange}
      />
    </div>
  )
} 