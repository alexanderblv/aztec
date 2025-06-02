# 🚀 Руководство по Развертыванию

## Развертывание на Vercel (Рекомендуется)

### 1. Подготовка

```bash
# Установка Vercel CLI
npm i -g vercel

# Вход в аккаунт
vercel login
```

### 2. Настройка переменных окружения

#### Способ 1: Через Vercel CLI (Обычные переменные окружения)

```bash
# Создание переменных среды
vercel env add NEXT_PUBLIC_AZTEC_PXE_URL production
# Введите: https://your-aztec-node.com или демо URL

vercel env add AZTEC_CONTRACT_ADDRESS production
# Введите адрес развернутого контракта
```

#### Способ 2: Через Web Dashboard Vercel

1. Зайдите в ваш проект на https://vercel.com
2. Перейдите в Settings → Environment Variables
3. Добавьте переменные:
   - `NEXT_PUBLIC_AZTEC_PXE_URL` = `https://your-aztec-node.com:8080`
   - `AZTEC_CONTRACT_ADDRESS` = адрес вашего контракта

#### Способ 3: Использование Vercel Secrets (Для чувствительных данных)

```bash
# Создание секретов (для приватных ключей и чувствительных данных)
vercel secrets add private_key "your-private-key-here"
vercel secrets add database_url "your-database-connection-string"

# В vercel.json используйте синтаксис @secret_name
# {
#   "env": {
#     "PRIVATE_KEY": "@private_key",
#     "DATABASE_URL": "@database_url"
#   }
# }
```

**Примечание**: Если вы получаете ошибку "Secret does not exist", убедитесь что:
1. Секрет создан правильно с помощью `vercel secrets add`
2. Или используйте обычные переменные окружения вместо секретов

### 3. Развертывание

```bash
# Первое развертывание
vercel --prod

# Или автоматическое развертывание через Git
git push origin main
```

## Развертывание на собственном сервере

### Docker

```dockerfile
# Dockerfile уже создан в корне проекта
docker build -t private-auction-platform .
docker run -p 3000:3000 -e NEXT_PUBLIC_AZTEC_PXE_URL=http://your-aztec-node:8080 private-auction-platform
```

### PM2 (Node.js)

```bash
# Установка PM2
npm install -g pm2

# Сборка проекта
npm run build

# Запуск с PM2
pm2 start npm --name "auction-platform" -- start
pm2 save
pm2 startup
```

## Настройка Aztec Infrastructure

### 1. Aztec Sandbox (Разработка)

```bash
# Установка Aztec CLI
npm install -g @aztec/cli

# Запуск sandbox
aztec-sandbox
```

### 2. Aztec Testnet (Тестирование)

```bash
# Подключение к тестнету
export AZTEC_PXE_URL=https://aztec-testnet.com:8080

# Развертывание контракта
aztec-cli deploy PrivateAuction
```

### 3. Aztec Mainnet (Продакшн)

```bash
# Настройка для основной сети
export AZTEC_PXE_URL=https://aztec-mainnet.com:8080
export PRIVATE_KEY=your-deployment-key

# Развертывание
aztec-cli deploy PrivateAuction --network mainnet
```

## Мониторинг и Логирование

### Vercel Analytics

```bash
# Установка аналитики
npm install @vercel/analytics

# Добавление в _app.tsx
import { Analytics } from '@vercel/analytics/react'
```

### Sentry (Отслеживание ошибок)

```bash
npm install @sentry/nextjs

# Настройка sentry.client.config.js
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
})
```

## Оптимизация Производительности

### Next.js Optimizations

```javascript
// next.config.js
module.exports = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-cdn.com'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}
```

### CDN Настройка

```bash
# Vercel автоматически использует глобальный CDN
# Для других платформ настройте CloudFlare или AWS CloudFront
```

## Безопасность

### HTTPS

```bash
# Vercel автоматически предоставляет SSL
# Для собственного сервера используйте Let's Encrypt

certbot --nginx -d yourdomain.com
```

### Environment Variables

```bash
# Никогда не коммитьте приватные ключи
# Используйте переменные окружения для всех секретов

PRIVATE_KEY=...
AZTEC_CONTRACT_ADDRESS=...
DATABASE_URL=...
```

### Rate Limiting

```javascript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Реализация rate limiting
  const ip = request.ip ?? 'unknown'
  // ... логика ограничения запросов
}
```

## Backup и Recovery

### Database Backup

```bash
# Если используете базу данных
pg_dump auction_platform > backup.sql

# Восстановление
psql auction_platform < backup.sql
```

### Contract State Backup

```bash
# Бэкап состояния Aztec контракта
aztec-cli export-state --contract $CONTRACT_ADDRESS > state-backup.json

# Восстановление при необходимости
aztec-cli import-state state-backup.json
```

## Обновление

### Rolling Updates

```bash
# Использование Vercel для zero-downtime updates
vercel --prod

# Или blue-green deployment
vercel alias set preview-deployment.vercel.app your-domain.com
```

### Contract Upgrades

```bash
# Развертывание новой версии контракта
aztec-cli deploy PrivateAuctionV2

# Обновление frontend для использования нового адреса
vercel env add AZTEC_CONTRACT_ADDRESS production
```

## Мониторинг

### Health Checks

```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  })
}
```

### Uptime Monitoring

```bash
# Настройка мониторинга с помощью:
# - UptimeRobot
# - Pingdom  
# - New Relic
# - DataDog
```

## Troubleshooting

### Частые проблемы

1. **Ошибка подключения к Aztec**
   ```bash
   # Проверьте доступность PXE
   curl $AZTEC_PXE_URL/health
   ```

2. **Медленная загрузка**
   ```bash
   # Проверьте размер bundle
   npm run analyze
   ```

3. **Ошибки транзакций**
   ```bash
   # Проверьте логи Aztec node
   aztec-cli logs
   ```

### Логи

```bash
# Vercel функции
vercel logs your-deployment-url

# Docker контейнер
docker logs container-id

# PM2 процесс
pm2 logs auction-platform
```

## Контакты для Поддержки

- 📧 DevOps: devops@yourcompany.com
- 💬 Slack: #infrastructure
- 🐛 Issues: GitHub Issues
- 📞 Экстренная связь: +1-XXX-XXX-XXXX 