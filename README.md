# 🔒 Платформа Приватных Аукционов

## Описание

Веб-платформа приватных аукционов, построенная на передовой технологии **Aztec Network**. Участники могут делать приватные ставки, которые остаются полностью зашифрованными до завершения аукциона. Только победитель раскрывается в конце торгов.

## 🌟 Особенности

### 🔐 Полная Приватность
- **Зашифрованные ставки**: Все ставки зашифрованы и невидимы даже создателю аукциона
- **Zero-Knowledge доказательства**: Использует zk-SNARK для обеспечения честности без раскрытия данных
- **Анонимность участников**: Личности участников остаются скрытыми до определения победителя

### ⚡ Технологии
- **Aztec Network**: Приватная L2 сеть на Ethereum
- **Smart Contracts**: Написаны на Noir (язык Aztec)
- **Next.js 14**: Современный React фреймворк
- **TypeScript**: Типизированная разработка
- **Tailwind CSS**: Утилитарные стили

### 🏆 Честные Торги
- **Автоматическое определение победителя**: Без возможности манипуляций
- **Прозрачная публичная информация**: Описание предметов доступно всем
- **Неизменяемые ставки**: После размещения ставку нельзя изменить

## 🚀 Быстрый Старт

### Предварительные требования

```bash
# Node.js 18+ и npm
node --version
npm --version

# Aztec Sandbox (для разработки)
# Следуйте инструкциям: https://docs.aztec.network/
```

### Установка

```bash
# Клонирование репозитория
git clone <your-repo-url>
cd private-auction-platform

# Установка зависимостей
npm install

# Запуск Aztec Sandbox (в отдельном терминале)
aztec-sandbox

# Компиляция смарт-контрактов
npm run compile

# Запуск веб-приложения
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 📋 Архитектура

### Смарт-Контракт (`contracts/src/main.nr`)
```noir
contract PrivateAuction {
    // Приватные ставки как зашифрованные ноты
    struct BidNote {
        amount: Field,
        bidder: AztecAddress,
        auction_id: Field,
        random: Field,
    }
    
    // Публичная информация об аукционах
    struct AuctionInfo {
        item_name: Field,
        description: Field,
        start_time: Field,
        end_time: Field,
        min_bid: Field,
        creator: AztecAddress,
        is_active: bool,
    }
}
```

### Веб-Интерфейс
- **Header**: Информация о кошельке и навигация
- **AuctionList**: Отображение всех аукционов
- **CreateAuctionModal**: Создание новых аукционов
- **BidModal**: Размещение приватных ставок
- **WalletConnect**: Подключение к Aztec

## 🔧 Основные Функции

### Создание Аукциона
```typescript
// Публичная функция - информация видна всем
await contract.methods.create_auction(
    itemName,     // Название предмета
    description,  // Описание
    duration,     // Продолжительность в часах
    minBid       // Минимальная ставка
).send()
```

### Размещение Приватной Ставки
```typescript
// Приватная функция - ставка зашифрована
await contract.methods.place_bid(
    auctionId,   // ID аукциона
    amount       // Размер ставки (зашифрован)
).send()
```

### Завершение Аукциона
```typescript
// Определение победителя через zk-доказательства
await contract.methods.finalize_auction(auctionId).send()
```

## 🛡️ Безопасность

### Криптографические Гарантии
- **Педерсен хеширование**: Для создания commitment'ов ставок
- **zk-SNARK доказательства**: Для приватного сравнения ставок
- **Nullifier'ы**: Предотвращение двойных трат
- **Временные метки**: Защита от атак на время

### Модель Угроз
✅ **Защищено от**:
- Просмотра чужих ставок
- Манипуляций с результатами
- Атак на доступность (через L2)
- MEV атак (благодаря приватности)

⚠️ **Ограничения**:
- Требуется доверие к Aztec Sequencer
- Зависимость от безопасности Ethereum L1
- Возможные timing атаки (смягчены)

## 🌐 Развертывание

### Vercel (Рекомендуется)
```bash
# Установка Vercel CLI
npm i -g vercel

# Развертывание
vercel --prod

# Настройка переменных окружения
vercel env add AZTEC_PXE_URL
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Тестирование

```bash
# Тестирование смарт-контрактов
npm run test

# Проверка типов TypeScript
npm run type-check

# Линтинг кода
npm run lint
```

## 📖 Документация API

### Aztec Service Methods

#### `createWallet(): Promise<string>`
Создает новый Aztec кошелек

#### `connectWallet(privateKey: string): Promise<string>`
Подключается к существующему кошельку

#### `createAuction(itemName, description, duration, minBid): Promise<number>`
Создает новый аукцион

#### `placeBid(auctionId: number, amount: number): Promise<void>`
Размещает приватную ставку

#### `getAuctionInfo(auctionId: number): Promise<AuctionInfo>`
Получает публичную информацию об аукционе

#### `getWinner(auctionId: number): Promise<Winner>`
Получает информацию о победителе (после завершения)

## 🤝 Участие в Разработке

### Workflow
1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

### Стандарты Кода
- ESLint + Prettier для JavaScript/TypeScript
- Noir formatter для смарт-контрактов
- Conventional Commits для сообщений

## 🐛 Известные Проблемы

- [ ] Демо-режим с моковыми данными (требуется реальная интеграция с Aztec)
- [ ] Отсутствует обработка сетевых ошибок
- [ ] Нет персистентного хранения состояния
- [ ] Требуется оптимизация производительности для больших аукционов

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE) файл

## 🔗 Полезные Ссылки

- [Aztec Documentation](https://docs.aztec.network/)
- [Noir Language](https://noir-lang.org/)
- [Aztec Sandbox](https://docs.aztec.network/dev_docs/getting_started/sandbox)
- [Zero-Knowledge Proofs](https://ethereum.org/en/zero-knowledge-proofs/)

## 📞 Поддержка

- 💬 [Discord сообщество](https://discord.gg/aztec)
- 🐛 [GitHub Issues](https://github.com/your-repo/issues)
- 📧 Email: support@yourplatform.com

---

**Сделано с ❤️ и технологией Aztec Network**

# 🎯 Private Auction Platform on Aztec

Веб-платформа приватных аукционов, построенная на блокчейне Aztec Network с использованием технологий zero-knowledge proof.

## 🚨 ВАЖНО: Настройка подключения кошельков

**Сейчас подключение кошельков работает в демо-режиме!** Для работы с настоящими кошельками через [Privy](https://www.privy.io/) выполните следующие шаги:

### Шаг 1: Установите зависимости
```bash
npm install --legacy-peer-deps
```

### Шаг 2: Настройте Privy App ID
1. Зарегистрируйтесь на [console.privy.io](https://console.privy.io/)
2. Создайте новое приложение 
3. Скопируйте App ID
4. Создайте файл `.env.local` в корне проекта:
```env
NEXT_PUBLIC_PRIVY_APP_ID=ваш_app_id_здесь
```

### Шаг 3: Перезапустите приложение
```bash
npm run dev
```

После этого вместо демо-версии у вас будет **настоящее** подключение кошельков с поддержкой:
- 📧 Email и SMS входа
- 👛 Внешних кошельков (MetaMask, WalletConnect)
- 🔒 Встроенных безопасных кошельков Privy
- 🌐 Google и социальных сетей

📚 **Подробные инструкции:** см. файлы `PRIVY_INTEGRATION.md` и `DEPENDENCY_FIX.md`

---

## ✨ Функции платформы

// ... existing code ... 