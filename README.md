# 🔒 Private Auction Platform

## Description

A web platform for private auctions built on advanced **Aztec Network** technology. Participants can place private bids that remain fully encrypted until the auction ends. Only the winner is revealed at the end of trading.

## 🌟 Features

### 🔐 Complete Privacy
- **Encrypted bids**: All bids are encrypted and invisible even to the auction creator
- **Zero-Knowledge proofs**: Uses zk-SNARKs to ensure fairness without revealing data
- **Participant anonymity**: Participant identities remain hidden until winner determination

### ⚡ Technologies
- **Aztec Network**: Private L2 network on Ethereum
- **Smart Contracts**: Written in Noir (Aztec language)
- **Next.js 14**: Modern React framework
- **TypeScript**: Typed development
- **Tailwind CSS**: Utility styles

### 🏆 Fair Trading
- **Automatic winner determination**: Without possibility of manipulation
- **Transparent public information**: Item descriptions available to all
- **Immutable bids**: After placement, bids cannot be changed

## 🚀 Quick Start

### Prerequisites

```bash
# Node.js 18+ and npm
node --version
npm --version

# Aztec CLI (for testnet work)
bash -i <(curl -s https://install.aztec.network)
aztec-up alpha-testnet
```

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd private-auction-platform

# Install dependencies
npm install
```

### 🌐 Working with Aztec Testnet

The application supports working with both local Sandbox and real Aztec Alpha Testnet.

#### Testnet Setup

1. **Install Aztec CLI:**
```bash
# Install CLI
bash -i <(curl -s https://install.aztec.network)

# Install testnet version
aztec-up alpha-testnet
```

2. **Create .env.local file:**
```bash
# Copy testnet configuration
cp env.testnet .env.local
```

3. **Run application with testnet:**
```bash
npm run dev:testnet
```

#### Environment Variables for Testnet

```bash
# Aztec Testnet Configuration
AZTEC_PXE_URL=https://aztec-alpha-testnet-fullnode.zkv.xyz
AZTEC_NODE_URL=https://aztec-alpha-testnet-fullnode.zkv.xyz
NEXT_PUBLIC_AZTEC_PXE_URL=https://aztec-alpha-testnet-fullnode.zkv.xyz

# Sponsored Fee Payment Contract (free transactions)
SPONSORED_FPC_ADDRESS=0x1260a43ecf03e985727affbbe3e483e60b836ea821b6305bea1c53398b986047

# Network
AZTEC_NETWORK=testnet
```

#### Testnet Features

- ✅ **Real zk-proofs**: Full functionality with Aztec Network
- ✅ **Free transactions**: Uses sponsored fee contract
- ✅ **Public network**: Available to all developers
- ⚠️ **Wait times**: Transactions may take longer to process
- ⚠️ **Alpha version**: Possible failures and updates

### 🏠 Working with Local Sandbox

For local development:

```bash
# Run Aztec Sandbox (in separate terminal)
aztec-sandbox

# Compile smart contracts
npm run compile

# Run web application
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Architecture

### Smart Contract (`contracts/src/main.nr`)
```noir
contract PrivateAuction {
    // Private bids as encrypted notes
    struct BidNote {
        amount: Field,
        bidder: AztecAddress,
        auction_id: Field,
        random: Field,
    }
    
    // Public auction information
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

### Web Interface
- **Header**: Wallet information and navigation
- **AuctionList**: Display of all auctions
- **CreateAuctionModal**: Creating new auctions
- **BidModal**: Placing private bids
- **WalletConnect**: Connecting to Aztec

## 🔧 Main Functions

### Creating an Auction
```typescript
// Public function - information visible to all
await contract.methods.create_auction(
    itemName,     // Item name
    description,  // Description
    duration,     // Duration in hours
    minBid       // Minimum bid
).send()
```

### Placing a Private Bid
```typescript
// Private function - bid is encrypted
await contract.methods.place_bid(
    auctionId,   // Auction ID
    amount       // Bid amount (encrypted)
).send()
```

### Finalizing an Auction
```typescript
// Determine winner through zk-proofs
await contract.methods.finalize_auction(auctionId).send()
```

## 🛡️ Security

### Cryptographic Guarantees
- **Pedersen hashing**: For creating bid commitments
- **zk-SNARK proofs**: For private bid comparison
- **Nullifiers**: Preventing double spending
- **Timestamps**: Protection against timing attacks

### Threat Model
✅ **Protected from**:
- Viewing others' bids
- Result manipulation
- Availability attacks (through L2)
- MEV attacks (thanks to privacy)

⚠️ **Limitations**:
- Requires trust in Aztec Sequencer
- Dependence on Ethereum L1 security
- Possible timing attacks (mitigated)

## 🌐 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables
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

## 🧪 Testing

```bash
# Test smart contracts
npm run test

# Check TypeScript types
npm run type-check

# Code linting
npm run lint
```

## 📖 API Documentation

### Aztec Service Methods

#### `createWallet(): Promise<string>`
Creates a new Aztec wallet

#### `connectWallet(privateKey: string): Promise<string>`
Connects to an existing wallet

#### `createAuction(itemName, description, duration, minBid): Promise<number>`
Creates a new auction

#### `placeBid(auctionId: number, amount: number): Promise<void>`
Places a private bid

#### `getAuctionInfo(auctionId: number): Promise<AuctionInfo>`
Gets public auction information

#### `getWinner(auctionId: number): Promise<Winner>`
Gets winner information (after completion)

## 🤝 Contributing

### Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- ESLint + Prettier for JavaScript/TypeScript
- Noir formatter for smart contracts
- Conventional Commits for messages

## 🐛 Known Issues

- [ ] Demo mode with mock data (requires real Aztec integration)
- [ ] Missing network error handling
- [ ] No persistent state storage
- [ ] Performance optimization needed for large auctions

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🔗 Useful Links

- [Aztec Documentation](https://docs.aztec.network/)
- [Noir Language](https://noir-lang.org/)
- [Aztec Sandbox](https://docs.aztec.network/dev_docs/getting_started/sandbox)
- [Zero-Knowledge Proofs](https://ethereum.org/en/zero-knowledge-proofs/)

## 📞 Support

- 💬 [Discord community](https://discord.gg/aztec)
- 🐛 [GitHub Issues](https://github.com/your-repo/issues)
- 📧 Email: support@yourplatform.com

---

**Made with ❤️ and Aztec Network technology**

# 🎯 Private Auction Platform on Aztec

Web platform for private auctions built on Aztec Network blockchain using zero-knowledge proof technologies.

## 🚨 IMPORTANT: Wallet Connection Setup

**Теперь платформа поддерживает Aztec кошельки!** Для работы с реальными кошельками Azguard и Obsidion, следуйте этим шагам:

### Step 1: Install Aztec Wallet SDK
```bash
# Remove old Privy dependencies
npm uninstall @privy-io/react-auth @privy-io/wagmi viem wagmi @tanstack/react-query

# Install Aztec Wallet SDK
npm install @nemi-fi/wallet-sdk@latest
```

### Step 2: Setup configuration
```bash
# Copy Aztec wallets configuration
npm run setup:aztec

# Or manually create .env.local with:
# NEXT_PUBLIC_APP_MODE=aztec
# NEXT_PUBLIC_WALLET_MODE=aztec
```

### Step 3: Restart application
```bash
npm run dev:aztec
```

After this, you'll have **real** Aztec wallet connection with support for:
- 🌐 **Obsidion Wallet** - Privacy-first wallet for Aztec Network
- 🛡️ **Azguard Wallet** - Secure Aztec wallet (Alpha)
- 🔒 Native Aztec Network integration
- ⚡ Optimized for private DeFi

📚 **Detailed instructions:** see file `AZTEC_WALLETS_INTEGRATION.md`

---

## ✨ Platform Features

## 🚨 FIXED: Connection to real Aztec Testnet

If when selecting "Alpha Testnet" the application worked in emulation mode, the issue is fixed! 

### 🚀 Quick solution:
```bash
# Windows
copy env.testnet .env.local

# Linux/macOS  
cp env.testnet .env.local

# Restart application
npm run dev
```

### ✅ How to verify:
1. Select "Alpha Testnet" in the interface
2. In browser console (F12) should appear:
   ```
   Connected to Aztec Testnet successfully
   PXE URL: https://aztec-alpha-testnet-fullnode.zkv.xyz
   ```

📖 **Detailed instructions:** see file `ИСПРАВЛЕНИЕ_TESTNET.md`

--- 