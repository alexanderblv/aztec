# Wallet Connection Troubleshooting Guide

## Проблема: В Real Mode подключается не настоящий кошелек

### Описание проблемы
Когда пользователь выбирает Real Mode и пытается подключить настоящий кошелек (Azguard, Obsidion), приложение все равно подключает демо-кошелек вместо выбранного настоящего кошелька.

### Причина проблемы
В приложении была логическая ошибка в функции `handleWalletConnected`, которая всегда создавала новый демо-кошелек через `connectWallet()` независимо от того, какой кошелек был фактически подключен пользователем.

### Решение проблемы

#### Автоматическое исправление (v1.3+)
Проблема исправлена в последней версии приложения. Теперь:

1. **В Demo Mode**: Создается новый демо-кошелек через Aztec Sandbox
2. **В Real Mode**: Используется адрес фактически подключенного кошелька (Azguard, Obsidion и т.д.)

#### Проверка правильности подключения

Выполните в консоли браузера:
```javascript
// Проверить текущий режим и подключенный кошелек
console.log('App Mode:', localStorage.getItem('appMode'))
console.log('Wallet Mode:', localStorage.getItem('walletMode'))
console.log('Connected Wallet:', localStorage.getItem('aztecConnectedWallet'))
console.log('Wallet Address:', localStorage.getItem('walletAddress'))

// Проверить состояние реального кошелька
console.log('Real wallet providers:', window.ethereum?.providers?.map(p => ({
  isMetaMask: p.isMetaMask,
  isAzguard: p.isAzguard,
  constructor: p.constructor.name
})))
```

#### Ручное исправление (если проблема сохраняется)

1. **Очистить состояние**:
```javascript
// Очистить все данные кошельков
localStorage.removeItem('walletAddress')
localStorage.removeItem('walletMode')
localStorage.removeItem('aztecConnectedWallet')
localStorage.removeItem('aztecWalletDisconnected')
localStorage.removeItem('appMode')

// Перезагрузить страницу
window.location.reload()
```

2. **Принудительно установить Real Mode**:
```javascript
// Установить Real Mode
localStorage.setItem('appMode', 'real')
localStorage.setItem('walletMode', 'aztec')

// Перезагрузить страницу
window.location.reload()
```

3. **Подключить кошелек заново**:
   - Выберите Real Mode
   - Подключите ваш настоящий кошелек (Azguard, Obsidion)
   - Убедитесь, что адрес кошелька соответствует вашему реальному кошельку

### Как убедиться, что подключен правильный кошелек

1. **Проверить адрес**: Адрес в приложении должен совпадать с адресом в вашем кошельке
2. **Проверить режим**: В верхней части экрана должно отображаться "🌐 Real Mode"
3. **Проверить консоль**: В консоли браузера должно быть сообщение "Real wallet connected with address: [ваш_адрес]"

### Диагностика подключения

Добавьте эту функцию в консоль для полной диагностики:
```javascript
function diagnoseWalletConnection() {
  const diagnosis = {
    appMode: localStorage.getItem('appMode'),
    walletMode: localStorage.getItem('walletMode'),
    connectedWallet: localStorage.getItem('aztecConnectedWallet'),
    walletAddress: localStorage.getItem('walletAddress'),
    realWalletProviders: window.ethereum?.providers?.length || 'single provider',
    azguardActive: window.ethereum?.isAzguard || 
      window.ethereum?.providers?.some(p => p.isAzguard),
    metamaskActive: window.ethereum?.isMetaMask ||
      window.ethereum?.providers?.some(p => p.isMetaMask)
  }
  
  console.log('🔍 Wallet Connection Diagnosis:', diagnosis)
  
  // Определить проблему
  if (diagnosis.appMode === 'real' && diagnosis.walletMode === 'aztec') {
    if (diagnosis.azguardActive) {
      console.log('✅ Все настроено правильно для Real Mode с Azguard')
    } else {
      console.log('❌ Real Mode выбран, но Azguard не найден')
    }
  } else if (diagnosis.appMode === 'demo') {
    console.log('ℹ️ Demo Mode - используется демо-кошелек')
  } else {
    console.log('⚠️ Неправильная конфигурация режимов')
  }
  
  return diagnosis
}

// Запустить диагностику
diagnoseWalletConnection()
```

## Проблема: Конфликт между MetaMask и Azguard кошельками

### Описание проблемы
При первом открытии сайта возникает ошибка:
```
MetaMask encountered an error setting the global Ethereum provider - this is likely due to another Ethereum wallet extension also setting the global Ethereum provider: TypeError: Cannot set property ethereum of #<Window> which has only a getter
```

Расширение Azguard появляется на секунду и сразу закрывается. При второй попытке всё работает нормально.

## Причины проблемы

1. **Конфликт провайдеров**: MetaMask и Azguard пытаются одновременно установить глобальный `window.ethereum` объект
2. **Порядок загрузки**: MetaMask загружается раньше и блокирует возможность другим кошелькам установить провайдер
3. **Кэширование**: Браузер кэширует состояние первого кошелька

## Быстрое решение

### Шаг 1: Диагностика
Откройте консоль браузера (F12) и выполните:

```javascript
// Скопируйте и вставьте содержимое файла wallet-conflict-fix.js
```

### Шаг 2: Автоматическое исправление
В консоли выполните:
```javascript
fixWalletConflicts()
```

### Шаг 3: Принудительное подключение к Azguard
Если проблема сохраняется:
```javascript
forceConnectAzguard()
```

## Долгосрочные решения

### Вариант 1: Отключение MetaMask (рекомендуется)

1. Откройте Chrome Extensions (`chrome://extensions/`)
2. Найдите MetaMask
3. Нажмите переключатель чтобы временно отключить
4. Перезагрузите страницу приложения
5. Подключитесь к Azguard

### Вариант 2: Изменение приоритета кошельков

1. В консоли браузера выполните:
```javascript
localStorage.setItem('preferredWallet', 'azguard')
localStorage.setItem('autoFixWalletConflicts', 'true')
window.location.reload()
```

### Вариант 3: Использование инкогнито режима

1. Откройте новое окно в режиме инкогнито
2. Установите только Azguard (если требуется)
3. Откройте приложение

## Настройки приложения

### Автоматическое исправление конфликтов

Добавьте в localStorage для автоматического исправления:

```javascript
// Включить автоматическое исправление
localStorage.setItem('autoFixWalletConflicts', 'true')

// Установить приоритет Azguard
localStorage.setItem('preferredWallet', 'azguard')

// Отключить предупреждения MetaMask
localStorage.setItem('metamaskDisabled', 'true')
```

### Проверка текущего состояния

```javascript
// Проверить настройки
console.log('Preferred wallet:', localStorage.getItem('preferredWallet'))
console.log('Auto fix enabled:', localStorage.getItem('autoFixWalletConflicts'))
console.log('Connected wallet:', localStorage.getItem('aztecConnectedWallet'))

// Проверить провайдеры
console.log('Ethereum providers:', window.ethereum?.providers?.length || 'Single provider')
console.log('MetaMask active:', window.ethereum?.isMetaMask)
console.log('Azguard active:', window.ethereum?.isAzguard)
```

## Технические детали

### Архитектура конфликта

1. **MetaMask injection**: Загружается первым и устанавливает `window.ethereum`
2. **Property descriptor**: MetaMask делает свойство read-only
3. **Azguard injection**: Пытается переписать `window.ethereum` но получает ошибку
4. **Provider array**: В некоторых случаях создается `window.ethereum.providers` массив

### Решение в коде

Компонент `AztecWalletConnect` был обновлен функциями:

- `checkWalletConflicts()` - определяет наличие конфликтов
- `resolveWalletConflicts()` - автоматически исправляет конфликты
- Автоматическая очистка кэша MetaMask

## Отладка

### Полезные команды консоли

```javascript
// Полная диагностика
Object.getOwnPropertyDescriptor(window, 'ethereum')

// Проверка провайдеров
window.ethereum?.providers?.forEach((p, i) => 
  console.log(`Provider ${i}:`, p.constructor.name, {
    isMetaMask: p.isMetaMask,
    isAzguard: p.isAzguard
  })
)

// Сброс всех настроек кошельков
['metamask.isUnlocked', 'metamask.disconnected', 'aztecConnectedWallet', 
 'walletAddress', 'preferredWallet'].forEach(key => 
  localStorage.removeItem(key)
)
```

### Логи для отправки в поддержку

```javascript
// Создать отчет для поддержки
const report = {
  userAgent: navigator.userAgent,
  ethereum: !!window.ethereum,
  providers: window.ethereum?.providers?.length || 'single',
  isMetaMask: window.ethereum?.isMetaMask,
  isAzguard: window.ethereum?.isAzguard,
  localStorage: {
    preferredWallet: localStorage.getItem('preferredWallet'),
    aztecConnectedWallet: localStorage.getItem('aztecConnectedWallet'),
    autoFix: localStorage.getItem('autoFixWalletConflicts')
  }
}
console.log('Support Report:', JSON.stringify(report, null, 2))
```

## Профилактика

### Рекомендуемая настройка браузера

1. Используйте отдельный профиль браузера для DeFi
2. Устанавливайте только необходимые кошельки
3. Регулярно очищайте localStorage
4. Обновляйте расширения кошельков

### Мониторинг состояния

Добавьте в закладки JavaScript для быстрой проверки:

```javascript
javascript:(function(){
  const eth = window.ethereum;
  alert(`Wallets: ${eth?.providers?.length || 1}\nMetaMask: ${!!eth?.isMetaMask}\nAzguard: ${!!eth?.isAzguard}\nPreferred: ${localStorage.getItem('preferredWallet')}`);
})();
```

## Поддержка

Если проблема не решается:

1. Сделайте скриншот ошибки в консоли
2. Выполните команду создания отчета (см. выше)
3. Укажите версии браузера и расширений
4. Опишите последовательность действий

## Обновления

- **v1.0**: Первоначальная версия
- **v1.1**: Добавлено автоматическое исправление конфликтов
- **v1.2**: Улучшена диагностика провайдеров 
- **v1.3**: Добавлена диагностика подключения кошелька в Real Mode 