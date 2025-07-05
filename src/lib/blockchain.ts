import { ethers } from 'ethers';
// import { Sapphire } from '@oasisprotocol/sapphire-paratime';

export interface BlockchainConfig {
  network: 'sapphire_testnet' | 'sapphire_mainnet' | 'localhost';
  rpcUrl: string;
  chainId: number;
  privateKey?: string;
}

export interface ContractConfig {
  address: string;
  abi: any[];
}

// Network configurations
export const NETWORKS: Record<string, BlockchainConfig> = {
  sapphire_testnet: {
    network: 'sapphire_testnet',
    rpcUrl: 'https://testnet.sapphire.oasis.io',
    chainId: 0x5aff
  },
  sapphire_mainnet: {
    network: 'sapphire_mainnet',
    rpcUrl: 'https://sapphire.oasis.io',
    chainId: 0x5afe
  },
  localhost: {
    network: 'localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 31337
  }
};

// Session Key Manager Contract ABI (simplified)
export const SESSION_KEY_MANAGER_ABI = [
  'function createSession(bytes32 sessionKey, bytes32 nullifierHash, uint256 expiresAt, uint256 maxUsage) external',
  'function verifySession(bytes32 sessionKey) external view returns (bool, uint256, uint256)',
  'function revokeSession(bytes32 sessionKey) external',
  'function incrementUsage(bytes32 sessionKey) external',
  'event SessionCreated(bytes32 indexed sessionKey, bytes32 indexed nullifierHash, uint256 expiresAt)',
  'event SessionRevoked(bytes32 indexed sessionKey)',
  'event SessionVerified(bytes32 indexed sessionKey, uint256 usageCount)'
];

export class BlockchainService {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private sessionKeyManager?: ethers.Contract;

  constructor(config: BlockchainConfig) {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
    }
  }

  // Initialize session key manager contract
  async initializeSessionKeyManager(contractAddress: string): Promise<void> {
    if (!this.signer) {
      throw new Error('Signer not initialized. Private key required.');
    }

    this.sessionKeyManager = new ethers.Contract(
      contractAddress,
      SESSION_KEY_MANAGER_ABI,
      this.signer
    );
  }

  // Create session on blockchain
  async createSessionOnChain(
    sessionKey: string,
    nullifierHash: string,
    expiresAt: Date,
    maxUsage: number
  ): Promise<any> {
    if (!this.sessionKeyManager) {
      throw new Error('Session key manager not initialized');
    }

    const expiresAtTimestamp = Math.floor(expiresAt.getTime() / 1000);
    
    return await this.sessionKeyManager.createSession(
      sessionKey,
      nullifierHash,
      expiresAtTimestamp,
      maxUsage
    );
  }

  // Verify session on blockchain
  async verifySessionOnChain(sessionKey: string): Promise<{
    isValid: boolean;
    usageCount: number;
    maxUsage: number;
  }> {
    if (!this.sessionKeyManager) {
      throw new Error('Session key manager not initialized');
    }

    const [isValid, usageCount, maxUsage] = await this.sessionKeyManager.verifySession(sessionKey);
    
    return {
      isValid,
      usageCount: usageCount.toNumber(),
      maxUsage: maxUsage.toNumber()
    };
  }

  // Revoke session on blockchain
  async revokeSessionOnChain(sessionKey: string): Promise<any> {
    if (!this.sessionKeyManager) {
      throw new Error('Session key manager not initialized');
    }

    return await this.sessionKeyManager.revokeSession(sessionKey);
  }

  // Increment session usage on blockchain
  async incrementSessionUsageOnChain(sessionKey: string): Promise<any> {
    if (!this.sessionKeyManager) {
      throw new Error('Session key manager not initialized');
    }

    return await this.sessionKeyManager.incrementUsage(sessionKey);
  }

  // Get network info
  async getNetworkInfo(): Promise<{
    chainId: number;
    blockNumber: number;
    gasPrice: bigint;
  }> {
    const [chainId, blockNumber, gasPrice] = await Promise.all([
      this.provider.getNetwork().then(net => net.chainId),
      this.provider.getBlockNumber(),
      this.provider.getFeeData().then(fee => fee.gasPrice || BigInt(0))
    ]);

    return {
      chainId: Number(chainId),
      blockNumber,
      gasPrice
    };
  }

  // Get transaction status
  async getTransactionStatus(txHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
    gasUsed?: bigint;
  }> {
    const receipt = await this.provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return { status: 'pending' };
    }

    return {
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed
    };
  }

  // Estimate gas for transaction
  async estimateGas(
    to: string,
    data: string,
    value?: bigint
  ): Promise<bigint> {
    return await this.provider.estimateGas({
      to,
      data,
      value: value || BigInt(0)
    });
  }
}

// Utility functions
export function hashSessionKey(sessionKey: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(sessionKey));
}

export function hashNullifier(nullifierHash: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(nullifierHash));
}

export function validateAddress(address: string): boolean {
  return ethers.isAddress(address);
}

export function formatEther(wei: bigint): string {
  return ethers.formatEther(wei);
}

export function parseEther(ether: string): bigint {
  return ethers.parseEther(ether);
} 