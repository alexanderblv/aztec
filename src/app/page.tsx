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
import { walletConflictResolver } from '@/lib/wallet-conflict-resolver'

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

  // Using unified Aztec context
  const { service, connectWallet, disconnect, isConnected, walletAddress, network, switchNetwork, connectRealWallet } = useAztec()

  // Sync app mode with wallet mode
  useEffect(() => {
    setAppMode(walletMode === 'demo' ? 'demo' : 'real')
  }, [walletMode])

  useEffect(() => {
    // Initialize wallet conflict resolver
    const initializeWalletResolver = async () => {
      try {
        const conflicts = walletConflictResolver.detectConflicts()
        if (conflicts.hasConflicts) {
          console.log('Wallet conflicts detected:', conflicts.wallets)
          console.log('Wallet conflicts detected, attempting automatic resolution...')
          await walletConflictResolver.resolveConflicts()
          console.log('Wallet conflict resolution applied')
        } else {
          console.log('Mode switched to:', appMode)
          if (conflicts.wallets.includes('MetaMask') && !conflicts.wallets.includes('Azguard')) {
            console.log('MetaMask detected without Azguard integration')
          }
        }
      } catch (error) {
        console.error('Error in wallet conflict resolution:', error)
      }
    }

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

    // Initialize wallet resolver
    initializeWalletResolver()
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
      // In Real Mode with Aztec wallets, use the connected wallet address directly
      if (walletMode === 'aztec' && appMode === 'real') {
        // The address is already from the real connected wallet (Azguard, Obsidion etc.)
        // Use the new connectRealWallet function instead of creating a new demo wallet
        connectRealWallet(address)
        localStorage.setItem('aztecNetwork', network)
        console.log('Real wallet connected with address:', address)
      } else {
        // For demo mode, connect through Aztec context (creates new wallet)
        const aztecAddress = await connectWallet()
        localStorage.setItem('walletAddress', aztecAddress)
        localStorage.setItem('walletMode', walletMode)
        localStorage.setItem('aztecNetwork', network)
        console.log('Demo wallet created with address:', aztecAddress)
      }
      
      // Clear logout flag only on new connection
      localStorage.removeItem('privyLoggedOut')
    } catch (error) {
      console.error('Error connecting wallet:', error)
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
        <div className="max-w-lg mx-auto px-4 w-full">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Private Auctions
            </h1>
            <p className="text-gray-600 mb-6">
              Secure bidding powered by Aztec Network
            </p>
            <div className="inline-flex items-center gap-4 text-xs bg-gray-50 px-4 py-2 rounded-full">
              <span className="flex items-center gap-1">🔒 Private</span>
              <span className="flex items-center gap-1">⚡ ZK-Proofs</span>
              <span className="flex items-center gap-1">🏆 Fair</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Mode Selection */}
            <div>
              <ModeSelector 
                currentMode={appMode}
                onModeChange={handleModeChange}
              />
            </div>

            {/* Connection */}
            <div>
              {walletMode === 'aztec' ? (
                <div>
                  <AztecWalletConnect 
                    onWalletConnected={handleWalletConnected}
                    onError={setWalletError}
                    onLogoutComplete={handleDisconnectWallet}
                  />
                  {walletError && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
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