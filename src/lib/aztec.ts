// All Aztec imports will be done dynamically to avoid build issues
// Dynamic imports will be used throughout the class
// import { AztecAddress, Fr, GrumpkinScalar, PXE, TxStatus, AccountWallet, Contract } from '@aztec/aztec.js'; // Will be imported dynamically
// import { getSchnorrAccount } from '@aztec/accounts/schnorr'; // Will be imported dynamically
// TODO: Import will be available after contract compilation
// import { PrivateAuctionContract } from './contracts/PrivateAuction.js';

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
  private pxe: any = null;
  private wallet: any = null;
  private contract: any = null;
  private contractAddress: any = null;
  private isTestnet: boolean = false;

  async initialize(pxeUrl?: string): Promise<void> {
    try {
      // Определяем URL для подключения
      const defaultUrl = typeof window !== 'undefined' 
        ? process.env.NEXT_PUBLIC_AZTEC_PXE_URL || 'http://localhost:8080'
        : 'http://localhost:8080';
      
      const finalUrl = pxeUrl || defaultUrl;
      this.isTestnet = finalUrl.includes('testnet');
      
      // Import createPXEClient dynamically to avoid module issues
      const { createPXEClient } = await import('@aztec/aztec.js');
      this.pxe = createPXEClient(finalUrl);
      
      console.log(`Подключение к Aztec ${this.isTestnet ? 'Testnet' : 'Sandbox'} успешно`);
      console.log(`PXE URL: ${finalUrl}`);
    } catch (error) {
      console.error('Ошибка подключения к Aztec PXE:', error);
      throw error;
    }
  }

  getNetworkInfo(): { isTestnet: boolean; network: string } {
    return {
      isTestnet: this.isTestnet,
      network: this.isTestnet ? 'Alpha Testnet' : 'Local Sandbox'
    };
  }

  async createWallet(): Promise<string> {
    if (!this.pxe) throw new Error('PXE не инициализирован');

    try {
      // Import necessary classes dynamically
      const { Fr, GrumpkinScalar } = await import('@aztec/aztec.js');
      const { getSchnorrAccount } = await import('@aztec/accounts/schnorr');
      
      // Создаем новый аккаунт
      const secretKey = Fr.random();
      // Use GrumpkinScalar for the signing key
      const signingKey = GrumpkinScalar.random();
      const accountManager = await getSchnorrAccount(this.pxe, secretKey, signingKey);
      
      // First deploy the account, then get the wallet
      const wallet = await accountManager.deploy().wait().then(() => accountManager.getWallet());
      this.wallet = wallet;
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
      // Import necessary classes dynamically
      const { Fr, GrumpkinScalar } = await import('@aztec/aztec.js');
      const { getSchnorrAccount } = await import('@aztec/accounts/schnorr');
      
      const secretKey = Fr.fromString(privateKey);
      // Use GrumpkinScalar for the signing key  
      const signingKey = GrumpkinScalar.random();
      const accountManager = await getSchnorrAccount(this.pxe, secretKey, signingKey);
      
      this.wallet = await accountManager.getWallet();
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
      // TODO: This will need to be updated once contract is compiled
      throw new Error('Contract deployment requires compiled contract - please run "npm run compile" first');
      // const contract = await PrivateAuctionContract.deploy(this.wallet).send().deployed();
      // this.contract = contract;
      // this.contractAddress = contract.address;
      // 
      // console.log('Контракт развернут по адресу:', this.contractAddress.toString());
      // return this.contractAddress.toString();
    } catch (error) {
      console.error('Ошибка развертывания контракта:', error);
      throw error;
    }
  }

  async connectToContract(contractAddress: string): Promise<void> {
    if (!this.wallet) throw new Error('Кошелек не подключен');

    try {
      // Import AztecAddress dynamically to avoid module issues
      const { AztecAddress } = await import('@aztec/aztec.js');
      this.contractAddress = AztecAddress.fromString(contractAddress);
      // TODO: This will need to be updated once contract is compiled
      throw new Error('Contract connection requires compiled contract - please run "npm run compile" first');
      // this.contract = await PrivateAuctionContract.at(this.contractAddress, this.wallet);
      // 
      // console.log('Подключен к контракту:', contractAddress);
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
      // Import Fr and TxStatus dynamically to avoid module issues
      const { Fr, TxStatus } = await import('@aztec/aztec.js');
      
      const tx = await this.contract.methods
        .create_auction(
          Fr.fromString(itemName),
          Fr.fromString(description),
          new Fr(durationHours),
          new Fr(minBid)
        )
        .send()
        .wait();

      if (tx.status === TxStatus.SUCCESS) {
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
    // Проверяем состояние компонентов по порядку
    if (!this.wallet) {
      throw new Error('Кошелек не подключен к Aztec сети')
    }
    
    if (!this.contract) {
      throw new Error('Контракт не подключен. Необходимо скомпилировать и развернуть контракт Aztec или переключиться в демо режим.')
    }

    try {
      // Import Fr and TxStatus dynamically to avoid module issues
      const { Fr, TxStatus } = await import('@aztec/aztec.js');
      
      const tx = await this.contract.methods
        .place_bid(new Fr(auctionId), new Fr(amount))
        .send()
        .wait();

      if (tx.status === TxStatus.SUCCESS) {
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
      // Import Fr and TxStatus dynamically to avoid module issues
      const { Fr, TxStatus } = await import('@aztec/aztec.js');
      
      const tx = await this.contract.methods
        .finalize_auction(new Fr(auctionId))
        .send()
        .wait();

      if (tx.status === TxStatus.SUCCESS) {
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
      // Import Fr dynamically to avoid module issues
      const { Fr } = await import('@aztec/aztec.js');
      
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
      // Import Fr dynamically to avoid module issues
      const { Fr } = await import('@aztec/aztec.js');
      
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
      // Import Fr dynamically to avoid module issues
      const { Fr } = await import('@aztec/aztec.js');
      
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