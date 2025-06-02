'use client'

import { useState } from 'react'

interface CreateAuctionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateAuctionModal({ isOpen, onClose }: CreateAuctionModalProps) {
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    duration: 24,
    minBid: 0.1,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
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
      if (formData.duration <= 0) {
        throw new Error('Продолжительность должна быть больше 0')
      }

      // Имитация создания аукциона
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
        setFormData({
          itemName: '',
          description: '',
          duration: 24,
          minBid: 0.1,
        })
      }, 2000)
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Создать Аукцион
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
                Аукцион создан успешно!
              </h3>
              <p className="text-gray-600">
                Ваш аукцион будет доступен для участников в ближайшее время.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название предмета *
                </label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => handleInputChange('itemName', e.target.value)}
                  className="input-field"
                  placeholder="Например: Винтажная картина"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Подробное описание предмета..."
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Продолжительность (часы) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 1)}
                  className="input-field"
                  min="1"
                  max="168"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  От 1 часа до 7 дней (168 часов)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Минимальная ставка (ETH) *
                </label>
                <input
                  type="number"
                  value={formData.minBid}
                  onChange={(e) => handleInputChange('minBid', parseFloat(e.target.value) || 0)}
                  className="input-field"
                  min="0.001"
                  step="0.001"
                  disabled={isLoading}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">🔒 Гарантии приватности:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ставки участников полностью зашифрованы</li>
                  <li>• Никто не может видеть размер ставок до завершения</li>
                  <li>• Определение победителя происходит автоматически</li>
                  <li>• Используются zk-доказательства для честности</li>
                </ul>
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
                  {isLoading ? 'Создается...' : 'Создать Аукцион'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 