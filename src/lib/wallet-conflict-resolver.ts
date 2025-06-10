/**
 * Wallet Conflict Resolver
 * Resolves conflicts between MetaMask and other Ethereum wallets
 */

interface EthereumProvider {
  isMetaMask?: boolean;
  isAzguard?: boolean;
  request?: (args: any) => Promise<any>;
  removeAllListeners?: () => void;
  providers?: EthereumProvider[];
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export class WalletConflictResolver {
  private static instance: WalletConflictResolver;

  private constructor() {}

  public static getInstance(): WalletConflictResolver {
    if (!WalletConflictResolver.instance) {
      WalletConflictResolver.instance = new WalletConflictResolver();
    }
    return WalletConflictResolver.instance;
  }

  /**
   * Detects wallet conflicts
   */
  public detectConflicts(): { hasConflicts: boolean; wallets: string[] } {
    const wallets: string[] = [];
    
    if (typeof window === 'undefined') {
      return { hasConflicts: false, wallets };
    }

    if (window.ethereum?.providers) {
      window.ethereum.providers.forEach((provider) => {
        if (provider.isMetaMask) wallets.push('MetaMask');
        if (provider.isAzguard) wallets.push('Azguard');
      });
    } else if (window.ethereum) {
      if (window.ethereum.isMetaMask) wallets.push('MetaMask');
      if (window.ethereum.isAzguard) wallets.push('Azguard');
    }

    return {
      hasConflicts: wallets.length > 1,
      wallets
    };
  }

  /**
   * Attempts to resolve wallet conflicts automatically
   */
  public async resolveConflicts(): Promise<void> {
    if (typeof window === 'undefined') return;

    const { hasConflicts, wallets } = this.detectConflicts();
    
    if (!hasConflicts) {
      console.log('✅ No wallet conflicts detected');
      return;
    }

    console.log('🔧 Resolving wallet conflicts...', wallets);

    try {
      // Remove conflicting event listeners
      if (window.ethereum?.providers) {
        window.ethereum.providers.forEach(provider => {
          if (provider.removeAllListeners) {
            provider.removeAllListeners();
          }
        });
      }

      // Set preference for non-MetaMask wallet if available
      if (wallets.includes('Azguard')) {
        localStorage.setItem('preferredWallet', 'azguard');
        console.log('✅ Set Azguard as preferred wallet');
      }

      // Mark conflict as resolved
      localStorage.setItem('walletConflictResolved', 'true');
      localStorage.setItem('walletConflictTimestamp', Date.now().toString());

      console.log('✅ Wallet conflicts resolved');

    } catch (error) {
      console.error('❌ Error resolving wallet conflicts:', error);
      throw error;
    }
  }

  /**
   * Gets the preferred wallet provider
   */
  public getPreferredProvider(): EthereumProvider | null {
    if (typeof window === 'undefined' || !window.ethereum) {
      return null;
    }

    const preferredWallet = localStorage.getItem('preferredWallet');

    if (window.ethereum.providers) {
      // Multiple providers available
      if (preferredWallet === 'azguard') {
        const azguardProvider = window.ethereum.providers.find(p => p.isAzguard);
        if (azguardProvider) return azguardProvider;
      }
      
      // Fallback to first non-MetaMask provider
      const nonMetaMaskProvider = window.ethereum.providers.find(p => !p.isMetaMask);
      if (nonMetaMaskProvider) return nonMetaMaskProvider;
      
      // If only MetaMask available, return it
      return window.ethereum.providers[0];
    }

    // Single provider
    return window.ethereum;
  }

  /**
   * Forces connection to a specific wallet
   */
  public async connectToWallet(walletType: 'metamask' | 'azguard'): Promise<string[]> {
    const provider = this.getProviderByType(walletType);
    
    if (!provider) {
      throw new Error(`${walletType} provider not found`);
    }

    if (!provider.request) {
      throw new Error(`${walletType} provider does not support requests`);
    }

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      localStorage.setItem('connectedWallet', walletType);
      console.log(`✅ Connected to ${walletType}:`, accounts);
      return accounts;
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected the connection request');
      }
      throw error;
    }
  }

  private getProviderByType(walletType: 'metamask' | 'azguard'): EthereumProvider | null {
    if (typeof window === 'undefined' || !window.ethereum) {
      return null;
    }

    if (window.ethereum.providers) {
      if (walletType === 'metamask') {
        return window.ethereum.providers.find(p => p.isMetaMask) || null;
      } else if (walletType === 'azguard') {
        return window.ethereum.providers.find(p => p.isAzguard) || null;
      }
    } else {
      if (walletType === 'metamask' && window.ethereum.isMetaMask) {
        return window.ethereum;
      } else if (walletType === 'azguard' && window.ethereum.isAzguard) {
        return window.ethereum;
      }
    }

    return null;
  }

  /**
   * Initializes conflict resolution on page load
   */
  public async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Wait for wallets to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { hasConflicts } = this.detectConflicts();
    
    if (hasConflicts) {
      console.log('🔧 Wallet conflicts detected, attempting automatic resolution...');
      await this.resolveConflicts();
    }
  }
}

// Export singleton instance
export const walletConflictResolver = WalletConflictResolver.getInstance();

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      walletConflictResolver.initialize();
    });
  } else {
    walletConflictResolver.initialize();
  }
} 