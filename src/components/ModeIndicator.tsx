'use client'

import React from 'react'

export type AppMode = 'demo' | 'real'

interface ModeIndicatorProps {
  mode: AppMode
  network?: 'sandbox' | 'testnet'
  className?: string
  onClick?: () => void
}

export default function ModeIndicator({ 
  mode, 
  network = 'sandbox',
  className = "",
  onClick
}: ModeIndicatorProps) {
  const isDemoMode = mode === 'demo'
  
  return (
    <div 
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
        border transition-all duration-200
        ${isDemoMode 
          ? 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100' 
          : 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
        }
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
        ${className}
      `}
      onClick={onClick}
      title={onClick ? 'Нажмите для смены режима' : undefined}
    >
      <div className="flex items-center gap-1">
        <span className="text-base">
          {isDemoMode ? '🎮' : '🌐'}
        </span>
        <span className="font-semibold">
          {isDemoMode ? 'ДЕМО' : 'РЕАЛЬНЫЙ'}
        </span>
      </div>
      
      <div className="text-xs opacity-75 border-l border-current pl-2">
        {isDemoMode ? 'Симуляция' : `${network === 'testnet' ? 'Testnet' : 'Sandbox'}`}
      </div>

      {/* Пульсирующий индикатор активности */}
      <div className={`
        w-2 h-2 rounded-full 
        ${isDemoMode ? 'bg-green-500' : 'bg-blue-500'}
      `}>
        <div className={`
          w-2 h-2 rounded-full animate-ping
          ${isDemoMode ? 'bg-green-500' : 'bg-blue-500'}
        `}></div>
      </div>
    </div>
  )
} 