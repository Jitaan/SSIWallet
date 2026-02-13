/**
 * QR Service
 * Handles QR code generation and parsing
 */
class QRService {
  
  /**
   * Generate QR data for sharing credentials
   * @param {Object} data - Wallet data to encode
   * @returns {String} JSON string for QR code
   */
  generateQRData(data) {
    // Convert to compact JSON string
    return JSON.stringify(data);
  }
  
  /**
   * Parse scanned QR data
   * @param {String} qrString - Raw QR code string
   * @returns {Object} Parsed credential data
   */
  parseQRData(qrString) {
    try {
      return JSON.parse(qrString);
    } catch (error) {
      throw new Error('Invalid QR code data');
    }
  }
  
  /**
   * Validate QR data structure for receiving credentials
   * @param {Object} data - Parsed QR data
   * @returns {Boolean} True if valid
   */
  isValidCredentialQR(data) {
    return (
      data &&
      data.credential &&
      data.signature &&
      data.credential.issuer &&
      data.credential.credentialSubject
    );
  }
  
  /**
   * Validate QR data structure for verification
   * @param {Object} data - Parsed QR data
   * @returns {Boolean} True if valid
   */
  isValidWalletQR(data) {
    return (
      data &&
      data.did &&
      data.credentials &&
      Array.isArray(data.credentials) &&
      typeof data.trustScore === 'number'
    );
  }
  
  /**
   * Extract credential from QR data
   * @param {Object} qrData - Parsed QR data
   * @returns {Object} { credential, signature }
   */
  extractCredential(qrData) {
    if (!this.isValidCredentialQR(qrData)) {
      throw new Error('Invalid credential QR code');
    }
    
    return {
      credential: qrData.credential,
      signature: qrData.signature
    };
  }
  
  /**
   * Prepare multiple credentials for QR display
   * @param {Array} credentials - Array of credentials with signatures
   * @param {String} did - User's DID
   * @param {Number} trustScore - Current trust score
   * @returns {String} QR data string
   */
  prepareWalletQR(credentials, did, trustScore) {
    const data = {
      did,
      credentials: credentials.map(c => ({
        credential: c.credential,
        signature: c.signature
      })),
      trustScore,
      sharedAt: new Date().toISOString()
    };
    
    return this.generateQRData(data);
  }
}

export default new QRService();