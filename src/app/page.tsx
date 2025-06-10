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
      <div className="min-h-screen flex items-center justify-center py-8">
        <div className="text-center max-w-3xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Private Auctions
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-6 max-w-xl mx-auto">
            Private auction platform powered by Aztec Network. Your bids remain confidential until auction ends.
          </p>

          {/* Mode Selection */}
          <ModeSelector 
            currentMode={appMode}
            onModeChange={handleModeChange}
            className="mb-6"
          />

          {/* Connection Component */}
          {walletMode === 'aztec' ? (
            <div>
              <AztecWalletConnect 
                onWalletConnected={handleWalletConnected}
                onError={setWalletError}
                onLogoutComplete={handleDisconnectWallet}
              />
              {walletError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded max-w-md mx-auto">
                  <p className="text-sm">{walletError}</p>
                  <button 
                    onClick={() => handleModeChange('demo')}
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
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="card text-center py-4">
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="text-base font-semibold mb-1">Complete Privacy</h3>
              <p className="text-sm text-gray-600">Encrypted bids until auction ends</p>
            </div>
            <div className="card text-center py-4">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="text-base font-semibold mb-1">Zero-Knowledge</h3>
              <p className="text-sm text-gray-600">Advanced zk-proofs security</p>
            </div>
            <div className="card text-center py-4">
              <div className="text-2xl mb-2">🏆</div>
              <h3 className="text-base font-semibold mb-1">Fair Trading</h3>
              <p className="text-sm text-gray-600">Automatic winner determination</p>
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
        appMode={appMode}
        onModeChange={handleModeChange}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Network Status */}
        <NetworkStatusAlert />

        {/* Compact Mode and Network Information */}
        <div className="mb-4">
          <div className={`border rounded-lg p-3 ${
            appMode === 'demo' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-3">
              <ModeIndicator 
                mode={appMode}
                network={network}
                onClick={() => setIsModeToggleModalOpen(true)}
              />
              <div>
                <h3 className={`text-sm font-medium ${
                  appMode === 'demo' ? 'text-green-900' : 'text-blue-900'
                }`}>
                  {appMode === 'demo' 
                    ? '🎮 Demo Mode'
                    : `🌐 Real Mode - ${network === 'testnet' ? 'Testnet' : 'Sandbox'}`
                  }
                </h3>
                <p className={`text-xs ${
                  appMode === 'demo' ? 'text-green-700' : 'text-blue-700'
                }`}>
                  {appMode === 'demo'
                    ? 'Simulated operations, data stored locally'
                    : network === 'testnet' 
                      ? 'Connected to Aztec Alpha Testnet'
                      : 'Connected to local Aztec Sandbox'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Tabs for auction filtering */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6">
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