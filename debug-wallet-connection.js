/**
 * Скрипт для диагностики проблем с подключением кошелька Aztec
 * Выполните этот код в консоли браузера на странице приложения
 */

console.log('🔍 Диагностика подключения кошелька Aztec');
console.log('=====================================');

// Проверяем localStorage
console.log('\n📱 Данные локального хранилища:');
console.log('Сеть:', localStorage.getItem('aztecNetwork'));
console.log('Адрес кошелька:', localStorage.getItem('walletAddress'));
console.log('Режим кошелька:', localStorage.getItem('walletMode'));
console.log('Privy статус:', localStorage.getItem('privyLoggedOut'));

// Проверяем window объекты
console.log('\n🌐 Объекты в window:');
console.log('ethereum:', typeof window.ethereum);
console.log('MetaMask:', typeof window.ethereum?.isMetaMask);

// Проверяем состояние Aztec контекста (если доступен)
try {
  console.log('\n⚗️ React состояние (если доступно):');
  // Эта проверка работает только если у нас есть доступ к React DevTools
  const reactFiberNode = document.querySelector('[data-reactroot]') || document.querySelector('#__next');
  if (reactFiberNode && reactFiberNode._reactInternalFiber) {
    console.log('React компонент найден, но детальная диагностика требует React DevTools');
  }
} catch (e) {
  console.log('React диагностика недоступна');
}

// Проверяем ошибки в консоли
console.log('\n❌ Проверьте консоль на наличие ошибок с ключевыми словами:');
console.log('- "Cannot find module"');
console.log('- "Кошелек не подключен"'); 
console.log('- "Контракт не подключен"');
console.log('- "MetaMask encountered an error"');

// Рекомендации
console.log('\n💡 Рекомендации для решения:');
console.log('1. Если сеть = "testnet" → переключитесь на "sandbox"');
console.log('2. Если walletAddress = null → переподключите кошелек');
console.log('3. Если много ошибок MetaMask → отключите другие кошельки');
console.log('4. Если ошибки "Cannot find module" → используйте демо режим');

console.log('\n🔧 Быстрое исправление - запустите:');
console.log('localStorage.setItem("aztecNetwork", "sandbox")');
console.log('localStorage.removeItem("walletAddress")');
console.log('window.location.reload()');

// Функция для быстрого сброса
window.resetAztecWallet = function() {
  console.log('🔄 Сброс настроек кошелька...');
  localStorage.removeItem('walletAddress');
  localStorage.removeItem('walletMode');
  localStorage.removeItem('privyLoggedOut');
  localStorage.setItem('aztecNetwork', 'sandbox');
  console.log('✅ Настройки сброшены. Перезагрузите страницу.');
  setTimeout(() => window.location.reload(), 1000);
};

console.log('\n🚀 Для полного сброса выполните: resetAztecWallet()'); 