'use client'

import { useState, useEffect } from 'react'
import { useAztec } from '@/lib/aztec-context'
// import { aztecDemoService } from '@/lib/aztec-demo'
// import { AztecService } from '@/lib/aztec'

interface BidModalProps {
  isOpen: boolean
  auctionId: number | null
  onClose: () => void
}

interface AuctionInfo {
  id: number
  itemName: string
  minBid: number
  endTime: number
}

export default function BidModal({ isOpen, auctionId, onClose }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [auctionInfo, setAuctionInfo] = useState<AuctionInfo | null>(null)
  const [contractWarning, setContractWarning] = useState('')
  
  // Используем единый контекст Aztec
  const { service, isTestnet } = useAztec()

  useEffect(() => {
    if (isOpen && auctionId && service) {
      // Загружаем информацию об аукционе из реального сервиса
      const loadAuctionInfo = async () => {
        try {
          // Для демо-режима используем существующую логику
          if (!isTestnet) {
            const mockAuctions = [
              { id: 1, itemName: 'Редкая винтажная картина', minBid: 1000, endTime: Date.now() + 3600000 },
              { id: 2, itemName: 'Коллекционные часы Rolex', minBid: 5000, endTime: Date.now() + 1800000 },
            ]
            
            const auction = mockAuctions.find(a => a.id === auctionId)
            setAuctionInfo(auction || null)
          } else {
            // Для testnet пытаемся загрузить реальные данные
            try {
              const realAuctionInfo = await service.getAuctionInfo(auctionId)
              if (realAuctionInfo) {
                setAuctionInfo({
                  id: auctionId,
                  itemName: realAuctionInfo.itemName,
                  minBid: realAuctionInfo.minBid,
                  endTime: realAuctionInfo.endTime
                })
              }
            } catch (error) {
              console.warn('Не удалось загрузить информацию об аукционе, используем демо данные')
              const mockAuctions = [
                { id: 1, itemName: 'Тестовый аукцион 1', minBid: 100, endTime: Date.now() + 3600000 },
                { id: 2, itemName: 'Тестовый аукцион 2', minBid: 500, endTime: Date.now() + 1800000 },
              ]
              const auction = mockAuctions.find(a => a.id === auctionId)
              setAuctionInfo(auction || null)
            }
          }
        } catch (error) {
          console.error('Ошибка загрузки информации об аукционе:', error)
        }
      }
      
      loadAuctionInfo()
    }
  }, [isOpen, auctionId, service, isTestnet])

  // Проверяем состояние контракта при открытии модала
  useEffect(() => {
    if (isOpen && service && isTestnet) {
      // Для testnet проверяем доступность контракта
      const checkContractStatus = async () => {
        try {
          const contractAddress = service.getContractAddress()
          if (!contractAddress) {
            setContractWarning('Контракт Aztec еще не развернут в testnet. Переключитесь в демо режим (Sandbox) для тестирования функционала.')
          } else {
            setContractWarning('')
          }
        } catch (error) {
          setContractWarning('Ошибка проверки состояния контракта. Рекомендуется использовать демо режим.')
        }
      }
      
      checkContractStatus()
    } else {
      setContractWarning('')
    }
  }, [isOpen, service, isTestnet])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const amount = parseFloat(bidAmount)
      
      if (!amount || amount <= 0) {
        throw new Error('Введите корректную сумму ставки')
      }
      
      if (auctionInfo && amount < auctionInfo.minBid) {
        throw new Error(`Ставка должна быть не меньше ${auctionInfo.minBid} ETH`)
      }

      if (!service) {
        throw new Error('Сервис не инициализирован')
      }

      // Проверяем, подключен ли кошелек
      if (!service.getWalletAddress()) {
        throw new Error('Сначала подключите кошелек')
      }

      // Используем сервис из контекста
      if (auctionId) {
        await service.placeBid(auctionId, amount)
        
        setSuccess(true)
        console.log(`Приватная ставка ${amount} ETH отправлена для аукциона ${auctionId}`)
        
        setTimeout(() => {
          setSuccess(false)
          onClose()
          setBidAmount('')
        }, 2500)
      }
      
    } catch (err: any) {
      let errorMessage = err.message || 'Ошибка отправки ставки'
      
      // Обрабатываем специфические ошибки
      if (errorMessage.includes('Контракт не подключен') || errorMessage.includes('compiled contract')) {
        errorMessage = 'Контракт Aztec еще не развернут. Переключитесь в демо режим (Sandbox) для тестирования функционала.'
      } else if (errorMessage.includes('Кошелек не подключен')) {
        errorMessage = 'Сначала подключите кошелек в панели справа'
      }
      
      setError(errorMessage)
      console.error('Ошибка отправки ставки:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeRemaining = (endTime: number) => {
    const remaining = endTime - Date.now()
    if (remaining <= 0) return 'Завершен'
    
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`
    }
    return `${minutes}м`
  }

  if (!isOpen || !auctionInfo) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🔒 Приватная Ставка
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">
                Ставка зашифрована и отправлена!
              </h3>
              <p className="text-gray-600">
                Ваша ставка надежно скрыта до завершения аукциона.
              </p>
            </div>
          ) : (
            <div>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {auctionInfo.itemName}
                </h3>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Мин. ставка: {auctionInfo.minBid} ETH</span>
                  <span>Осталось: {formatTimeRemaining(auctionInfo.endTime)}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {contractWarning && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                  <div className="flex items-start">
                    <div className="text-yellow-600 mr-2">⚠️</div>
                    <div>
                      <h4 className="font-medium mb-1">Внимание</h4>
                      <p className="text-sm">{contractWarning}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Размер ставки (ETH) *
                  </label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="input-field"
                    placeholder={`Минимум ${auctionInfo.minBid} ETH`}
                    min={auctionInfo.minBid}
                    step="0.001"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                    🔒 Как работает приватность
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ваша ставка шифруется на устройстве</li>
                    <li>• Никто не видит размер вашей ставки</li>
                    <li>• Победитель определяется zk-доказательствами</li>
                    <li>• Раскрывается только факт победы</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="text-yellow-600 mr-2">⚠️</div>
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">
                        Важно помнить
                      </h4>
                      <p className="text-sm text-yellow-800">
                        После отправки ставку нельзя изменить или отозвать. 
                        Убедитесь в правильности суммы.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 btn-secondary"
                    disabled={isLoading}
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary disabled:opacity-50"
                    disabled={isLoading || !!contractWarning}
                  >
                    {isLoading ? 'Отправляется через Aztec...' : contractWarning ? 'Переключитесь в демо режим' : 'Отправить Ставку'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 