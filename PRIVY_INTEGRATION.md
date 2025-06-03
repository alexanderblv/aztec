# 🔐 Интеграция Privy для подключения кошельков

Этот гайд поможет вам настроить [Privy](https://www.privy.io/) для безопасного подключения кошельков к вашему приложению приватных аукционов.

## 📋 Что такое Privy?

Privy - это инфраструктура кошельков, которая позволяет пользователям легко подключаться к вашему приложению через:
- Email и SMS
- Социальные сети (Google, GitHub)
- Внешние кошельки (MetaMask, WalletConnect)
- Встроенные безопасные кошельки

### Преимущества Privy:
- 🔒 **Аппаратная защита**: Ключи защищены технологией TEE (Trusted Execution Environment)
- 🌐 **Мультисеть**: Поддержка Ethereum, Polygon, Solana, Bitcoin и других
- ⚡ **Быстрая настройка**: Готов к работе за 9 минут
- 🛡️ **SOC 2 Type II**: Соответствие корпоративным стандартам безопасности

## 🚀 Пошаговая настройка

### Шаг 1: Регистрация в Privy

1. Перейдите на [console.privy.io](https://console.privy.io/)
2. Создайте аккаунт и новый проект
3. Получите App ID из панели управления

### Шаг 2: Установка зависимостей

```bash
npm install @privy-io/react-auth @privy-io/wagmi @tanstack/react-query viem wagmi
```

### Шаг 3: Настройка переменных окружения

Создайте файл `.env.local`:

```env
# Privy App ID - получите на https://console.privy.io/
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
```

### Шаг 4: Настройка провайдеров

Обновите `src/components/PrivyProviders.tsx`:

```tsx
'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { mainnet, polygon, sepolia } from 'viem/chains'
import { http, createConfig } from 'wagmi'

const config = createConfig({
  chains: [mainnet, polygon, sepolia],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
  },
})

const queryClient = new QueryClient()

interface PrivyProvidersProps {
  children: React.ReactNode
}

export default function PrivyProviders({ children }: PrivyProvidersProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['email', 'wallet', 'sms', 'google'],
        appearance: {
          theme: 'light',
          accentColor: '#3B82F6',
        },
        supportedChains: [mainnet, polygon, sepolia],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}
```

### Шаг 5: Обновление Layout

Оберните приложение в провайдеры в `src/app/layout.tsx`:

```tsx
import PrivyProviders from '@/components/PrivyProviders'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <PrivyProviders>
          <div className="min-h-screen">
            {children}
          </div>
        </PrivyProviders>
      </body>
    </html>
  )
}
```

### Шаг 6: Использование компонента подключения

Раскомментируйте код в `src/components/PrivyWalletConnectFull.tsx` и используйте его вместо текущего компонента.

## 🔧 Основные хуки Privy

### usePrivy()

```tsx
const { 
  ready,        // Готовность Privy
  authenticated, // Статус аутентификации
  user,         // Данные пользователя
  login,        // Функция входа
  logout        // Функция выхода
} = usePrivy()
```

### useWallets()

```tsx
const { wallets } = useWallets()

// Получение адреса первого кошелька
const address = wallets[0]?.address
```

### useSendTransaction()

```tsx
const { sendTransaction } = useSendTransaction({
  onSuccess: (txHash) => {
    console.log('Транзакция отправлена:', txHash)
  }
})
```

## 🌐 Поддерживаемые сети

Privy поддерживает множество блокчейнов:

- **Ethereum** (Mainnet, Goerli, Sepolia)
- **Polygon** (Mainnet, Mumbai)
- **Solana** (Mainnet, Devnet)
- **Bitcoin** (Mainnet, Testnet)
- **Arbitrum** (One, Goerli)
- **Optimism** (Mainnet, Goerli)
- **Base** (Mainnet, Goerli)
- И многие другие...

## 🔐 Безопасность

### Технология TEE (Trusted Execution Environment)
- Ключи хранятся в изолированной аппаратной среде
- Приватные ключи никогда не покидают безопасную зону
- Защита от атак на уровне операционной системы

### Распределенное шардирование
- Ключи разделены на части и распределены
- Невозможно восстановить ключ из одного фрагмента
- Дополнительная защита от компрометации

### Аудиты безопасности
- Cure 53 (февраль 2023)
- Zellic (июнь 2023)
- SwordBytes (декабрь 2023)
- Doyensec (февраль 2024)
- SOC 2 Type II (декабрь 2024)

## 🎨 Кастомизация интерфейса

```tsx
appearance: {
  theme: 'light', // 'light' | 'dark'
  accentColor: '#3B82F6',
  logo: 'https://your-domain.com/logo.png',
  landingHeader: 'Добро пожаловать в наше приложение',
  loginMessage: 'Войдите для продолжения',
}
```

## 📱 Мобильная поддержка

Privy автоматически оптимизирован для мобильных устройств:
- Адаптивный дизайн
- Поддержка мобильных кошельков
- Биометрическая аутентификация
- Push-уведомления

## 🧪 Тестирование

### Режим разработки
```bash
npm run dev
```

### Использование тестовых сетей
- Sepolia для Ethereum
- Mumbai для Polygon
- Devnet для Solana

### Тестовые данные
Используйте тестовые email'ы и номера телефонов для проверки функционала.

## 🚀 Развертывание

### Переменные окружения для продакшена

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_production_app_id
```

### Настройка доменов
В панели Privy добавьте ваши продакшен-домены в разрешенные.

## 📚 Дополнительные ресурсы

- [Документация Privy](https://docs.privy.io/)
- [Примеры интеграции](https://github.com/privy-io/privy-examples)
- [Discord сообщество](https://discord.gg/privy)
- [Статус сервиса](https://status.privy.io/)

## 🆘 Поддержка

При возникновении проблем:
1. Проверьте [документацию](https://docs.privy.io/)
2. Найдите решение в [GitHub Issues](https://github.com/privy-io/js-sdk/issues)
3. Обратитесь в [Discord](https://discord.gg/privy)
4. Напишите в техподдержку через панель управления

---

💡 **Совет**: Для начала используйте тестовый App ID, а затем переключитесь на продакшен при развертывании. 