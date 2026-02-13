import express from 'express';
import QRCode from 'qrcode';
import IssuerService from '../services/IssuerService.js';
import BlockchainService from '../services/BlockchainService.js';

const router = express.Router();

/**
 * GET /api/issuer/info
 */
router.get('/info', (req, res) => {
  const info = IssuerService.getInfo();
  res.json(info);
});

/**
 * POST /api/issuer/issue
 */
router.post('/issue', async (req, res) => {
  try {
    const { recipientDID, credentialType, credentialData } = req.body;
    
    // Validate
    if (!recipientDID) {
      return res.status(400).json({ error: 'recipientDID is required' });
    }
    if (!credentialType) {
      return res.status(400).json({ error: 'credentialType is required' });
    }
    if (!credentialData) {
      return res.status(400).json({ error: 'credentialData is required' });
    }
    
    // Issue credential
    const { credential, signature } = await IssuerService.issueCredential(
      recipientDID,
      credentialType,
      credentialData
    );
    
    // Queue for blockchain (async)
    BlockchainService.queueForAnchoring(credential);
    
    // Generate QR code
    const qrData = JSON.stringify({ credential, signature });
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2
    });
    
    res.json({
      success: true,
      credential,
      signature,
      qrCode: qrCodeDataURL,
      message: `${credentialType} issued successfully`,
      note: 'Credential will be anchored to blockchain shortly'
    });
    
  } catch (error) {
    console.error('Error issuing credential:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/issuer/anchor-now
 */
router.post('/anchor-now', async (req, res) => {
  try {
    const results = await BlockchainService.processBatch();
    
    res.json({
      success: true,
      count: results.length,
      results,
      message: `Anchored ${results.length} credentials`
    });
  } catch (error) {
    console.error('Error anchoring batch:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/issuer/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const gasInfo = await BlockchainService.getGasInfo();
    
    res.json({
      issuer: IssuerService.getInfo(),
      blockchain: gasInfo,
      pendingAnchors: BlockchainService.pendingAnchors.length
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;