'use client'

import { useState } from 'react'
import { aztecDemoService } from '@/lib/aztec-demo'
import { AztecService } from '@/lib/aztec'

interface CreateAuctionModalProps {
  isOpen: boolean
  onClose: () => void
  onAuctionCreated?: () => void
}

export default function CreateAuctionModal({ isOpen, onClose, onAuctionCreated }: CreateAuctionModalProps) {
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    durationHours: 24,
    minBid: 1
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Определяем сервис на основе сохраненной сети
  const getAztecService = () => {
    if (typeof window === 'undefined') return aztecDemoService
    
    const network = localStorage.getItem('aztecNetwork') || 'sandbox'
    return network === 'testnet' ? new AztecService() : aztecDemoService
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Валидация
      if (!formData.itemName.trim()) {
        throw new Error('Введите название предмета')
      }
      if (!formData.description.trim()) {
        throw new Error('Введите описание')
      }
      if (formData.minBid <= 0) {
        throw new Error('Минимальная ставка должна быть больше 0')
      }
      if (formData.durationHours <= 0) {
        throw new Error('Продолжительность должна быть больше 0')
      }

      // Используем реальный сервис для создания аукциона
      const service = getAztecService()
      
      const auctionId = await service.createAuction(
        formData.itemName,
        formData.description,
        formData.durationHours,
        formData.minBid
      )
      
      console.log(`Аукцион создан с ID: ${auctionId}`)
      setSuccess(true)
      
      // Вызываем callback для обновления списка аукционов
      if (onAuctionCreated) {
        onAuctionCreated()
      }
      
      setTimeout(() => {
        setSuccess(false)
        onClose()
        // Сбрасываем форму
        setFormData({
          itemName: '',
          description: '',
          durationHours: 24,
          minBid: 1
        })
      }, 2500)
      
    } catch (err: any) {
      setError(err.message || 'Ошибка создания аукциона')
      console.error('Ошибка создания аукциона:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🏛️ Создать Приватный Аукцион
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
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">
                Аукцион успешно создан!
              </h3>
              <p className="text-gray-600">
                Ваш приватный аукцион развернут в сети {typeof window !== 'undefined' && localStorage.getItem('aztecNetwork') === 'testnet' ? 'Aztec Testnet' : 'Aztec Sandbox'}.
              </p>
            </div>
          ) : (
            <div>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название предмета *
                  </label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => handleChange('itemName', e.target.value)}
                    className="input-field"
                    placeholder="Например: Редкая винтажная картина"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Подробное описание предмета..."
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Продолжительность (часы) *
                    </label>
                    <input
                      type="number"
                      value={formData.durationHours}
                      onChange={(e) => handleChange('durationHours', parseInt(e.target.value) || 0)}
                      className="input-field"
                      min="1"
                      max="168"
                      disabled={isLoading}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">От 1 до 168 часов (7 дней)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Минимальная ставка (ETH) *
                    </label>
                    <input
                      type="number"
                      value={formData.minBid}
                      onChange={(e) => handleChange('minBid', parseFloat(e.target.value) || 0)}
                      className="input-field"
                      min="0.001"
                      step="0.001"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                    🔒 Особенности приватного аукциона
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Все ставки полностью зашифрованы</li>
                    <li>• Участники не видят ставки других</li>
                    <li>• Победитель определяется автоматически</li>
                    <li>• Используется технология zero-knowledge</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="text-yellow-600 mr-2">💡</div>
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">
                        Текущая сеть
                      </h4>
                      <p className="text-sm text-yellow-800">
                        Аукцион будет создан в сети: {typeof window !== 'undefined' && localStorage.getItem('aztecNetwork') === 'testnet' ? 'Aztec Alpha Testnet (реальная сеть)' : 'Aztec Sandbox (демо режим)'}
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
                    disabled={isLoading}
                  >
                    {isLoading ? 'Создается через Aztec...' : 'Создать Аукцион'}
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