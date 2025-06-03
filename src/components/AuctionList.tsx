'use client'

import { useState, useEffect } from 'react'
import { aztecDemoService } from '@/lib/aztec-demo'
import { AztecService } from '@/lib/aztec'

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
  filterType: 'active' | 'completed'
}

export default function AuctionList({ onBidClick, filterType }: AuctionListProps) {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)

  // Определяем сервис на основе сохраненной сети
  const getAztecService = () => {
    if (typeof window === 'undefined') return aztecDemoService
    
    const network = localStorage.getItem('aztecNetwork') || 'sandbox'
    return network === 'testnet' ? new AztecService() : aztecDemoService
  }

  useEffect(() => {
    // Загружаем реальные аукционы из сервиса
    const loadAuctions = async () => {
      setLoading(true)
      
      try {
        const service = getAztecService()
        let auctionsList: Auction[] = []
        
        if (service === aztecDemoService) {
          // Для демо-режима используем демо данные
          const demoAuctions = await service.getAllAuctions()
          auctionsList = demoAuctions.map(auction => ({
            id: auction.id,
            itemName: auction.itemName,
            description: auction.description,
            startTime: auction.startTime,
            endTime: auction.endTime,
            minBid: auction.minBid,
            creator: auction.creator,
            isActive: auction.isActive,
            winner: undefined,
            winningBid: undefined
          }))
          
          // Если нет аукционов в демо сервисе, создаем пример
          if (auctionsList.length === 0) {
            const mockAuctions: Auction[] = [
              {
                id: 1,
                itemName: 'Редкая винтажная картина',
                description: 'Оригинальная картина 1950-х годов в отличном состоянии',
                startTime: Date.now() - 3600000,
                endTime: Date.now() + 3600000,
                minBid: 1000,
                creator: '0x1234...5678',
                isActive: true,
              },
              {
                id: 2,
                itemName: 'Коллекционные часы Rolex',
                description: 'Винтажные часы Rolex Submariner 1970-го года',
                startTime: Date.now() - 7200000,
                endTime: Date.now() + 1800000,
                minBid: 5000,
                creator: '0xabcd...efgh',
                isActive: true,
              },
              {
                id: 3,
                itemName: 'Первое издание книги',
                description: 'Первое издание "Война и мир" Л.Н. Толстого',
                startTime: Date.now() - 10800000,
                endTime: Date.now() - 1800000,
                minBid: 2000,
                creator: '0x9999...1111',
                isActive: false,
                winner: '0x5555...3333',
                winningBid: 3500,
              },
              {
                id: 4,
                itemName: 'Антикварная ваза',
                description: 'Китайская ваза династии Цин, XVIII век',
                startTime: Date.now() - 14400000,
                endTime: Date.now() - 3600000,
                minBid: 1500,
                creator: '0x7777...8888',
                isActive: false,
                winner: '0x2222...4444',
                winningBid: 2800,
              },
              {
                id: 5,
                itemName: 'Винтажный мотоцикл',
                description: 'Harley-Davidson 1960 года, отреставрированный',
                startTime: Date.now() - 21600000,
                endTime: Date.now() - 7200000,
                minBid: 8000,
                creator: '0xaaaa...bbbb',
                isActive: false,
                winner: '0xcccc...dddd',
                winningBid: 12500,
              },
            ]
            auctionsList = mockAuctions
          }
        } else {
          // Для testnet пытаемся загрузить реальные аукционы
          try {
            const auctionCount = await service.getAuctionCount()
            
            for (let i = 1; i <= auctionCount; i++) {
              try {
                const auctionInfo = await service.getAuctionInfo(i)
                if (auctionInfo) {
                  const isActive = Date.now() < auctionInfo.endTime && auctionInfo.isActive
                  let winner = undefined
                  let winningBid = undefined
                  
                  if (!isActive) {
                    try {
                      const winnerInfo = await service.getWinner(i)
                      if (winnerInfo) {
                        winner = winnerInfo.address
                        winningBid = winnerInfo.winningBid
                      }
                    } catch (error) {
                      // Игнорируем ошибки получения победителя
                    }
                  }
                  
                  auctionsList.push({
                    id: i,
                    itemName: auctionInfo.itemName,
                    description: auctionInfo.description,
                    startTime: auctionInfo.startTime,
                    endTime: auctionInfo.endTime,
                    minBid: auctionInfo.minBid,
                    creator: auctionInfo.creator,
                    isActive,
                    winner,
                    winningBid
                  })
                }
              } catch (error) {
                console.warn(`Не удалось загрузить аукцион ${i}:`, error)
              }
            }
            
            // Если нет реальных аукционов, показываем тестовые
            if (auctionsList.length === 0) {
              const testAuctions: Auction[] = [
                {
                  id: 1,
                  itemName: 'Тестовый аукцион Testnet #1',
                  description: 'Первый тестовый аукцион на Aztec Testnet',
                  startTime: Date.now() - 3600000,
                  endTime: Date.now() + 7200000,
                  minBid: 100,
                  creator: 'testnet_user',
                  isActive: true,
                }
              ]
              auctionsList = testAuctions
            }
          } catch (error) {
            console.error('Ошибка загрузки аукционов из testnet:', error)
            // Показываем тестовые аукционы в случае ошибки
            const testAuctions: Auction[] = [
              {
                id: 1,
                itemName: 'Тестовый аукцион (оффлайн)',
                description: 'Аукцион недоступен - проблемы с подключением к testnet',
                startTime: Date.now() - 3600000,
                endTime: Date.now() + 7200000,
                minBid: 100,
                creator: 'offline_user',
                isActive: false,
              }
            ]
            auctionsList = testAuctions
          }
        }
        
        setAuctions(auctionsList)
      } catch (error) {
        console.error('Общая ошибка загрузки аукционов:', error)
        // В случае любой ошибки показываем базовые демо аукционы
        setAuctions([])
      } finally {
        setLoading(false)
      }
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

  // Фильтруем аукционы в зависимости от выбранной вкладки
  const filteredAuctions = auctions.filter(auction => {
    return filterType === 'active' ? auction.isActive : !auction.isActive
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <div className="ml-4 text-gray-600">
          Загрузка аукционов из Aztec {typeof window !== 'undefined' && localStorage.getItem('aztecNetwork') === 'testnet' ? 'Testnet' : 'Sandbox'}...
        </div>
      </div>
    )
  }

  if (filteredAuctions.length === 0) {
    const network = typeof window !== 'undefined' ? localStorage.getItem('aztecNetwork') || 'sandbox' : 'sandbox'
    
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏛️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {filterType === 'active' 
            ? 'Пока нет активных аукционов' 
            : 'Пока нет завершенных аукционов'
          }
        </h3>
        <p className="text-gray-600 mb-4">
          {filterType === 'active' 
            ? 'Создайте первый аукцион и начните торги!' 
            : 'Завершенные аукционы появятся здесь после окончания торгов.'
          }
        </p>
        <p className="text-sm text-blue-600">
          Текущая сеть: {network === 'testnet' ? 'Aztec Alpha Testnet' : 'Aztec Sandbox (демо)'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Загружено {filteredAuctions.length} аукцион(ов) из {typeof window !== 'undefined' && localStorage.getItem('aztecNetwork') === 'testnet' ? 'Aztec Testnet' : 'Aztec Sandbox'}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuctions.map((auction) => (
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
              
              {auction.winner && auction.winningBid && (
                <div className="bg-green-50 p-2 rounded mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">Победитель:</span>
                    <span className="font-medium text-green-800">{formatAddress(auction.winner)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">Выигрышная ставка:</span>
                    <span className="font-medium text-green-800">{auction.winningBid} ETH</span>
                  </div>
                </div>
              )}
            </div>

            {auction.isActive ? (
              <button
                onClick={() => onBidClick(auction.id)}
                className="w-full btn-primary"
              >
                🔒 Сделать приватную ставку
              </button>
            ) : (
              <div className="text-center text-gray-500 text-sm py-2">
                Аукцион завершен
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 