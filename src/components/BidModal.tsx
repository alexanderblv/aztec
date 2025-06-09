'use client'

import { useState, useEffect } from 'react'
import { useAztec } from '@/lib/aztec-context'
// import { aztecDemoService } from '@/lib/aztec-demo'
// import { AztecService } from '@/lib/aztec'

interface BidModalProps {
  isOpen: boolean
  auctionId: number | null
  onClose: () => void
  onBidPlaced?: () => void
}

interface AuctionInfo {
  id: number
  itemName: string
  minBid: number
  endTime: number
}

export default function BidModal({ isOpen, auctionId, onClose, onBidPlaced }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [auctionInfo, setAuctionInfo] = useState<AuctionInfo | null>(null)
  const [contractWarning, setContractWarning] = useState('')
  
  // Using unified Aztec context
  const { service, isTestnet } = useAztec()

  useEffect(() => {
    if (isOpen && auctionId && service) {
      // Load auction information from real service
      const loadAuctionInfo = async () => {
        try {
          // For demo mode use existing logic
          if (!isTestnet) {
            const mockAuctions = [
              { id: 1, itemName: 'Rare Vintage Painting', minBid: 1000, endTime: Date.now() + 3600000 },
              { id: 2, itemName: 'Collectible Rolex Watch', minBid: 5000, endTime: Date.now() + 1800000 },
            ]
            
            const auction = mockAuctions.find(a => a.id === auctionId)
            setAuctionInfo(auction || null)
          } else {
            // For testnet try to load real data
            try {
              const realAuctionInfo = await service.getAuctionInfo(auctionId)
              if (realAuctionInfo) {
                setAuctionInfo({
                  id: auctionId,
                  itemName: realAuctionInfo.itemName,
                  minBid: realAuctionInfo.minBid,
                  endTime: realAuctionInfo.endTime
                })
              }
            } catch (error) {
              console.warn('Failed to load auction info, using demo data')
              const mockAuctions = [
                { id: 1, itemName: 'Test Auction 1', minBid: 100, endTime: Date.now() + 3600000 },
                { id: 2, itemName: 'Test Auction 2', minBid: 500, endTime: Date.now() + 1800000 },
              ]
              const auction = mockAuctions.find(a => a.id === auctionId)
              setAuctionInfo(auction || null)
            }
          }
        } catch (error) {
          console.error('Error loading auction information:', error)
        }
      }
      
      loadAuctionInfo()
    }
  }, [isOpen, auctionId, service, isTestnet])

  // Check contract state when opening modal
  useEffect(() => {
    if (isOpen && service && isTestnet) {
      // For testnet check contract availability
      const checkContractStatus = async () => {
        try {
          const contractAddress = service.getContractAddress()
          if (!contractAddress) {
            setContractWarning('Aztec contract not yet deployed in testnet. Switch to demo mode (Sandbox) to test functionality.')
          } else {
            setContractWarning('')
          }
        } catch (error) {
          setContractWarning('Error checking contract status. Recommend using demo mode.')
        }
      }
      
      checkContractStatus()
    } else {
      setContractWarning('')
    }
  }, [isOpen, service, isTestnet])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const amount = parseFloat(bidAmount)
      
      if (!amount || amount <= 0) {
        throw new Error('Enter a valid bid amount')
      }
      
      if (auctionInfo && amount < auctionInfo.minBid) {
        throw new Error(`Bid must be at least ${auctionInfo.minBid} ETH`)
      }

      if (!service) {
        throw new Error('Service not initialized')
      }

      // Check if wallet is connected
      if (!service.getWalletAddress()) {
        throw new Error('Please connect wallet first')
      }

      // Use service from context
      if (auctionId) {
        await service.placeBid(auctionId, amount)
        
        setSuccess(true)
        console.log(`Private bid ${amount} ETH sent for auction ${auctionId}`)
        
        // Notify parent component about successful bid
        if (onBidPlaced) {
          onBidPlaced()
        }
        
        setTimeout(() => {
          setSuccess(false)
          onClose()
          setBidAmount('')
        }, 2500)
      }
      
    } catch (err: any) {
      let errorMessage = err.message || 'Error sending bid'
      
      // Handle specific errors
      if (errorMessage.includes('Контракт не подключен') || errorMessage.includes('compiled contract')) {
        errorMessage = 'Aztec contract not yet deployed. Switch to demo mode (Sandbox) to test functionality.'
      } else if (errorMessage.includes('Wallet not connected') || errorMessage.includes('Кошелек не подключен')) {
        errorMessage = 'Please connect wallet in the panel on the right'
      }
      
      setError(errorMessage)
      console.error('Error sending bid:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeRemaining = (endTime: number) => {
    const remaining = endTime - Date.now()
    if (remaining <= 0) return 'Completed'
    
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (!isOpen || !auctionInfo) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🔒 Private Bid
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
              <div className="text-6xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">
                Bid encrypted and sent!
              </h3>
              <p className="text-gray-600">
                Your bid is securely hidden until the auction ends.
              </p>
            </div>
          ) : (
            <div>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {auctionInfo.itemName}
                </h3>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Min. bid: {auctionInfo.minBid} ETH</span>
                  <span>Remaining: {formatTimeRemaining(auctionInfo.endTime)}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {contractWarning && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                  <div className="flex items-start">
                    <div className="text-yellow-600 mr-2">⚠️</div>
                    <div>
                      <h4 className="font-medium mb-1">Warning</h4>
                      <p className="text-sm">{contractWarning}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bid Amount (ETH) *
                  </label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="input-field"
                    placeholder={`Minimum ${auctionInfo.minBid} ETH`}
                    min={auctionInfo.minBid}
                    step="0.001"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                    🔒 How Privacy Works
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Your bid is encrypted on your device</li>
                    <li>• No one can see your bid amount</li>
                    <li>• Winner determined by zk-proofs</li>
                    <li>• Only the fact of winning is revealed</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="text-yellow-600 mr-2">⚠️</div>
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">
                        Important to Remember
                      </h4>
                      <p className="text-sm text-yellow-800">
                        After sending, bids cannot be changed or withdrawn. 
                        Make sure the amount is correct.
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary disabled:opacity-50"
                    disabled={isLoading || !!contractWarning}
                  >
                    {isLoading ? 'Sending via Aztec...' : contractWarning ? 'Switch to demo mode' : 'Send Bid'}
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