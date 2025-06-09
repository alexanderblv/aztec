'use client'

import React from 'react'
import { AppMode } from './ModeSelector'

interface ModeToggleModalProps {
  isOpen: boolean
  currentMode: AppMode
  onClose: () => void
  onModeChange: (mode: AppMode) => void
  network?: 'sandbox' | 'testnet'
}

export default function ModeToggleModal({
  isOpen,
  currentMode,
  onClose,
  onModeChange,
  network = 'sandbox'
}: ModeToggleModalProps) {
  if (!isOpen) return null

  const handleModeSelect = (mode: AppMode) => {
    onModeChange(mode)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Выбор режима работы
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Current Mode Indicator */}
            <div className="text-center">
              <p className="text-gray-600 mb-2">Текущий режим:</p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
                currentMode === 'demo' 
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}>
                <span className="text-lg">
                  {currentMode === 'demo' ? '🎮' : '🌐'}
                </span>
                {currentMode === 'demo' ? 'Демо режим' : 'Реальный режим'}
              </div>
            </div>

            {/* Mode Options */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Demo Mode Card */}
              <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                currentMode === 'demo'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
              }`}
              onClick={() => handleModeSelect('demo')}
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🎮</div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Демо режим
                  </h3>
                  <p className="text-sm text-gray-600">
                    Безопасное тестирование
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">
                      Полная имитация работы Aztec Network
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">
                      Данные хранятся локально
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">
                      Никаких реальных транзакций
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">
                      Идеально для изучения интерфейса
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">
                      Мгновенные операции
                    </span>
                  </div>
                </div>

                {currentMode === 'demo' && (
                  <div className="mt-4 p-2 bg-green-100 rounded text-center">
                    <span className="text-sm font-medium text-green-800">
                      Текущий режим
                    </span>
                  </div>
                )}
              </div>

              {/* Real Mode Card */}
              <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                currentMode === 'real'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
              }`}
              onClick={() => handleModeSelect('real')}
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🌐</div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Реальный режим
                  </h3>
                  <p className="text-sm text-gray-600">
                    Настоящий Aztec Network
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">⚡</span>
                    <span className="text-sm text-gray-700">
                      Подключение к {network === 'testnet' ? 'Aztec Testnet' : 'Aztec Sandbox'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">⚡</span>
                    <span className="text-sm text-gray-700">
                      Настоящие приватные ставки
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">⚡</span>
                    <span className="text-sm text-gray-700">
                      Реальные криптографические доказательства
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">⚠️</span>
                    <span className="text-sm text-gray-700">
                      Требует развертывания контракта
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">⚠️</span>
                    <span className="text-sm text-gray-700">
                      Возможны gas fees
                    </span>
                  </div>
                </div>

                {currentMode === 'real' && (
                  <div className="mt-4 p-2 bg-blue-100 rounded text-center">
                    <span className="text-sm font-medium text-blue-800">
                      Текущий режим
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Warning for Real Mode */}
            {currentMode !== 'real' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">⚠️</span>
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-1">
                      Переключение на реальный режим
                    </h4>
                    <p className="text-sm text-yellow-800">
                      При переключении на реальный режим вы будете отключены от текущего кошелька. 
                      Вам потребуется подключить реальный кошелек для работы с Aztec Network.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              {currentMode === 'demo' ? (
                <button
                  onClick={() => handleModeSelect('real')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Переключиться на реальный режим
                </button>
              ) : (
                <button
                  onClick={() => handleModeSelect('demo')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Переключиться на демо режим
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 