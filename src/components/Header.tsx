'use client'

interface HeaderProps {
  walletAddress: string
  onDisconnect: () => void
  onCreateAuction: () => void
}

export default function Header({ walletAddress, onDisconnect, onCreateAuction }: HeaderProps) {
  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              🔒 Приватные Аукционы
            </h1>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Powered by Aztec
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onCreateAuction}
              className="btn-primary"
            >
              + Создать Аукцион
            </button>
            
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {formatAddress(walletAddress)}
              </span>
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