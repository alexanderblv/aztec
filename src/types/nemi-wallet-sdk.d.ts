declare module '@nemi-fi/wallet-sdk' {
  export interface AztecWalletSdkConfig {
    aztecNode: string
    connectors: any[]
  }

  export class AztecWalletSdk {
    constructor(config: AztecWalletSdkConfig)
    connect(walletId: string): Promise<void>
    disconnect(): Promise<void>
    getAccount(): Promise<any>
  }

  export function obsidion(): any
  export function azguard(): any
} 