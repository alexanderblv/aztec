'use client'

interface HeaderProps {
  walletAddress: string
  onDisconnect: () => void
  onCreateAuction: () => void
  walletMode?: 'privy' | 'demo'
  network?: 'sandbox' | 'testnet'
}

export default function Header({ 
  walletAddress, 
  onDisconnect, 
  onCreateAuction,
  walletMode = 'demo',
  network = 'sandbox'
}: HeaderProps) {
  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkColor = () => {
    return network === 'testnet' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
  }

  const getWalletModeColor = () => {
    return walletMode === 'privy' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
  }

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              🔒 Приватные Аукционы
            </h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Powered by Aztec
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getNetworkColor()}`}>
                {network === 'testnet' ? 'Testnet' : 'Sandbox'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onCreateAuction}
              className="btn-primary"
            >
              + Создать Аукцион
            </button>
            
            <div className="flex items-center space-x-3">
              <div className={`text-xs px-2 py-1 rounded-full font-medium ${getWalletModeColor()}`}>
                {walletMode === 'privy' ? 'Privy' : 'Demo'}
              </div>
              
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${network === 'testnet' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {formatAddress(walletAddress)}
                </span>
              </div>
            </div>

            <button
              onClick={onDisconnect}
              className="btn-secondary text-sm"
            >
              Отключить
            </button>
          </div>
        </div>
      </div>
    </header>
  )
} 