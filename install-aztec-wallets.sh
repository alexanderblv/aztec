#!/bin/bash

echo "🚀 Installing Aztec Wallet SDK for Azguard and Obsidion wallets..."

# Remove old Privy dependencies
echo "🧹 Removing old Privy dependencies..."
npm uninstall @privy-io/react-auth @privy-io/wagmi viem wagmi @tanstack/react-query

# Install Aztec Wallet SDK
echo "📦 Installing Aztec Wallet SDK..."
npm install @nemi-fi/wallet-sdk@latest

# Install required dependencies
echo "📦 Installing required dependencies..."
npm install

echo "✅ Installation complete!"

echo ""
echo "🎯 Next steps:"
echo "1. The application now supports Azguard and Obsidion wallets"
echo "2. Remove the old .env.local file if it contains Privy configuration:"
echo "   rm .env.local"
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "📋 Supported wallets:"
echo "• 🌐 Obsidion Wallet - Privacy-first wallet for Aztec Network"
echo "• 🛡️ Azguard Wallet - Secure Aztec wallet (Alpha testing)"
echo ""
echo "📚 Documentation:"
echo "• Obsidion: https://docs.obsidion.xyz/intro"
echo "• Azguard: https://azguardwallet.io/"
echo "• Wallet SDK: https://www.npmjs.com/package/@nemi-fi/wallet-sdk" 