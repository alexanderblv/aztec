# Интеграция Aztec кошельков (Azguard и Obsidion)

## Обзор

Платформа теперь поддерживает подключение кошельков Aztec Network вместо Privy:
- **Obsidion Wallet** - Privacy-first кошелек для Aztec Network
- **Azguard Wallet** - Безопасный Aztec кошелек (Alpha версия)

## Установка и настройка

### 1. Установка зависимостей

Запустите скрипт установки:
```bash
chmod +x install-aztec-wallets.sh
./install-aztec-wallets.sh
```

Или вручную:
```bash
# Удалить старые Privy зависимости
npm uninstall @privy-io/react-auth @privy-io/wagmi viem wagmi @tanstack/react-query

# Установить Aztec Wallet SDK
npm install @nemi-fi/wallet-sdk@latest
npm install
```

### 2. Очистка старой конфигурации

Удалите старые файлы конфигурации Privy:
```bash
rm .env.local  # если содержит PRIVY_APP_ID
```

## Архитектура

### Компоненты

1. **AztecWalletConnect** (`src/components/AztecWalletConnect.tsx`)
   - Основной компонент подключения кошельков
   - Поддерживает Obsidion и Azguard кошельки
   - Управляет состоянием подключения

2. **AztecWalletProvider** (`src/components/AztecWalletProvider.tsx`)
   - React Context провайдер для управления кошельками
   - Инициализация Aztec Wallet SDK
   - Автоматическое восстановление подключения

### Интеграция в приложение

```typescript
import { AztecWalletProvider } from '@/components/AztecWalletProvider'
import AztecWalletConnect from '@/components/AztecWalletConnect'

// В layout.tsx
<AztecWalletProvider>
  <App />
</AztecWalletProvider>

// В компоненте подключения
<AztecWalletConnect 
  onWalletConnected={handleWalletConnected}
  onError={setWalletError}
  onLogoutComplete={handleDisconnectWallet}
/>
```

## Поддерживаемые кошельки

### Obsidion Wallet
- **Статус**: Полная поддержка
- **Сайт**: https://obsidion.xyz/
- **Документация**: https://docs.obsidion.xyz/intro
- **Особенности**: 
  - Privacy-first подход
  - Нативная поддержка Aztec Network
  - Продвинутые криптографические функции

### Azguard Wallet
- **Статус**: Alpha тестирование
- **Сайт**: https://azguardwallet.io/
- **Особенности**:
  - Безопасное управление ключами
  - Оптимизация для DeFi
  - Интеграция с Aztec протоколом

## Конфигурация SDK

```typescript
const walletSdk = new AztecWalletSdk({
  aztecNode: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8080'           // Локальная sandbox
    : 'https://aztec-alpha-testnet.zkv.xyz',  // Testnet
  connectors: [obsidion()],
})
```

## Управление состоянием

### Локальное хранение
- `aztecConnectedWallet` - ID подключенного кошелька
- `aztecWalletDisconnected` - флаг отключения пользователем
- `walletMode` - режим работы ('aztec' | 'demo')

### Контекст кошелька
```typescript
const {
  sdk,              // Экземпляр Aztec Wallet SDK
  isConnected,      // Статус подключения
  account,          // Аккаунт пользователя
  connectedWallet,  // ID подключенного кошелька
  connect,          // Функция подключения
  disconnect        // Функция отключения
} = useAztecWallet()
```

## Функции безопасности

1. **Приватные ключи никогда не покидают кошелек**
2. **Автоматическая очистка сессии при отключении**
3. **Проверка подлинности подключения**
4. **Обработка ошибок сети**

## Режимы работы

### Demo режим
- Работает без реальных кошельков
- Использует симулированные аккаунты
- Безопасное тестирование функционала

### Aztec режим
- Подключение к реальным кошелькам
- Работа с Aztec Network (sandbox/testnet)
- Полная функциональность приватных аукционов

## Устранение неполадок

### Кошелек не подключается
1. Убедитесь, что кошелек установлен
2. Проверьте поддержку Aztec Network
3. Очистите кэш браузера

### SDK не инициализируется
1. Проверьте подключение к интернету
2. Убедитесь в корректности URL узла Aztec
3. Проверьте совместимость версий

### Ошибки сети
```typescript
// Проверка доступности узла
const nodeUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080'
  : 'https://aztec-alpha-testnet.zkv.xyz'
```

## Миграция с Privy

### Удаленные компоненты
- `PrivyWalletConnectFull.tsx`
- `PrivyProviders.tsx`
- Все Privy зависимости

### Замененная функциональность
- Приватное управление ключами → Native Aztec wallets
- Мультипровайдерная аутентификация → Специализированные Aztec кошельки
- Встроенные кошельки → Внешние приложения кошельков

## Ссылки

- [Aztec Network](https://aztec.network/)
- [Wallet SDK на NPM](https://www.npmjs.com/package/@nemi-fi/wallet-sdk)
- [Obsidion Docs](https://docs.obsidion.xyz/intro)
- [Azguard Wallet](https://azguardwallet.io/)

## Поддержка

При возникновении проблем:
1. Проверьте совместимость кошелька с Aztec Network
2. Убедитесь в актуальности версии SDK
3. Обратитесь к документации конкретного кошелька 