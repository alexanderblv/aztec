#!/bin/bash

echo "🔐 Установка Privy для подключения кошельков..."

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install @privy-io/react-auth @privy-io/wagmi @tanstack/react-query viem wagmi

# Создание файла окружения
echo "⚙️ Создание файла окружения..."
if [ ! -f .env.local ]; then
    echo "# Privy App ID - получите его на https://console.privy.io/" > .env.local
    echo "NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here" >> .env.local
    echo "✅ Файл .env.local создан"
else
    echo "ℹ️ Файл .env.local уже существует"
fi

echo ""
echo "🎉 Установка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Зарегистрируйтесь на https://console.privy.io/"
echo "2. Создайте новый проект и получите App ID"
echo "3. Обновите NEXT_PUBLIC_PRIVY_APP_ID в файле .env.local"
echo "4. Раскомментируйте код в src/components/PrivyWalletConnectFull.tsx"
echo "5. Обновите src/components/PrivyProviders.tsx"
echo "6. Запустите проект: npm run dev"
echo ""
echo "📚 Подробные инструкции в файле PRIVY_INTEGRATION.md" 