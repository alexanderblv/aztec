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

  // Using Aztec context
  const { 
    network, 
    isConnected, 
    walletAddress, 
    switchNetwork, 
    connectWallet, 
    disconnect 
  } = useAztec()

  useEffect(() => {
    // Check wallet connection state on load
    const savedMode = localStorage.getItem('walletMode') as 'privy' | 'demo'
    const privyLoggedOut = localStorage.getItem('privyLoggedOut')
    
    if (savedMode === 'demo') {
      // For demo mode always restore state
      setWalletMode(savedMode)
    } else if (savedMode === 'privy' && privyLoggedOut !== 'true') {
      // For Privy restore only if user wasn't explicitly disconnected
      setWalletMode(savedMode || 'privy')
    }
  }, [])

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
    // Set disconnect flag for Privy wallets
    if (walletMode === 'privy') {
      localStorage.setItem('privyLoggedOut', 'true')
    }
    
    // Disconnect through Aztec context
    disconnect()
    
    setPrivyError('')
    localStorage.removeItem('walletAddress')
    localStorage.removeItem('walletMode')
    localStorage.removeItem('aztecNetwork')
    
    // Force page reload to fully clear Privy state
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Private Auctions
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Welcome to the private auction platform powered by Aztec Network technology. 
            Here your bids remain completely confidential until the auction ends.
          </p>

          {/* Aztec Network Selection */}
          <NetworkSelector 
            currentNetwork={network}
            onNetworkChange={handleNetworkChange}
            disabled={false}
          />

          {/* Connection Type Selection */}
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
                Privy (Real Wallets)
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
                Demo Mode
              </button>
            </div>
          </div>

          {/* Connection Component */}
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
                    Switch to demo mode
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
              <h3 className="text-lg font-semibold mb-2">Complete Privacy</h3>
              <p className="text-gray-600">Your bids are encrypted and invisible until the auction ends</p>
            </div>
            <div className="card text-center">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Zero-Knowledge</h3>
              <p className="text-gray-600">Uses advanced zk-proofs to ensure security</p>
            </div>
            <div className="card text-center">
              <div className="text-3xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold mb-2">Fair Trading</h3>
              <p className="text-gray-600">Winner determined automatically without possibility of manipulation</p>
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
        {/* Network Status */}
        <NetworkStatusAlert />

        {/* Current Network Information */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  {network === 'testnet' ? '🌐 Aztec Alpha Testnet' : '🔧 Aztec Sandbox (demo)'}
                </h3>
                <p className="text-sm text-blue-700">
                  {network === 'testnet' 
                    ? 'Connected to real Aztec testnet. All operations happen on the blockchain.'
                    : 'Demo mode for testing. Data is stored locally in the browser.'
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

        {/* Tabs for auction filtering */}
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
                Active Auctions
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Completed Auctions
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
      />
    </div>
  )
} 