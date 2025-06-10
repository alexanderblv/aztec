# Wallet Connection Troubleshooting Guide

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