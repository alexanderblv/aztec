// Упрощенная демо-версия Aztec сервиса
// В продакшене замените на реальную интеграцию с Aztec

export interface AuctionInfo {
  itemName: string;
  description: string;
  startTime: number;
  endTime: number;
  minBid: number;
  creator: string;
  isActive: boolean;
}

export interface Bid {
  amount: number;
  auctionId: number;
}

export interface Winner {
  address: string;
  winningBid: number;
}

// Симуляция локального хранилища
class LocalStorage {
  private data: Map<string, any> = new Map();

  set(key: string, value: any): void {
    this.data.set(key, value);
    // В реальном приложении можно сохранять в localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`aztec_demo_${key}`, JSON.stringify(value));
    }
  }

  get(key: string): any {
    if (this.data.has(key)) {
      return this.data.get(key);
    }
    
    // Попытка загрузки из localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`aztec_demo_${key}`);
      if (stored) {
        const value = JSON.parse(stored);
        this.data.set(key, value);
        return value;
      }
    }
    
    return null;
  }

  getAll(prefix: string): any[] {
    const results: any[] = [];
    
    // Поиск в памяти
    for (const [key, value] of this.data.entries()) {
      if (key.startsWith(prefix)) {
        results.push(value);
      }
    }

    // Поиск в localStorage
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`aztec_demo_${prefix}`)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const value = JSON.parse(stored);
            // Проверяем, что не дублируем
            if (!results.find(r => r.id === value.id)) {
              results.push(value);
            }
          }
        }
      }
    }

    return results;
  }
}

export class AztecDemoService {
  private storage = new LocalStorage();
  private currentWallet: string | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    // Симуляция инициализации
    await new Promise(resolve => setTimeout(resolve, 500));
    this.isInitialized = true;
    
    // Создаем демонстрационные аукционы, если их еще нет
    await this.createDemoAuctions();
    
    console.log('Aztec Demo Service инициализирован');
  }

  private async createDemoAuctions(): Promise<void> {
    // Проверяем, есть ли уже аукционы
    const existingAuctions = this.storage.getAll('auction_');
    if (existingAuctions.length > 0) {
      return; // Аукционы уже созданы
    }

    // Создаем демонстрационные аукционы
    const demoAuctions = [
      {
        id: 1,
        itemName: 'Rare Vintage Painting',
        description: 'Original painting from the 1950s in excellent condition',
        startTime: Date.now() - 3600000, // Начался час назад
        endTime: Date.now() + 3600000, // Закончится через час
        minBid: 1000,
        creator: '0x1234567890123456789012345678901234567890',
        isActive: true,
      },
      {
        id: 2,
        itemName: 'Collectible Rolex Watch',
        description: 'Vintage Rolex Submariner from 1970',
        startTime: Date.now() - 7200000, // Начался 2 часа назад
        endTime: Date.now() + 1800000, // Закончится через 30 минут
        minBid: 5000,
        creator: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
        isActive: true,
      },
      {
        id: 3,
        itemName: 'First Edition Book',
        description: 'First edition of "War and Peace" by L.N. Tolstoy',
        startTime: Date.now() - 10800000, // Начался 3 часа назад
        endTime: Date.now() - 1800000, // Закончился 30 минут назад
        minBid: 2000,
        creator: '0x9999999999999999999999999999999999999999',
        isActive: false,
      },
    ];

    // Сохраняем каждый аукцион
    for (const auction of demoAuctions) {
      this.storage.set(`auction_${auction.id}`, auction);
    }

    console.log('Демонстрационные аукционы созданы');
  }

  async createWallet(): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Сервис не инициализирован');
    }

    // Генерируем случайный адрес
    const address = `0x${Array.from({length: 40}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;
    
    this.currentWallet = address;
    this.storage.set('current_wallet', address);
    
    console.log('Новый кошелек создан:', address);
    return address;
  }

  async connectWallet(privateKey: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Сервис не инициализирован');
    }

    // Простая симуляция генерации адреса из приватного ключа
    const hash = await this.simpleHash(privateKey);
    const address = `0x${hash.slice(0, 40)}`;
    
    this.currentWallet = address;
    this.storage.set('current_wallet', address);
    
    console.log('Кошелек подключен:', address);
    return address;
  }

  // New method for connecting external wallets (Real Mode)
  setExternalWallet(address: string): void {
    this.currentWallet = address;
    this.storage.set('current_wallet', address);
    console.log('External wallet set:', address);
  }

  // Update wallet check to also look for external wallet
  private getConnectedWallet(): string | null {
    // First check current wallet
    if (this.currentWallet) return this.currentWallet;
    
    // Then check storage
    const storageWallet = this.storage.get('current_wallet');
    if (storageWallet) {
      this.currentWallet = storageWallet;
      return storageWallet;
    }
    
    // Finally check if there's a Real Mode wallet address
    if (typeof window !== 'undefined') {
      const realModeAddress = localStorage.getItem('walletAddress');
      const walletMode = localStorage.getItem('walletMode');
      const appMode = localStorage.getItem('appMode');
      
      if (appMode === 'real' && walletMode === 'aztec' && realModeAddress) {
        this.currentWallet = realModeAddress;
        return realModeAddress;
      }
    }
    
    return null;
  }

  async createAuction(
    itemName: string,
    description: string,
    durationHours: number,
    minBid: number
  ): Promise<number> {
    const wallet = this.getConnectedWallet();
    if (!wallet) {
      throw new Error('Кошелек не подключен');
    }

    const auctionId = Date.now(); // Простой ID
    const startTime = Date.now();
    const endTime = startTime + (durationHours * 60 * 60 * 1000);

    const auction: AuctionInfo & { id: number } = {
      id: auctionId,
      itemName,
      description,
      startTime,
      endTime,
      minBid,
      creator: wallet,
      isActive: true,
    };

    this.storage.set(`auction_${auctionId}`, auction);
    
    console.log('Аукцион создан с ID:', auctionId);
    return auctionId;
  }

  async placeBid(auctionId: number, amount: number): Promise<void> {
    const wallet = this.getConnectedWallet();
    if (!wallet) {
      throw new Error('Кошелек не подключен');
    }

    const auction = this.storage.get(`auction_${auctionId}`);
    if (!auction) {
      throw new Error('Аукцион не найден');
    }

    if (!auction.isActive) {
      throw new Error('Аукцион не активен');
    }

    if (Date.now() >= auction.endTime) {
      throw new Error('Аукцион завершен');
    }

    if (amount < auction.minBid) {
      throw new Error('Ставка меньше минимальной');
    }

    // Создаем зашифрованную ставку (симуляция)
    const bidId = `${auctionId}_${wallet}_${Date.now()}`;
    const encryptedBid = {
      id: bidId,
      auctionId,
      bidder: wallet,
      amount, // В реальности это будет зашифровано
      timestamp: Date.now(),
      isPrivate: true,
    };

    this.storage.set(`bid_${bidId}`, encryptedBid);
    
    console.log('Приватная ставка размещена');
  }

  async finalizeAuction(auctionId: number): Promise<void> {
    const auction = this.storage.get(`auction_${auctionId}`);
    if (!auction) {
      throw new Error('Аукцион не найден');
    }

    if (Date.now() < auction.endTime) {
      throw new Error('Аукцион еще не завершен');
    }

    // Получаем все ставки для этого аукциона
    const allBids = this.storage.getAll('bid_');
    const auctionBids = allBids.filter(bid => bid.auctionId === auctionId);

    if (auctionBids.length === 0) {
      console.log('Нет ставок для аукциона');
      return;
    }

    // Находим максимальную ставку
    const winningBid = auctionBids.reduce((max, bid) => 
      bid.amount > max.amount ? bid : max
    );

    // Сохраняем результат
    const result = {
      auctionId,
      winner: winningBid.bidder,
      winningBid: winningBid.amount,
      totalBids: auctionBids.length,
    };

    this.storage.set(`result_${auctionId}`, result);

    // Деактивируем аукцион
    auction.isActive = false;
    this.storage.set(`auction_${auctionId}`, auction);

    console.log('Аукцион завершен, победитель:', winningBid.bidder);
  }

  async getAuctionInfo(auctionId: number): Promise<AuctionInfo | null> {
    const auction = this.storage.get(`auction_${auctionId}`);
    if (!auction) return null;

    // Убираем id из ответа
    const { id, ...auctionInfo } = auction;
    return auctionInfo;
  }

  async getWinner(auctionId: number): Promise<Winner | null> {
    const result = this.storage.get(`result_${auctionId}`);
    if (!result) return null;

    return {
      address: result.winner,
      winningBid: result.winningBid,
    };
  }

  async getAllAuctions(): Promise<(AuctionInfo & { id: number })[]> {
    return this.storage.getAll('auction_');
  }

  async getAuctionCount(): Promise<number> {
    const auctions = this.storage.getAll('auction_');
    return auctions.length;
  }

  async amIWinner(auctionId: number): Promise<boolean> {
    const wallet = this.getConnectedWallet();
    if (!wallet) return false;
    
    const result = this.storage.get(`result_${auctionId}`);
    return result && result.winner === wallet;
  }

  getWalletAddress(): string | null {
    return this.getConnectedWallet();
  }

  // Утилитарные методы
  private async simpleHash(input: string): Promise<string> {
    // Простейший хеш для демонстрации
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Конвертируем в положительное число и затем в hex
    const positiveHash = Math.abs(hash);
    return positiveHash.toString(16).padStart(40, '0');
  }

  // Метод для очистки демо-данных
  clearDemoData(): void {
    if (typeof window !== 'undefined') {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('aztec_demo_')) {
          keys.push(key);
        }
      }
      keys.forEach(key => localStorage.removeItem(key));
    }
    
    this.storage = new LocalStorage();
    this.currentWallet = null;
    console.log('Демо-данные очищены');
  }
}

// Глобальный экземпляр для демонстрации
export const aztecDemoService = new AztecDemoService(); 