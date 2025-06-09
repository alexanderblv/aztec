'use client'

import { useAztec } from '@/lib/aztec-context'

export default function NetworkStatusAlert() {
  const { network, service } = useAztec()

  if (network === 'sandbox') {
    return (
      <div className="mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-green-600 mr-3 text-xl">✅</div>
            <div>
              <h3 className="text-sm font-medium text-green-900 mb-1">
                Sandbox mode active
              </h3>
              <p className="text-sm text-green-700">
                All features work fully. Data is stored locally in the browser. 
                This is a complete simulation of working with Aztec Network.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // For testnet mode
  const contractAddress = service?.getContractAddress?.()
  const isContractDeployed = !!contractAddress

  return (
    <div className="mb-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-yellow-600 mr-3 text-xl">⚠️</div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-900 mb-2">
              Aztec Alpha Testnet - {isContractDeployed ? 'Contract deployed' : 'Contract deployment required'}
            </h3>
            
            {!isContractDeployed ? (
              <div className="space-y-2">
                <p className="text-sm text-yellow-800">
                  <strong>Current issue:</strong> Private auction contract not deployed in Aztec Testnet. 
                  Auction creation and bid placement functions are unavailable.
                </p>
                
                <div className="bg-yellow-100 rounded p-3">
                  <p className="text-sm text-yellow-800 font-medium mb-2">🚀 Solution options:</p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• <strong>Quick:</strong> Switch to "Sandbox (demo)" for full testing</li>
                    <li>• <strong>For development:</strong> Deploy contract to testnet (requires Node.js)</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-yellow-800">
                Contract deployed at: <code className="bg-yellow-100 px-1 rounded">{contractAddress}</code>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 