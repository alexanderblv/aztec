'use client'

import { useState, useEffect } from 'react'

interface Auction {
  id: number
  itemName: string
  description: string
  startTime: number
  endTime: number
  minBid: number
  creator: string
  isActive: boolean
  winner?: string
  winningBid?: number
}

interface AuctionListProps {
  onBidClick: (auctionId: number) => void
}

export default function AuctionList({ onBidClick }: AuctionListProps) {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Загружаем демо-данные аукционов
    const loadAuctions = async () => {
      setLoading(true)
      
      // Имитация загрузки данных
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockAuctions: Auction[] = [
        {
          id: 1,
          itemName: 'Редкая винтажная картина',
          description: 'Оригинальная картина 1950-х годов в отличном состоянии',
          startTime: Date.now() - 3600000, // час назад
          endTime: Date.now() + 3600000, // через час
          minBid: 1000,
          creator: '0x1234...5678',
          isActive: true,
        },
        {
          id: 2,
          itemName: 'Коллекционные часы Rolex',
          description: 'Винтажные часы Rolex Submariner 1970-го года',
          startTime: Date.now() - 7200000, // 2 часа назад
          endTime: Date.now() + 1800000, // через 30 минут
          minBid: 5000,
          creator: '0xabcd...efgh',
          isActive: true,
        },
        {
          id: 3,
          itemName: 'Первое издание книги',
          description: 'Первое издание "Война и мир" Л.Н. Толстого',
          startTime: Date.now() - 10800000, // 3 часа назад
          endTime: Date.now() - 1800000, // закончился 30 минут назад
          minBid: 2000,
          creator: '0x9999...1111',
          isActive: false,
          winner: '0x5555...3333',
          winningBid: 3500,
        },
      ]
      
      setAuctions(mockAuctions)
      setLoading(false)
    }

    loadAuctions()
  }, [])

  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now()
    const remaining = endTime - now
    
    if (remaining <= 0) {
      return 'Завершен'
    }
    
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`
    }
    return `${minutes}м`
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (auctions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏛️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Пока нет активных аукционов
        </h3>
        <p className="text-gray-600">
          Создайте первый аукцион и начните торги!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {auctions.map((auction) => (
        <div key={auction.id} className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex-1">
              {auction.itemName}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              auction.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {auction.isActive ? 'Активен' : 'Завершен'}
            </span>
          </div>

          <p className="text-gray-600 mb-4 text-sm">
            {auction.description}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Мин. ставка:</span>
              <span className="font-medium">{auction.minBid} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Создатель:</span>
              <span className="font-medium">{formatAddress(auction.creator)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                {auction.isActive ? 'Осталось:' : 'Статус:'}
              </span>
              <span className={`font-medium ${
                auction.isActive ? 'text-primary-600' : 'text-gray-600'
              }`}>
                {formatTimeRemaining(auction.endTime)}
              </span>
            </div>
          </div>

          {auction.isActive ? (
            <button
              onClick={() => onBidClick(auction.id)}
              className="w-full btn-primary"
            >
              🔒 Сделать приватную ставку
            </button>
          ) : auction.winner ? (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Победитель:</div>
              <div className="font-medium text-gray-900">
                {formatAddress(auction.winner)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Выигрышная ставка: {auction.winningBid} ETH
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <span className="text-gray-600">Победитель не определен</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 