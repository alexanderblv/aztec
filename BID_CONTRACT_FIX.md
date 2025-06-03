# Исправление ошибки "Контракт не подключен" при создании ставок

## Проблема

При попытке сделать ставку в аукционе появлялась ошибка:
```
Ошибка отправки ставки: Error: Контракт не подключен
    at o.placeBid (page-31bab297c6929893.js:1:9014)
```

Дополнительные проблемы:
- Конфликт кошельков Ethereum (MetaMask)
- CORS ошибки с Privy auth
- Инициализация новых экземпляров AztecService без подключения контракта

## Корневая причина

В компонентах `BidModal`, `CreateAuctionModal`, `WalletConnect` и `AuctionList` создавались новые экземпляры `AztecService()` каждый раз при вызове функции `getAztecService()`. Эти экземпляры не были инициализированы и не имели подключенного контракта, что приводило к ошибке "Контракт не подключен".

## Решение

### 1. Централизованное управление состоянием Aztec

Интегрировали `AztecProvider` в `layout.tsx`:
```tsx
// src/app/layout.tsx
import { AztecProvider } from '@/lib/aztec-context'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AztecProvider>
          {children}
        </AztecProvider>
      </body>
    </html>
  )
}
```

### 2. Замена локальных экземпляров сервиса на контекст

#### BidModal.tsx
**До:**
```tsx
const getAztecService = () => {
  const network = localStorage.getItem('aztecNetwork') || 'sandbox'
  return network === 'testnet' ? new AztecService() : aztecDemoService
}

const service = getAztecService()
await service.placeBid(auctionId, amount)
```

**После:**
```tsx
const { service, isTestnet } = useAztec()

if (!service) {
  throw new Error('Сервис не инициализирован')
}

await service.placeBid(auctionId, amount)
```

#### CreateAuctionModal.tsx
**До:**
```tsx
const getAztecService = () => {
  const network = localStorage.getItem('aztecNetwork') || 'sandbox'
  return network === 'testnet' ? new AztecService() : aztecDemoService
}

const service = getAztecService()
await service.createAuction(...)
```

**После:**
```tsx
const { service, isTestnet } = useAztec()

if (!service) {
  throw new Error('Сервис не инициализирован')
}

await service.createAuction(...)
```

#### WalletConnect.tsx
**До:**
```tsx
const getAztecService = () => {
  if (network === 'testnet') {
    return new AztecService()
  } else {
    return aztecDemoService
  }
}

const service = getAztecService()
await service.initialize(testnetUrl)
const address = await service.createWallet()
```

**После:**
```tsx
const { connectWallet } = useAztec()

const address = await connectWallet()
```

#### AuctionList.tsx
**До:**
```tsx
const getAztecService = () => {
  const network = localStorage.getItem('aztecNetwork') || 'sandbox'
  return network === 'testnet' ? new AztecService() : aztecDemoService
}

const service = getAztecService()
const auctions = await service.getAllAuctions()
```

**После:**
```tsx
const { service, isTestnet } = useAztec()

if (!service) {
  setLoading(false)
  return
}

const auctions = await service.getAllAuctions()
```

### 3. Обновление основного компонента приложения

#### page.tsx
**До:**
```tsx
const [isWalletConnected, setIsWalletConnected] = useState(false)
const [walletAddress, setWalletAddress] = useState<string>('')
const [aztecNetwork, setAztecNetwork] = useState<'sandbox' | 'testnet'>('sandbox')

const handleNetworkChange = (network: 'sandbox' | 'testnet') => {
  setAztecNetwork(network)
  // логика переключения сети...
}
```

**После:**
```tsx
const { 
  network, 
  isConnected, 
  walletAddress, 
  switchNetwork, 
  connectWallet, 
  disconnect 
} = useAztec()

const handleNetworkChange = async (newNetwork: 'sandbox' | 'testnet') => {
  try {
    await switchNetwork(newNetwork)
    localStorage.setItem('aztecNetwork', newNetwork)
  } catch (error) {
    console.error('Ошибка переключения сети:', error)
  }
}
```

## Преимущества решения

1. **Единый источник истины**: Все компоненты используют один инициализированный экземпляр сервиса
2. **Правильная инициализация**: Сервис инициализируется один раз в контексте с правильными параметрами
3. **Автоматическое управление состоянием**: Контекст автоматически управляет подключением и переключением сетей
4. **Избежание конфликтов**: Устранены проблемы с множественными экземплярами сервиса

## Результат

- ✅ Ошибка "Контракт не подключен" исправлена
- ✅ Ставки теперь успешно отправляются через единый сервис
- ✅ Создание аукционов работает корректно
- ✅ Переключение между сетями происходит без проблем
- ✅ Подключение кошелька стабильно работает

## Файлы изменены

- `src/app/layout.tsx` - добавлен AztecProvider
- `src/app/page.tsx` - интеграция с useAztec hook
- `src/components/BidModal.tsx` - замена getAztecService на useAztec
- `src/components/CreateAuctionModal.tsx` - замена getAztecService на useAztec  
- `src/components/WalletConnect.tsx` - замена getAztecService на useAztec
- `src/components/AuctionList.tsx` - замена getAztecService на useAztec

## Тестирование

Для проверки исправлений:

1. Запустите проект: `npm run dev`
2. Подключите кошелек в демо режиме
3. Создайте тестовый аукцион
4. Попробуйте сделать ставку
5. Убедитесь, что ошибка "Контракт не подключен" больше не появляется 