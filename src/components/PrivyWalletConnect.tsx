'use client'

interface PrivyWalletConnectProps {
  onWalletConnected: (address: string) => void
}

export default function PrivyWalletConnect({ onWalletConnected }: PrivyWalletConnectProps) {
  const handleEmailLogin = () => {
    // Симуляция входа через email
    // После установки зависимостей будет использовать настоящий Privy
    const demoAddress = '0x' + Math.random().toString(16).substring(2, 42)
    onWalletConnected(demoAddress)
  }

  const handleWalletConnect = () => {
    // Симуляция подключения внешнего кошелька
    // После установки зависимостей будет использовать настоящий Privy
    const demoAddress = '0x' + Math.random().toString(16).substring(2, 42)
    onWalletConnected(demoAddress)
  }

  const handleSMSLogin = () => {
    // Симуляция входа через SMS
    // После установки зависимостей будет использовать настоящий Privy
    const demoAddress = '0x' + Math.random().toString(16).substring(2, 42)
    onWalletConnected(demoAddress)
  }

  return (
    <div className="card max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Подключение кошелька</h2>
      
      <p className="text-gray-600 text-center mb-6">
        Выберите удобный способ входа. Privy автоматически создаст безопасный кошелек для вас.
      </p>

      <div className="space-y-4">
        <button
          onClick={handleEmailLogin}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          <span>📧</span>
          <span>Войти через Email</span>
        </button>

        <button
          onClick={handleSMSLogin}
          className="w-full btn-secondary flex items-center justify-center space-x-2"
        >
          <span>📱</span>
          <span>Войти через SMS</span>
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">или</span>
          </div>
        </div>

        <button
          onClick={handleWalletConnect}
          className="w-full btn-secondary flex items-center justify-center space-x-2"
        >
          <span>👛</span>
          <span>Подключить внешний кошелек</span>
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Преимущества Privy:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Безопасные встроенные кошельки</li>
          <li>• Вход без сложных настроек</li>
          <li>• Поддержка всех популярных сетей</li>
          <li>• Аппаратная защита ключей</li>
        </ul>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>
          🔒 Ваши ключи защищены технологией TEE и распределенным шардингом
        </p>
      </div>
    </div>
  )
} 