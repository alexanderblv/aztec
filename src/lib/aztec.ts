import { 
  AztecAddress, 
  Contract, 
  createPXEClient, 
  Fr, 
  PXE,
  TxStatus,
  createAccount,
  AccountWallet,
  getSchnorrAccount,
} from '@aztec/aztec.js';
import { PrivateAuctionContract } from './contracts/PrivateAuction.js';

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

export class AztecService {
  private pxe: PXE | null = null;
  private wallet: AccountWallet | null = null;
  private contract: any = null;
  private contractAddress: AztecAddress | null = null;

  async initialize(pxeUrl: string = 'http://localhost:8080'): Promise<void> {
    try {
      this.pxe = createPXEClient(pxeUrl);
      console.log('Подключение к Aztec PXE успешно');
    } catch (error) {
      console.error('Ошибка подключения к Aztec PXE:', error);
      throw error;
    }
  }

  async createWallet(): Promise<string> {
    if (!this.pxe) throw new Error('PXE не инициализирован');

    try {
      // Создаем новый аккаунт
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

  async connectWallet(privateKey: string): Promise<string> {
    if (!this.pxe) throw new Error('PXE не инициализирован');

    try {
      const secretKey = Fr.fromString(privateKey);
      const account = getSchnorrAccount(this.pxe, secretKey, secretKey);
      
      this.wallet = await account.getWallet();
      const address = this.wallet.getAddress();
      
      console.log('Кошелек подключен:', address.toString());
      return address.toString();
    } catch (error) {
      console.error('Ошибка подключения кошелька:', error);
      throw error;
    }
  }

  async deployContract(): Promise<string> {
    if (!this.wallet) throw new Error('Кошелек не подключен');

    try {
      // Развертываем контракт
      const contract = await PrivateAuctionContract.deploy(this.wallet).send().deployed();
      this.contract = contract;
      this.contractAddress = contract.address;
      
      console.log('Контракт развернут по адресу:', this.contractAddress.toString());
      return this.contractAddress.toString();
    } catch (error) {
      console.error('Ошибка развертывания контракта:', error);
      throw error;
    }
  }

  async connectToContract(contractAddress: string): Promise<void> {
    if (!this.wallet) throw new Error('Кошелек не подключен');

    try {
      this.contractAddress = AztecAddress.fromString(contractAddress);
      this.contract = await PrivateAuctionContract.at(this.contractAddress, this.wallet);
      
      console.log('Подключен к контракту:', contractAddress);
    } catch (error) {
      console.error('Ошибка подключения к контракту:', error);
      throw error;
    }
  }

  async createAuction(
    itemName: string,
    description: string,
    durationHours: number,
    minBid: number
  ): Promise<number> {
    if (!this.contract) throw new Error('Контракт не подключен');

    try {
      const tx = await this.contract.methods
        .create_auction(
          Fr.fromString(itemName),
          Fr.fromString(description),
          new Fr(durationHours),
          new Fr(minBid)
        )
        .send()
        .wait();

      if (tx.status === TxStatus.MINED) {
        const auctionId = tx.returnValues?.[0]?.toBigInt() || 0;
        console.log('Аукцион создан с ID:', auctionId);
        return Number(auctionId);
      } else {
        throw new Error('Транзакция не была подтверждена');
      }
    } catch (error) {
      console.error('Ошибка создания аукциона:', error);
      throw error;
    }
  }

  async placeBid(auctionId: number, amount: number): Promise<void> {
    if (!this.contract) throw new Error('Контракт не подключен');

    try {
      const tx = await this.contract.methods
        .place_bid(new Fr(auctionId), new Fr(amount))
        .send()
        .wait();

      if (tx.status === TxStatus.MINED) {
        console.log('Ставка размещена успешно');
      } else {
        throw new Error('Транзакция не была подтверждена');
      }
    } catch (error) {
      console.error('Ошибка размещения ставки:', error);
      throw error;
    }
  }

  async finalizeAuction(auctionId: number): Promise<void> {
    if (!this.contract) throw new Error('Контракт не подключен');

    try {
      const tx = await this.contract.methods
        .finalize_auction(new Fr(auctionId))
        .send()
        .wait();

      if (tx.status === TxStatus.MINED) {
        console.log('Аукцион завершен успешно');
      } else {
        throw new Error('Транзакция не была подтверждена');
      }
    } catch (error) {
      console.error('Ошибка завершения аукциона:', error);
      throw error;
    }
  }

  async getAuctionInfo(auctionId: number): Promise<AuctionInfo | null> {
    if (!this.contract) throw new Error('Контракт не подключен');

    try {
      const result = await this.contract.methods
        .get_auction_info(new Fr(auctionId))
        .simulate();

      return {
        itemName: result.item_name.toString(),
        description: result.description.toString(),
        startTime: Number(result.start_time.toBigInt()),
        endTime: Number(result.end_time.toBigInt()),
        minBid: Number(result.min_bid.toBigInt()),
        creator: result.creator.toString(),
        isActive: result.is_active,
      };
    } catch (error) {
      console.error('Ошибка получения информации об аукционе:', error);
      return null;
    }
  }

  async getWinner(auctionId: number): Promise<Winner | null> {
    if (!this.contract) throw new Error('Контракт не подключен');

    try {
      const result = await this.contract.methods
        .get_winner(new Fr(auctionId))
        .simulate();

      return {
        address: result[0].toString(),
        winningBid: Number(result[1].toBigInt()),
      };
    } catch (error) {
      console.error('Ошибка получения победителя:', error);
      return null;
    }
  }

  async getAuctionCount(): Promise<number> {
    if (!this.contract) throw new Error('Контракт не подключен');

    try {
      const result = await this.contract.methods.get_auction_count().simulate();
      return Number(result.toBigInt());
    } catch (error) {
      console.error('Ошибка получения количества аукционов:', error);
      return 0;
    }
  }

  async amIWinner(auctionId: number): Promise<boolean> {
    if (!this.contract) throw new Error('Контракт не подключен');

    try {
      const result = await this.contract.methods
        .am_i_winner(new Fr(auctionId))
        .simulate();

      return result;
    } catch (error) {
      console.error('Ошибка проверки победителя:', error);
      return false;
    }
  }

  getWalletAddress(): string | null {
    return this.wallet?.getAddress().toString() || null;
  }

  getContractAddress(): string | null {
    return this.contractAddress?.toString() || null;
  }
}

// Глобальный экземпляр сервиса
export const aztecService = new AztecService(); 