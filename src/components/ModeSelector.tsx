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
    <div className={`w-full ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Choose Mode</h2>
      
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Demo Mode */}
        <button
          onClick={() => handleModeChange('demo')}
          disabled={disabled || isChanging}
          className={`
            relative p-3 rounded-lg border-2 transition-all duration-200
            ${currentMode === 'demo'
              ? 'border-green-500 bg-green-50 text-green-900'
              : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
            }
            ${disabled || isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🎮</span>
            <div className="text-left">
              <h4 className="font-semibold text-sm">Demo Mode</h4>
              <p className="text-xs opacity-80">
                Safe testing environment
              </p>
            </div>
            {currentMode === 'demo' && (
              <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
        </button>

        {/* Real Mode */}
        <button
          onClick={() => handleModeChange('real')}
          disabled={disabled || isChanging}
          className={`
            relative p-3 rounded-lg border-2 transition-all duration-200
            ${currentMode === 'real'
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
            }
            ${disabled || isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🌐</span>
            <div className="text-left">
              <h4 className="font-semibold text-sm">Real Mode</h4>
              <p className="text-xs opacity-80">
                Aztec Network connection
              </p>
            </div>
            {currentMode === 'real' && (
              <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        </button>
      </div>

      {/* Compact Status */}
      <div className="mt-3 p-2 rounded bg-gray-50 border border-gray-200">
        <div className="text-xs text-gray-600 text-center">
          {currentMode === 'demo' ? (
            <span>✓ Demo mode: All data stored locally, no real transactions</span>
          ) : (
            <span>⚡ Real mode: Connected to Aztec Network, real transactions</span>
          )}
        </div>
      </div>

      {isChanging && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-gray-600">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
            Switching mode...
          </div>
        </div>
      )}
    </div>
  )
} 