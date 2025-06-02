# Исправление ошибки Environment Variable в Vercel

## Проблема
```
Environment Variable "NEXT_PUBLIC_AZTEC_PXE_URL" references Secret "aztec_pxe_url", which does not exist.
```

## Решения

### 🎯 Быстрое решение (Рекомендуется)

**Шаг 1**: Файл `vercel.json` уже исправлен - теперь используются обычные переменные окружения вместо секретов.

**Шаг 2**: Настройте переменные окружения в Vercel Dashboard:

1. Откройте ваш проект на [vercel.com](https://vercel.com)
2. Перейдите в `Settings` → `Environment Variables`
3. Добавьте новую переменную:
   - **Name**: `NEXT_PUBLIC_AZTEC_PXE_URL`
   - **Value**: `https://aztec-testnet.com:8080` (или ваш URL)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

**Шаг 3**: Переразверните проект:
- Перейдите в `Deployments`
- Нажмите на кнопку "Redeploy" для последнего развертывания

### 🔧 Альтернативное решение через CLI

Если у вас установлен Vercel CLI:

```bash
# Установка CLI
npm install -g vercel

# Вход в аккаунт
vercel login

# Добавление переменной
vercel env add NEXT_PUBLIC_AZTEC_PXE_URL production
# Введите: https://aztec-testnet.com:8080

# Развертывание
vercel --prod
```

### 🔐 Если нужны секреты (для чувствительных данных)

Если вы хотите использовать секреты Vercel для чувствительных данных:

```bash
# Создание секрета
vercel secrets add aztec_pxe_url "https://your-aztec-node.com:8080"

# Вернуть в vercel.json синтаксис @secret_name
# "NEXT_PUBLIC_AZTEC_PXE_URL": "@aztec_pxe_url"
```

## Рекомендуемые значения

### Для разработки/тестирования:
- `NEXT_PUBLIC_AZTEC_PXE_URL`: `https://aztec-testnet.com:8080`

### Для продакшена:
- `NEXT_PUBLIC_AZTEC_PXE_URL`: URL вашего Aztec node

## Проверка

После настройки переменных, проверьте что они доступны:

```javascript
// В компоненте Next.js
console.log('Aztec PXE URL:', process.env.NEXT_PUBLIC_AZTEC_PXE_URL);
```

## Дополнительные переменные

Также могут понадобиться:

- `AZTEC_CONTRACT_ADDRESS` - адрес развернутого контракта
- `NEXT_PUBLIC_APP_URL` - URL вашего приложения

## Поддержка

Если проблема не решена:
1. Проверьте правильность написания имен переменных
2. Убедитесь что переменные добавлены для правильного окружения (Production/Preview/Development)
3. Попробуйте переразвернуть проект
4. Проверьте логи развертывания в Vercel Dashboard 