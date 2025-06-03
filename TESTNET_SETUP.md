# 🌐 Настройка Aztec Testnet

## Проблема: Приложение использует локальную симуляцию вместо реальной тестовой сети

Если при выборе "Alpha Testnet" приложение все равно работает в режиме эмуляции, выполните следующие шаги:

## ✅ Решение

### 1. Установите Aztec CLI
```bash
# Установка Aztec CLI
bash -i <(curl -s https://install.aztec.network)

# Установка версии alpha-testnet
aztec-up alpha-testnet
```

### 2. Создайте конфигурацию для testnet
```bash
# Создайте файл .env.local на основе env.testnet
cp env.testnet .env.local
```

### 3. Обновите Privy конфигурацию (если используете)
Отредактируйте `.env.local` и добавьте ваши реальные Privy ключи:
```bash
NEXT_PUBLIC_PRIVY_APP_ID=ваш_реальный_privy_app_id
PRIVY_APP_SECRET=ваш_реальный_privy_secret
```

### 4. Запустите приложение для testnet
```bash
npm run dev:testnet
```

## 🔍 Как проверить, что подключение работает

### В веб-интерфейсе:
1. Выберите "Alpha Testnet" в селекторе сети
2. При подключении кошелька должно отображаться: 
   - "Подключение к Aztec Testnet" (вместо Sandbox)
   - "🌐 Подключение к реальной тестовой сети Aztec Alpha Testnet"

### В консоли браузера:
Откройте Dev Tools (F12) и ищите сообщения:
```
Подключение к Aztec Testnet успешно
PXE URL: https://aztec-alpha-testnet-fullnode.zkv.xyz
```

### В терминале:
При запуске `npm run dev:testnet` должно появиться:
```
env.testnet -> .env.local
```

## 🚨 Возможные проблемы

### Ошибка "Cannot find module '@aztec/aztec.js'"
```bash
# Переустановите зависимости
rm -rf node_modules package-lock.json
npm install
```

### Ошибка подключения к testnet
```bash
# Проверьте переменные окружения
cat .env.local | grep AZTEC_PXE_URL

# Должно быть:
# NEXT_PUBLIC_AZTEC_PXE_URL=https://aztec-alpha-testnet-fullnode.zkv.xyz
```

### Timeout при создании кошелька
- Это нормально для testnet
- Транзакции могут занимать до 30-60 секунд
- Не перезагружайте страницу во время ожидания

## 📚 Полезные ссылки

- [Официальная документация Aztec Testnet](https://docs.aztec.network/developers/guides/getting_started_on_testnet)
- [Aztec Explorer для Testnet](https://aztecscan.io/)
- [Статус сети Aztec](https://status.aztec.network/)

## 🆘 Получение помощи

Если проблемы остаются:
1. Проверьте консоль браузера на ошибки
2. Убедитесь, что используете версию `alpha-testnet` Aztec CLI
3. Попробуйте очистить кеш браузера
4. Создайте issue в репозитории с подробным описанием ошибки 