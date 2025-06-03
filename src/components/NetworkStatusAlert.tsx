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
                Sandbox режим активен
              </h3>
              <p className="text-sm text-green-700">
                Все функции работают полноценно. Данные сохраняются локально в браузере. 
                Это полная имитация работы с Aztec Network.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Для testnet режима
  const contractAddress = service?.getContractAddress?.()
  const isContractDeployed = !!contractAddress

  return (
    <div className="mb-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-yellow-600 mr-3 text-xl">⚠️</div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-900 mb-2">
              Aztec Alpha Testnet - {isContractDeployed ? 'Контракт развернут' : 'Требуется развертывание контракта'}
            </h3>
            
            {!isContractDeployed ? (
              <div className="space-y-2">
                <p className="text-sm text-yellow-800">
                  <strong>Текущая проблема:</strong> Контракт приватных аукционов не развернут в Aztec Testnet. 
                  Функции создания аукционов и размещения ставок недоступны.
                </p>
                
                <div className="bg-yellow-100 rounded p-3">
                  <p className="text-sm text-yellow-800 font-medium mb-2">🚀 Варианты решения:</p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• <strong>Быстро:</strong> Переключитесь на "Sandbox (демо)" для полного тестирования</li>
                    <li>• <strong>Для разработки:</strong> Разверните контракт в testnet (требует Node.js)</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-yellow-800">
                Контракт развернут по адресу: <code className="bg-yellow-100 px-1 rounded">{contractAddress}</code>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 