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

# Vercel Deployment Fix

## Build Error Solution

The build is failing because `createAccount` is not exported from `@aztec/aztec.js` in the current version. Here's how to fix it:

### 1. Fix the Import Issue

The error occurs at `src/lib/aztec.ts:8:3` where `createAccount` is imported but doesn't exist.

**Solution:**
Remove `createAccount` from the imports in `src/lib/aztec.ts`:

```typescript
// BEFORE (causing error):
import { 
  AztecAddress, 
  Contract, 
  createPXEClient, 
  Fr, 
  PXE,
  TxStatus,
  createAccount,  // ❌ This doesn't exist
  AccountWallet,
  getSchnorrAccount,
} from '@aztec/aztec.js';

// AFTER (fixed):
import { 
  AztecAddress, 
  Contract, 
  createPXEClient, 
  Fr, 
  PXE,
  TxStatus,
  AccountWallet,
  getSchnorrAccount,
} from '@aztec/aztec.js';
```

### 2. Account Creation in Current Aztec.js

In the current Aztec.js API, accounts are created using `getSchnorrAccount` instead of `createAccount`. The existing code in the `createWallet()` method is already correct:

```typescript
async createWallet(): Promise<string> {
  if (!this.pxe) throw new Error('PXE не инициализирован');

  try {
    // ✅ This is the correct way to create accounts
    const secretKey = Fr.random();
    const account = getSchnorrAccount(this.pxe, secretKey, secretKey);
    
    this.wallet = await account.waitForDeployment();
    const address = this.wallet.getAddress();
    
    console.log('Новый кошелек создан:', address.toString());
    return address.toString();
  } catch (error) {
    console.error('Ошибка создания кошелька:', error);
    throw error;
  }
}
```

### 3. Package Dependencies

Make sure your `package.json` has the correct Aztec dependencies:

```json
{
  "dependencies": {
    "@aztec/aztec.js": "latest",
    "@aztec/accounts": "latest",
    "@aztec/types": "latest"
  }
}
```

### 4. Contract Compilation

Before deploying, you need to compile the Noir contract:

```bash
npm run compile
```

This will generate the TypeScript bindings for your contract.

### 5. Environment Setup

For local development:

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Start development server
npm run dev
```

For deployment:

```bash
# Build for production
npm run build
```

## Quick Fix for Immediate Deployment

To fix the immediate build error, simply remove `createAccount` from the import statement in `src/lib/aztec.ts` line 8.

The rest of the code is correct and follows the current Aztec.js API patterns.

# Build Process Fixes and Improvements

This document tracks the fixes applied to resolve build errors and improve the deployment process.

## Issue #2: @aztec/accounts Import Error (Fixed)

### Problem
Build was failing with the error:
```
Type error: Cannot find module '@aztec/accounts' or its corresponding type declarations.
```

The import statement was using the wrong path:
```typescript
import { getSchnorrAccount } from '@aztec/accounts';
```

### Root Cause
The `@aztec/accounts` package uses subpath exports. The `getSchnorrAccount` function is located in a specific submodule that must be imported using the correct subpath.

### Solution
Updated the import statement in `src/lib/aztec.ts` to use the correct subpath:

```typescript
// Before (incorrect)
import { getSchnorrAccount } from '@aztec/accounts';

// After (correct)
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
```

### Technical Details
- According to the [@aztec/accounts documentation](https://www.npmjs.com/package/@aztec/accounts), the package exports account types through specific subpaths
- Schnorr accounts should be imported from `@aztec/accounts/schnorr`
- This pattern follows Node.js subpath exports convention
- The package structure includes multiple account types: Schnorr, ECDSA, and SingleKey

### Files Modified
- `src/lib/aztec.ts`: Fixed import statement on line 8

### Verification
After this fix, the TypeScript compilation should succeed. The build error should be resolved as the module resolution will now find the correct export. 