'use client'

import React from 'react'

interface PrivyProvidersProps {
  children: React.ReactNode
}

// Временный провайдер, который будет заменен после установки зависимостей
export default function PrivyProviders({ children }: PrivyProvidersProps) {
  return (
    <div className="privy-provider-wrapper">
      {children}
    </div>
  )
} 