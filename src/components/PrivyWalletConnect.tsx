'use client'

interface PrivyWalletConnectProps {
  onWalletConnected: (address: string) => void
}

export default function PrivyWalletConnect({ onWalletConnected }: PrivyWalletConnectProps) {
  const handleEmailLogin = () => {
    // Email login simulation
    // Will use real Privy after installing dependencies
    const demoAddress = '0x' + Math.random().toString(16).substring(2, 42)
    onWalletConnected(demoAddress)
  }

  const handleWalletConnect = () => {
    // External wallet connection simulation
    // Will use real Privy after installing dependencies
    const demoAddress = '0x' + Math.random().toString(16).substring(2, 42)
    onWalletConnected(demoAddress)
  }

  const handleSMSLogin = () => {
    // SMS login simulation
    // Will use real Privy after installing dependencies
    const demoAddress = '0x' + Math.random().toString(16).substring(2, 42)
    onWalletConnected(demoAddress)
  }

  return (
    <div className="card max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Wallet Connection</h2>
      
      <p className="text-gray-600 text-center mb-6">
        Choose a convenient login method. Privy will automatically create a secure wallet for you.
      </p>

      <div className="space-y-4">
        <button
          onClick={handleEmailLogin}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          <span>📧</span>
          <span>Login via Email</span>
        </button>

        <button
          onClick={handleSMSLogin}
          className="w-full btn-secondary flex items-center justify-center space-x-2"
        >
          <span>📱</span>
          <span>Login via SMS</span>
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <button
          onClick={handleWalletConnect}
          className="w-full btn-secondary flex items-center justify-center space-x-2"
        >
          <span>👛</span>
          <span>Connect External Wallet</span>
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Privy Advantages:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Secure built-in wallets</li>
          <li>• Login without complex setup</li>
          <li>• Support for all popular networks</li>
          <li>• Hardware key protection</li>
        </ul>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>
          🔒 Your keys are protected by TEE technology and distributed sharding
        </p>
      </div>
    </div>
  )
} 