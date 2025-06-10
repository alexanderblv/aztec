'use client'

import ModeIndicator, { AppMode } from './ModeIndicator'

interface HeaderProps {
  walletAddress: string
  onDisconnect: () => void
  onCreateAuction: () => void
  walletMode?: 'privy' | 'demo' | 'aztec'
  network?: 'sandbox' | 'testnet'
  appMode?: AppMode
  onModeChange?: (mode: AppMode) => void
}

export default function Header({ 
  walletAddress, 
  onDisconnect, 
  onCreateAuction,
  walletMode = 'demo',
  network = 'sandbox',
  appMode = 'demo',
  onModeChange
}: HeaderProps) {
  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkColor = () => {
    return network === 'testnet' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
  }

  const handleModeToggle = () => {
    if (onModeChange) {
      const newMode: AppMode = appMode === 'demo' ? 'real' : 'demo'
      onModeChange(newMode)
    }
  }

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              🔒 Private Auctions
            </h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Powered by Aztec
              </span>
              {appMode === 'real' && (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getNetworkColor()}`}>
                  {network === 'testnet' ? 'Testnet' : 'Sandbox'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mode Indicator */}
            <ModeIndicator 
              mode={appMode}
              network={network}
              onClick={onModeChange ? handleModeToggle : undefined}
              className="hidden sm:flex"
            />

            <button
              onClick={onCreateAuction}
              className="btn-primary"
            >
              + Create Auction
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  appMode === 'demo' 
                    ? 'bg-green-500' 
                    : network === 'testnet' 
                      ? 'bg-blue-500' 
                      : 'bg-gray-500'
                }`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {formatAddress(walletAddress)}
                </span>
              </div>
            </div>

            <button
              onClick={onDisconnect}
              className="btn-secondary text-sm"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Mobile Mode Indicator */}
        <div className="sm:hidden mt-3 flex justify-center">
          <ModeIndicator 
            mode={appMode}
            network={network}
            onClick={onModeChange ? handleModeToggle : undefined}
          />
        </div>
      </div>
    </header>
  )
} 