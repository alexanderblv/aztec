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
    <header className="glass-morphism backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold gradient-text">
              🔒 Private Auctions
            </h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-indigo-300/80 bg-indigo-500/20 px-3 py-1 rounded-full backdrop-blur-sm border border-indigo-400/30">
                Powered by Aztec
              </span>
              {appMode === 'real' && (
                <span className={`text-xs px-3 py-1 rounded-full font-medium backdrop-blur-sm border ${
                  network === 'testnet' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
                    : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                }`}>
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
              ✨ Создать Аукцион
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 glass-morphism px-4 py-2 border border-white/20">
                <div className={`w-3 h-3 rounded-full shadow-lg ${
                  appMode === 'demo' 
                    ? 'bg-emerald-400 shadow-emerald-400/50' 
                    : network === 'testnet' 
                      ? 'bg-indigo-400 shadow-indigo-400/50' 
                      : 'bg-slate-400 shadow-slate-400/50'
                } animate-pulse`}></div>
                <span className="text-sm font-medium text-white/90">
                  {formatAddress(walletAddress)}
                </span>
              </div>
            </div>

            <button
              onClick={onDisconnect}
              className="btn-secondary text-sm"
            >
              Отключиться
            </button>
          </div>
        </div>

        {/* Mobile Mode Indicator */}
        <div className="sm:hidden mt-4 flex justify-center">
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