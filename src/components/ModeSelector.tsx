'use client'

import React, { useState } from 'react'

export type AppMode = 'demo' | 'real'

interface ModeSelectorProps {
  currentMode: AppMode
  onModeChange: (mode: AppMode) => void
  disabled?: boolean
  className?: string
}

export default function ModeSelector({ 
  currentMode, 
  onModeChange, 
  disabled = false,
  className = ""
}: ModeSelectorProps) {
  const [isChanging, setIsChanging] = useState(false)

  const handleModeChange = async (newMode: AppMode) => {
    if (disabled || isChanging || newMode === currentMode) return
    
    setIsChanging(true)
    try {
      await onModeChange(newMode)
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="mb-4 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Выберите режим работы
        </h3>
        <p className="text-sm text-gray-600">
          Демо режим безопасен для изучения, реальный режим работает с Aztec Network
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Demo Mode */}
        <button
          onClick={() => handleModeChange('demo')}
          disabled={disabled || isChanging}
          className={`
            relative p-4 rounded-lg border-2 transition-all duration-200
            ${currentMode === 'demo'
              ? 'border-green-500 bg-green-50 text-green-900'
              : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
            }
            ${disabled || isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🎮</span>
            {currentMode === 'demo' && (
              <div className="w-3 h-3 bg-green-500 rounded-full">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              </div>
            )}
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-base mb-1">Демо режим</h4>
            <p className="text-sm opacity-80">
              Симуляция работы • Безопасно для тестирования • Локальные данные
            </p>
          </div>
          {currentMode === 'demo' && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Активен
              </span>
            </div>
          )}
        </button>

        {/* Real Mode */}
        <button
          onClick={() => handleModeChange('real')}
          disabled={disabled || isChanging}
          className={`
            relative p-4 rounded-lg border-2 transition-all duration-200
            ${currentMode === 'real'
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
            }
            ${disabled || isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🌐</span>
            {currentMode === 'real' && (
              <div className="w-3 h-3 bg-blue-500 rounded-full">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
              </div>
            )}
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-base mb-1">Реальный режим</h4>
            <p className="text-sm opacity-80">
              Aztec Network • Реальные транзакции • Настоящие кошельки
            </p>
          </div>
          {currentMode === 'real' && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Активен
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Mode Details */}
      <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
        {currentMode === 'demo' ? (
          <div className="text-sm text-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-600">✓</span>
              <span className="font-medium">Демо режим активен</span>
            </div>
            <ul className="text-xs space-y-1 text-gray-600">
              <li>• Все данные хранятся локально</li>
              <li>• Никаких реальных транзакций</li>
              <li>• Имитация работы с Aztec Network</li>
              <li>• Идеально для изучения интерфейса</li>
            </ul>
          </div>
        ) : (
          <div className="text-sm text-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600">⚡</span>
              <span className="font-medium">Реальный режим активен</span>
            </div>
            <ul className="text-xs space-y-1 text-gray-600">
              <li>• Подключение к Aztec Network</li>
              <li>• Реальные транзакции и кошельки</li>
              <li>• Требует установленного контракта</li>
              <li>• Может требовать gas fees</li>
            </ul>
          </div>
        )}
      </div>

      {isChanging && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            Переключение режима...
          </div>
        </div>
      )}
    </div>
  )
} 