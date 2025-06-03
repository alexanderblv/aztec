'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import AuctionList from '@/components/AuctionList'
import CreateAuctionModal from '@/components/CreateAuctionModal'
import BidModal from '@/components/BidModal'
import PrivyWalletConnectFull from '@/components/PrivyWalletConnectFull'

export default function Home() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isBidModalOpen, setIsBidModalOpen] = useState(false)
  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null)
  const [walletAddress, setWalletAddress] = useState<string>('')

  useEffect(() => {
    // Проверяем состояние подключения кошелька при загрузке
    const savedAddress = localStorage.getItem('walletAddress')
    if (savedAddress) {
      setWalletAddress(savedAddress)
      setIsWalletConnected(true)
    }
  }, [])

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address)
    setIsWalletConnected(true)
    localStorage.setItem('walletAddress', address)
  }

  const handleDisconnectWallet = () => {
    setIsWalletConnected(false)
    setWalletAddress('')
    localStorage.removeItem('walletAddress')
  }

  const handleBidClick = (auctionId: number) => {
    setSelectedAuctionId(auctionId)
    setIsBidModalOpen(true)
  }

  if (!isWalletConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Приватные Аукционы
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Добро пожаловать на платформу приватных аукционов, работающую на технологии Aztec Network. 
            Здесь ваши ставки остаются полностью конфиденциальными до завершения торгов.
          </p>
          <PrivyWalletConnectFull onWalletConnected={handleWalletConnected} />
          
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
            Активные Аукционы
          </h1>
          <p className="text-gray-600">
            Участвуйте в приватных аукционах. Ваши ставки останутся конфиденциальными до завершения торгов.
          </p>
        </div>

        <AuctionList onBidClick={handleBidClick} />
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