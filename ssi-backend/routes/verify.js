import express from 'express';
import { verifyCredential, getPublicKeyFromDID, calculateTrustScore } from 'ssi-shared';
import BlockchainService from '../services/BlockchainService.js';

const router = express.Router();

/**
 * POST /api/verify/credential
 */
router.post('/credential', async (req, res) => {
  try {
    const { credential, signature } = req.body;
    
    if (!credential || !signature) {
      return res.status(400).json({ error: 'credential and signature are required' });
    }
    
    console.log('🔍 Verifying credential:', credential.id);
    
    // 1. Verify signature
    const issuerPublicKey = getPublicKeyFromDID(credential.issuer);
    const isValidSignature = await verifyCredential(credential, signature, issuerPublicKey);
    
    // 2. Check if anchored
    const anchorInfo = await BlockchainService.isAnchored(credential);
    
    // 3. Check if revoked
    const isRevoked = await BlockchainService.isRevoked(credential);
    
    // 4. Check expiration
    let isExpired = false;
    if (credential.expirationDate) {
      isExpired = new Date(credential.expirationDate) < new Date();
    }
    
    const isValid = isValidSignature && !isRevoked && !isExpired;
    
    res.json({
      valid: isValid,
      checks: {
        signatureValid: isValidSignature,
        anchored: anchorInfo.anchored,
        anchoredDate: anchorInfo.anchoredDate,
        revoked: isRevoked,
        expired: isExpired
      },
      credential: {
        id: credential.id,
        type: credential.type,
        issuer: credential.issuer,
        recipient: credential.credentialSubject.id,
        issuedDate: credential.issuanceDate
      },
      message: isValid ? 'Credential is valid' : 'Credential is invalid'
    });
    
  } catch (error) {
    console.error('Error verifying credential:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;