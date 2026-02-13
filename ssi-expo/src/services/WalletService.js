import * as SecureStore from 'expo-secure-store';
import { createDID, calculateTrustScore, verifyCredential, getPublicKeyFromDID } from './ssi-shared-mock';
import APIService from './APIService';

class WalletService {

  async createWallet() {
    const identity = await createDID();
    const wallet = {
      did: identity.did,
      privateKey: identity.privateKey,
      publicKey: identity.publicKey,
      credentials: [],
      trustScore: 0,
      createdAt: new Date().toISOString()
    };
    await this.saveWallet(wallet);
    return wallet;
  }

  async loadWallet() {
    try {
      const walletJSON = await SecureStore.getItemAsync('wallet');
      return walletJSON ? JSON.parse(walletJSON) : null;
    } catch (error) {
      console.error('Error loading wallet:', error);
      return null;
    }
  }

  async saveWallet(wallet) {
    await SecureStore.setItemAsync('wallet', JSON.stringify(wallet));
  }

  async addCredential(credentialData) {
    const wallet = await this.loadWallet();
    const { credential, signature } = credentialData;

    // Step 1: Verify signature locally
    const issuerPublicKey = getPublicKeyFromDID(credential.issuer);
    const isValid = await verifyCredential(credential, signature, issuerPublicKey);
    if (!isValid) {
      throw new Error('Invalid credential signature');
    }

    // Step 2: Verify against blockchain (online check)
    try {
      const blockchainResult = await APIService.verifyCredential(credential, signature);

      if (blockchainResult.checks.revoked) {
        throw new Error('This credential has been revoked');
      }

      if (blockchainResult.checks.expired) {
        throw new Error('This credential has expired');
      }

      // Add blockchain verification status
      wallet.credentials.push({
        credential,
        signature,
        receivedAt: new Date().toISOString(),
        blockchainVerified: blockchainResult.valid,
        anchored: blockchainResult.checks.anchored
      });

    } catch (networkError) {
      // If backend unreachable, still save but mark as unverified
      console.warn('Blockchain check failed, saving offline:', networkError.message);
      wallet.credentials.push({
        credential,
        signature,
        receivedAt: new Date().toISOString(),
        blockchainVerified: false,
        anchored: false
      });
    }

    // Recalculate trust score
    wallet.trustScore = calculateTrustScore(
      wallet.credentials.map(c => c.credential)
    );

    await this.saveWallet(wallet);
    return wallet;
  }

  async getCredentials() {
    const wallet = await this.loadWallet();
    return wallet ? wallet.credentials : [];
  }

  async prepareCredentialsForSharing() {
    const wallet = await this.loadWallet();
    return {
      did: wallet.did,
      credentials: wallet.credentials,
      trustScore: wallet.trustScore,
      sharedAt: new Date().toISOString()
    };
  }

  async deleteCredential(credentialId) {
    const wallet = await this.loadWallet();
    wallet.credentials = wallet.credentials.filter(
      item => item.credential.id !== credentialId
    );
    wallet.trustScore = calculateTrustScore(
      wallet.credentials.map(c => c.credential)
    );
    await this.saveWallet(wallet);
    return wallet;
  }
}

export default new WalletService();