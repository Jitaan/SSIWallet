import { ethers } from 'ethers';
import { hashCredential } from 'ssi-shared';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Blockchain Service
 */
class BlockchainService {
  constructor() {
    // Connect to Polygon Mumbai
    this.provider = new ethers.JsonRpcProvider(
      process.env.POLYGON_RPC_URL || 'https://rpc-mumbai.maticvigil.com/'
    );
    
    // Your wallet
    this.wallet = new ethers.Wallet(
      process.env.PRIVATE_KEY,
      this.provider
    );
    
    // Contract ABI
    this.contractABI = [
      "function anchor(bytes32 credentialHash) public",
      "function anchorBatch(bytes32[] memory hashes) public",
      "function anchored(bytes32 credentialHash) public view returns (uint256)",
      "function revoke(bytes32 credentialHash) public",
      "function revoked(bytes32 credentialHash) public view returns (bool)",
      "function isRevoked(bytes32 credentialHash) public view returns (bool)"
    ];
    
    // Connect to contract
    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      this.contractABI,
      this.wallet
    );
    
    // Queue for batch anchoring
    this.pendingAnchors = [];
    
    console.log('✅ Blockchain service initialized');
    console.log('📍 Contract:', process.env.CONTRACT_ADDRESS);
    console.log('👛 Wallet:', this.wallet.address);
  }
  
  /**
   * Anchor a credential
   */
  async anchorCredential(credential) {
    try {
      const credentialHash = hashCredential(credential);
      const bytes32Hash = '0x' + credentialHash;
      
      console.log('⏳ Anchoring credential:', bytes32Hash.substring(0, 10) + '...');
      
      const tx = await this.contract.anchor(bytes32Hash);
      console.log('⏳ Waiting for confirmation...');
      
      const receipt = await tx.wait();
      console.log('✅ Anchored in block:', receipt.blockNumber);
      
      return {
        credentialHash: bytes32Hash,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        explorerUrl: `https://mumbai.polygonscan.com/tx/${receipt.hash}`
      };
    } catch (error) {
      console.error('❌ Error anchoring:', error.message);
      throw error;
    }
  }
  
  /**
   * Queue credential for batch anchoring
   */
  queueForAnchoring(credential) {
    this.pendingAnchors.push(credential);
    console.log(`📋 Queued credential. Queue size: ${this.pendingAnchors.length}`);
    
    // Auto-process at 5 credentials
    if (this.pendingAnchors.length >= 5) {
      console.log('🔄 Queue full, processing batch...');
      this.processBatch();
    }
  }
  
  /**
   * Process batch
   */
  async processBatch() {
    if (this.pendingAnchors.length === 0) {
      console.log('📋 No credentials in queue');
      return [];
    }
    
    try {
      console.log(`📦 Processing batch of ${this.pendingAnchors.length} credentials...`);
      
      const hashes = this.pendingAnchors.map(cred => {
        const hash = hashCredential(cred);
        return '0x' + hash;
      });
      
      const tx = await this.contract.anchorBatch(hashes);
      console.log('⏳ Batch transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Batch anchored in block:', receipt.blockNumber);
      
      const results = this.pendingAnchors.map((cred, index) => ({
        credential: cred,
        credentialHash: hashes[index],
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      }));
      
      this.pendingAnchors = [];
      return results;
    } catch (error) {
      console.error('❌ Error processing batch:', error.message);
      throw error;
    }
  }
  
  /**
   * Check if anchored
   */
  async isAnchored(credential) {
    try {
      const credentialHash = '0x' + hashCredential(credential);
      const timestamp = await this.contract.anchored(credentialHash);
      const isAnchored = timestamp > 0n;
      
      return {
        anchored: isAnchored,
        timestamp: isAnchored ? Number(timestamp) : null,
        anchoredDate: isAnchored ? new Date(Number(timestamp) * 1000).toISOString() : null
      };
    } catch (error) {
      console.error('Error checking anchoring:', error.message);
      return { anchored: false, error: error.message };
    }
  }
  
  /**
   * Revoke a credential
   */
  async revokeCredential(credential) {
    try {
      const credentialHash = '0x' + hashCredential(credential);
      console.log('⏳ Revoking credential:', credentialHash.substring(0, 10) + '...');
      
      const tx = await this.contract.revoke(credentialHash);
      const receipt = await tx.wait();
      
      console.log('✅ Credential revoked');
      
      return {
        credentialHash,
        revoked: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error revoking:', error.message);
      throw error;
    }
  }
  
  /**
   * Check if revoked
   */
  async isRevoked(credential) {
    try {
      const credentialHash = '0x' + hashCredential(credential);
      return await this.contract.revoked(credentialHash);
    } catch (error) {
      console.error('Error checking revocation:', error.message);
      return false;
    }
  }
  
  /**
   * Get gas info
   */
  async getGasInfo() {
    const feeData = await this.provider.getFeeData();
    const balance = await this.provider.getBalance(this.wallet.address);
    
    return {
      gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei') + ' gwei',
      balance: ethers.formatEther(balance) + ' MATIC',
      estimatedCostPerAnchor: '~0.0001 MATIC'
    };
  }
}

export default new BlockchainService();