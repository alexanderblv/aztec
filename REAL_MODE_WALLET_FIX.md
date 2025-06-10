# Исправление проблемы подключения кошелька в Real Mode

## Проблема
Когда пользователь выбирал **Real Mode** и подключал настоящий кошелек (Azguard, Obsidion), приложение все равно подключало демо-кошелек вместо выбранного настоящего кошелька.

## Причина
В функции `handleWalletConnected` была логическая ошибка: она всегда вызывала `connectWallet()` из AztecProvider, который создавал новый демо-кошелек независимо от того, какой кошелек фактически подключил пользователь.

## Решение

### Что было исправлено:

1. **В `src/lib/aztec-context.tsx`**:
   - Добавлена новая функция `connectRealWallet(address: string)` для корректного подключения настоящих кошельков
   - Эта функция принимает адрес реального кошелька и устанавливает его без создания нового демо-кошелька

2. **В `src/app/page.tsx`**:
   - Обновлена функция `handleWalletConnected` для разделения логики:
     - **Real Mode**: использует `connectRealWallet()` с адресом реального кошелька
     - **Demo Mode**: использует `connectWallet()` для создания демо-кошелька

3. **Обновлена документация**:
   - Добавлены диагностические функции в `WALLET_CONNECTION_TROUBLESHOOTING.md`
   - Улучшены скрипты отладки в `wallet-conflict-fix.js`

## Как проверить, что исправление работает

### 1. Автоматическая проверка
Откройте консоль браузера (F12) и выполните:
```javascript
diagnoseRealModeConnection()
```

### 2. Ручная проверка
1. **Выберите Real Mode** в приложении
2. **Подключите ваш настоящий кошелек** (Azguard, Obsidion)
3. **Проверьте адрес**: адрес в приложении должен совпадать с адресом в вашем кошельке
4. **Проверьте режим**: в заголовке должно отображаться "🌐 Real Mode"

### 3. Консольная диагностика
Выполните в консоли для полной проверки:
```javascript
console.log('App Mode:', localStorage.getItem('appMode'))
console.log('Wallet Mode:', localStorage.getItem('walletMode'))
console.log('Wallet Address:', localStorage.getItem('walletAddress'))
```

**Ожидаемые значения для Real Mode:**
- `appMode`: `"real"`
- `walletMode`: `"aztec"`
- `walletAddress`: адрес вашего реального кошелька

## Если проблема все еще существует

### Быстрое исправление
Выполните в консоли браузера:
```javascript
fixRealModeConnection()
```

### Ручное исправление
1. Очистите состояние:
```javascript
localStorage.removeItem('walletAddress')
localStorage.removeItem('walletMode')
localStorage.removeItem('aztecConnectedWallet')
localStorage.removeItem('aztecWalletDisconnected')
window.location.reload()
```

2. Выберите Real Mode заново
3. Подключите ваш настоящий кошелек

## Технические детали

### Логика до исправления:
```javascript
// НЕПРАВИЛЬНО: всегда создавал демо-кошелек
const handleWalletConnected = async (address: string) => {
  const aztecAddress = await connectWallet() // Создавал новый демо-кошелек!
  localStorage.setItem('walletAddress', aztecAddress)
}
```

### Логика после исправления:
```javascript
// ПРАВИЛЬНО: различает реальные и демо кошельки
const handleWalletConnected = async (address: string) => {
  if (walletMode === 'aztec' && appMode === 'real') {
    connectRealWallet(address) // Использует реальный адрес
  } else {
    const aztecAddress = await connectWallet() // Создает демо только для demo mode
  }
}
```

## Результат
Теперь в **Real Mode** приложение корректно использует адрес фактически подключенного настоящего кошелька (Azguard, Obsidion и т.д.), а не создает новый демо-кошелек.

---

**Дата исправления**: $(date)  
**Версия**: v1.3  
**Затронутые файлы**: `src/lib/aztec-context.tsx`, `src/app/page.tsx` 