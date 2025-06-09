'use client'

import { useState } from 'react'

interface NetworkSelectorProps {
  onNetworkChange: (network: 'sandbox' | 'testnet') => void
  currentNetwork: 'sandbox' | 'testnet'
  disabled?: boolean
}

export default function NetworkSelector({ 
  onNetworkChange, 
  currentNetwork, 
  disabled = false 
}: NetworkSelectorProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-3">
        Choose Aztec Network
      </h3>
      
      <div className="flex rounded-lg border border-gray-300 overflow-hidden bg-white">
        <button
          onClick={() => onNetworkChange('sandbox')}
          disabled={disabled}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            currentNetwork === 'sandbox'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="text-center">
            <div className="text-lg mb-1">🏠</div>
            <div className="font-semibold">Local Sandbox</div>
            <div className="text-xs opacity-75">
              Local development
            </div>
          </div>
        </button>
        
        <button
          onClick={() => onNetworkChange('testnet')}
          disabled={disabled}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            currentNetwork === 'testnet'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="text-center">
            <div className="text-lg mb-1">🌐</div>
            <div className="font-semibold">Alpha Testnet</div>
            <div className="text-xs opacity-75">
              Public test network
            </div>
          </div>
        </button>
      </div>
      
      <div className="mt-3 text-sm text-gray-600">
        {currentNetwork === 'sandbox' ? (
          <div className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Connected to local Aztec Sandbox (localhost:8080)
          </div>
        ) : (
          <div className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Connected to Alpha Testnet (free transactions)
          </div>
        )}
      </div>

      {currentNetwork === 'testnet' && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="text-blue-600 mr-2">ℹ️</div>
            <div className="text-sm text-blue-800">
              <div className="font-semibold mb-1">Alpha Testnet Features:</div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Transactions are free thanks to sponsored fee contract</li>
                <li>Real network with genuine zk-proofs</li>
                <li>Possible slight transaction wait times</li>
                <li>Test tokens available without restrictions</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 