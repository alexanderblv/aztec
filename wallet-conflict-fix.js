/**
 * Wallet Conflict Diagnostic and Fix Script
 * Выполните этот код в консоли браузера для диагностики и исправления конфликтов кошельков
 */

console.log('🔍 Диагностика конфликтов кошельков');
console.log('===================================');

// 1. Проверяем состояние window.ethereum
console.log('\n💳 Статус window.ethereum:');
console.log('window.ethereum существует:', !!window.ethereum);
console.log('isMetaMask:', window.ethereum?.isMetaMask);
console.log('providers:', window.ethereum?.providers?.length || 'N/A');

// 2. Проверяем установленные расширения кошельков
console.log('\n🔌 Установленные кошельки:');
if (window.ethereum?.providers) {
  window.ethereum.providers.forEach((provider, index) => {
    console.log(`Provider ${index + 1}:`, {
      isMetaMask: provider.isMetaMask,
      isAzguard: provider.isAzguard,
      constructor: provider.constructor.name
    });
  });
} else {
  console.log('Один кошелек или нет провайдеров');
}

// 3. Функция для очистки конфликтующих провайдеров
window.fixWalletConflicts = function() {
  console.log('\n🔧 Исправление конфликтов кошельков...');
  
  try {
    // Сохраняем оригинальный ethereum если он существует
    if (window.ethereum) {
      window._originalEthereum = window.ethereum;
    }
    
    // Отключаем все Ethereum провайдеры
    if (window.ethereum?.providers) {
      window.ethereum.providers.forEach(provider => {
        if (provider.removeAllListeners) {
          provider.removeAllListeners();
        }
      });
    }
    
    // Очищаем localStorage от данных кошельков
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('metamask') || 
        key.includes('wallet') || 
        key.includes('ethereum') ||
        key.includes('aztec')
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      console.log('Удаляем ключ:', key);
      localStorage.removeItem(key);
    });
    
    // Устанавливаем приоритет для Azguard
    localStorage.setItem('preferredWallet', 'azguard');
    localStorage.setItem('walletConflictResolved', 'true');
    
    console.log('✅ Конфликты исправлены. Перезагружаем страницу...');
    setTimeout(() => window.location.reload(), 1000);
    
  } catch (error) {
    console.error('❌ Ошибка при исправлении конфликтов:', error);
  }
};

// 4. Функция для принудительного подключения к Azguard
window.forceConnectAzguard = function() {
  console.log('\n🛡️ Принудительное подключение к Azguard...');
  
  // Попытка найти Azguard провайдер
  let azguardProvider = null;
  
  if (window.ethereum?.providers) {
    azguardProvider = window.ethereum.providers.find(p => p.isAzguard);
  } else if (window.ethereum?.isAzguard) {
    azguardProvider = window.ethereum;
  }
  
  if (azguardProvider) {
    console.log('✅ Azguard провайдер найден');
    
    // Попытка подключения
    azguardProvider.request({ method: 'eth_requestAccounts' })
      .then(accounts => {
        console.log('✅ Успешно подключен к Azguard:', accounts);
        localStorage.setItem('azguardConnected', 'true');
        localStorage.setItem('connectedWallet', 'azguard');
      })
      .catch(error => {
        if (error.code === 4001) {
          console.log('❌ Пользователь отклонил подключение');
        } else {
          console.error('❌ Ошибка подключения:', error);
        }
      });
  } else {
    console.log('❌ Azguard провайдер не найден');
    console.log('💡 Убедитесь, что расширение Azguard установлено и активно');
  }
};

// 5. Функция для отключения MetaMask
window.disableMetaMask = function() {
  console.log('\n🦊 Временное отключение MetaMask...');
  
  if (window.ethereum?.isMetaMask) {
    // Удаляем MetaMask провайдер из window
    try {
      delete window.ethereum;
      console.log('✅ MetaMask провайдер удален');
    } catch (e) {
      console.log('⚠️ Не удалось удалить MetaMask провайдер (read-only)');
    }
  }
  
  // Блокируем инициализацию MetaMask
  Object.defineProperty(window, 'ethereum', {
    get: function() {
      console.log('🚫 MetaMask заблокирован');
      return undefined;
    },
    set: function(value) {
      if (value && value.isMetaMask) {
        console.log('🚫 Попытка установки MetaMask заблокирована');
        return false;
      }
      return value;
    },
    configurable: true
  });
  
  localStorage.setItem('metamaskDisabled', 'true');
  console.log('✅ MetaMask временно отключен');
};

// 6. Автоматическая диагностика и рекомендации
console.log('\n💡 Рекомендации:');

if (window.ethereum?.providers && window.ethereum.providers.length > 1) {
  console.log('🔴 Обнаружено несколько кошельков - возможен конфликт');
  console.log('   Выполните: fixWalletConflicts()');
} else if (window.ethereum?.isMetaMask && !window.ethereum?.isAzguard) {
  console.log('🟡 Активен только MetaMask');
  console.log('   Выполните: forceConnectAzguard() или disableMetaMask()');
} else if (window.ethereum?.isAzguard) {
  console.log('🟢 Azguard активен');
  console.log('   Выполните: forceConnectAzguard()');
} else {
  console.log('🔴 Кошельки не найдены');
  console.log('   Убедитесь, что Azguard установлен');
}

console.log('\n🚀 Доступные команды:');
console.log('fixWalletConflicts() - исправить конфликты');
console.log('forceConnectAzguard() - подключиться к Azguard');
console.log('disableMetaMask() - отключить MetaMask');
console.log('diagnoseRealModeConnection() - диагностика Real Mode подключения');
console.log('fixRealModeConnection() - исправить проблему Real Mode');

// 7. Автоматическое исправление при загрузке (если включено)
if (localStorage.getItem('autoFixWalletConflicts') === 'true') {
  console.log('\n🔄 Автоматическое исправление включено...');
  setTimeout(() => window.fixWalletConflicts(), 2000);
}

// 8. Диагностика проблемы Real Mode (новая функция)
window.diagnoseRealModeConnection = function() {
  console.log('\n🔍 Диагностика подключения в Real Mode...');
  
  const appMode = localStorage.getItem('appMode')
  const walletMode = localStorage.getItem('walletMode')
  const connectedWallet = localStorage.getItem('aztecConnectedWallet')
  const walletAddress = localStorage.getItem('walletAddress')
  
  const diagnosis = {
    appMode,
    walletMode,
    connectedWallet,
    walletAddress,
    realWalletProviders: window.ethereum?.providers?.length || 'single provider',
    azguardActive: window.ethereum?.isAzguard || 
      window.ethereum?.providers?.some(p => p.isAzguard)
  }
  
  console.table(diagnosis)
  
  // Анализ проблемы
  if (appMode === 'real' && walletMode === 'aztec' && connectedWallet) {
    if (walletAddress && walletAddress.length > 10) {
      console.log('✅ Real Mode настроен правильно, настоящий кошелек подключен')
    } else {
      console.log('❌ Real Mode настроен, но подключен демо-кошелек')
      console.log('💡 Выполните: fixRealModeConnection()')
    }
  } else if (appMode === 'demo') {
    console.log('ℹ️ Demo Mode - использование демо-кошелька корректно')
  } else {
    console.log('⚠️ Неопределенная конфигурация')
  }
  
  return diagnosis
}

// 9. Исправление проблемы Real Mode (новая функция)
window.fixRealModeConnection = function() {
  console.log('\n🔧 Исправление проблемы подключения в Real Mode...');
  
  // Очистить конфликтующие данные
  const keysToRemove = [
    'walletAddress',
    'walletMode',
    'aztecConnectedWallet',
    'aztecWalletDisconnected'
  ]
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
    console.log('Удалено:', key)
  })
  
  // Установить корректную конфигурацию Real Mode
  localStorage.setItem('appMode', 'real')
  localStorage.setItem('walletMode', 'aztec')
  localStorage.setItem('realModeFixed', 'true')
  
  console.log('✅ Конфигурация Real Mode восстановлена')
  console.log('🔄 Перезагрузите страницу и подключите ваш настоящий кошелек заново')
  
  setTimeout(() => {
    if (confirm('Перезагрузить страницу сейчас для применения исправлений?')) {
      window.location.reload()
    }
  }, 2000)
} 