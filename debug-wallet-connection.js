/**
 * Enhanced Wallet Connection Debug Script v1.3
 * Добавлена диагностика проблемы с Real Mode
 */

console.log('🔍 Enhanced Wallet Connection Diagnostics v1.3');
console.log('================================================');

// 1. Check Real Mode Connection Issue
console.log('\n🌐 Real Mode Connection Diagnostics:');
const appMode = localStorage.getItem('appMode')
const walletMode = localStorage.getItem('walletMode')
const connectedWallet = localStorage.getItem('aztecConnectedWallet')
const walletAddress = localStorage.getItem('walletAddress')

console.log('App Mode:', appMode)
console.log('Wallet Mode:', walletMode)
console.log('Connected Wallet:', connectedWallet)
console.log('Wallet Address:', walletAddress)

// Check if this is the problematic scenario
if (appMode === 'real' && walletMode === 'aztec' && connectedWallet) {
  console.log('✅ Real Mode with Aztec wallet - checking if real wallet is connected...')
  
  // In the fix, real wallets should set walletMode to 'aztec' correctly
  if (walletAddress && walletAddress.startsWith('0x')) {
    console.log('✅ Real wallet address detected:', walletAddress)
  } else {
    console.log('❌ Demo wallet address detected - this indicates the bug exists')
    console.log('🔧 Try the fix commands below')
  }
} else if (appMode === 'demo') {
  console.log('ℹ️ Demo Mode - this is expected to use demo wallets')
} else {
  console.log('⚠️ Unclear configuration')
}

// 2. Enhanced function for Real Mode diagnostics
window.diagnoseRealModeConnection = function() {
  console.log('\n🔍 Real Mode Connection Analysis:')
  
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
  
  console.table(diagnosis)
  
  // Analyze the situation
  if (diagnosis.appMode === 'real' && diagnosis.walletMode === 'aztec') {
    if (diagnosis.azguardActive) {
      console.log('✅ Configuration looks correct for Real Mode with Azguard')
      
      // Check if the wallet address seems real or demo
      if (diagnosis.walletAddress && diagnosis.walletAddress.length > 10) {
        console.log('✅ Wallet address appears to be real:', diagnosis.walletAddress)
      } else {
        console.log('❌ Wallet address appears to be demo/invalid')
      }
    } else {
      console.log('❌ Real Mode selected but no Azguard wallet found')
      console.log('💡 Make sure Azguard extension is installed and enabled')
    }
  } else if (diagnosis.appMode === 'demo') {
    console.log('ℹ️ Demo Mode - using simulated wallet')
  }
  
  return diagnosis
}

// 3. Fix function for Real Mode connection issue
window.fixRealModeConnection = function() {
  console.log('\n🔧 Fixing Real Mode Connection Issue...')
  
  // Clear potentially conflicting data
  const keysToRemove = [
    'walletAddress',
    'walletMode', 
    'aztecConnectedWallet',
    'aztecWalletDisconnected'
  ]
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
    console.log('Removed:', key)
  })
  
  // Set proper Real Mode configuration
  localStorage.setItem('appMode', 'real')
  localStorage.setItem('walletMode', 'aztec')
  
  console.log('✅ Real Mode configuration restored')
  console.log('🔄 Please reload the page and connect your real wallet again')
  
  setTimeout(() => {
    if (confirm('Reload page now to apply fixes?')) {
      window.location.reload()
    }
  }, 2000)
}

// 4. Previous wallet conflict diagnostics (existing code)
console.log('\n💳 Статус window.ethereum:');
console.log('window.ethereum существует:', !!window.ethereum);
console.log('isMetaMask:', window.ethereum?.isMetaMask);
console.log('providers:', window.ethereum?.providers?.length || 'N/A');

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