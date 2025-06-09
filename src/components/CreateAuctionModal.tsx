'use client'

import { useState } from 'react'
import { useAztec } from '@/lib/aztec-context'
// import { aztecDemoService } from '@/lib/aztec-demo'
// import { AztecService } from '@/lib/aztec'

interface CreateAuctionModalProps {
  isOpen: boolean
  onClose: () => void
  onAuctionCreated?: () => void
}

export default function CreateAuctionModal({ isOpen, onClose, onAuctionCreated }: CreateAuctionModalProps) {
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    durationHours: 24,
    minBid: 1
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Using unified Aztec context
  const { service, isTestnet } = useAztec()

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.itemName.trim()) {
        throw new Error('Enter item name')
      }
      if (!formData.description.trim()) {
        throw new Error('Enter description')
      }
      if (formData.minBid <= 0) {
        throw new Error('Minimum bid must be greater than 0')
      }
      if (formData.durationHours <= 0) {
        throw new Error('Duration must be greater than 0')
      }

      if (!service) {
        throw new Error('Service not initialized')
      }

      // Use service from context
      const auctionId = await service.createAuction(
        formData.itemName,
        formData.description,
        formData.durationHours,
        formData.minBid
      )
      
      console.log(`Auction created with ID: ${auctionId}`)
      setSuccess(true)
      
      // Call callback to update auction list
      if (onAuctionCreated) {
        onAuctionCreated()
      }
      
      setTimeout(() => {
        setSuccess(false)
        onClose()
        // Reset form
        setFormData({
          itemName: '',
          description: '',
          durationHours: 24,
          minBid: 1
        })
      }, 2500)
      
    } catch (err: any) {
      setError(err.message || 'Error creating auction')
      console.error('Error creating auction:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🏛️ Create Private Auction
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
                Auction successfully created!
              </h3>
              <p className="text-gray-600">
                Your private auction is deployed in {isTestnet ? 'Aztec Testnet' : 'Aztec Sandbox'}.
              </p>
            </div>
          ) : (
            <div>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => handleChange('itemName', e.target.value)}
                    className="input-field"
                    placeholder="For example: Rare Vintage Painting"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Detailed description of the item..."
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (hours) *
                    </label>
                    <input
                      type="number"
                      value={formData.durationHours}
                      onChange={(e) => handleChange('durationHours', parseInt(e.target.value) || 0)}
                      className="input-field"
                      min="1"
                      max="168"
                      disabled={isLoading}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">From 1 to 168 hours (7 days)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Bid (ETH) *
                    </label>
                    <input
                      type="number"
                      value={formData.minBid}
                      onChange={(e) => handleChange('minBid', parseFloat(e.target.value) || 0)}
                      className="input-field"
                      min="0.001"
                      step="0.001"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                    🔒 Private Auction Features
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• All bids are fully encrypted</li>
                    <li>• Participants cannot see other bids</li>
                    <li>• Winner determined automatically</li>
                    <li>• Uses zero-knowledge technology</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="text-yellow-600 mr-2">💡</div>
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">
                        Current Network
                      </h4>
                      <p className="text-sm text-yellow-800">
                        Auction will be created on: {isTestnet ? 'Aztec Alpha Testnet (real network)' : 'Aztec Sandbox (demo mode)'}
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
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating via Aztec...' : 'Create Auction'}
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