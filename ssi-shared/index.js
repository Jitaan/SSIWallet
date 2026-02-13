import * as ed from '@noble/ed25519';
// import { sha256 } from '@noble/hashes/sha256';
import { sha256 } from '@noble/hashes/sha2.js';
import { base58 } from '@scure/base';
import { v4 as uuidv4 } from 'uuid';

// ========== DID FUNCTIONS ==========

/**
 * Create a new DID identity
 * @returns {Object} { did, privateKey, publicKey }
 */
export async function createDID() {
  // Generate random private key (secret)
  const privateKey = ed.utils.randomPrivateKey();
  
  // Derive public key from private key
  const publicKey = await ed.getPublicKey(privateKey);
  
  // Create DID in did:key format
  // Add multicodec prefix (0xed, 0x01 = Ed25519 key)
  const multicodecKey = new Uint8Array([0xed, 0x01, ...publicKey]);
  
  // Encode to base58
  const encoded = base58.encode(multicodecKey);
  
  // Create DID string
  const did = `did:key:z${encoded}`;
  
  return {
    did,
    privateKey: Buffer.from(privateKey).toString('hex'),
    publicKey: Buffer.from(publicKey).toString('hex')
  };
}

/**
 * Extract public key from a DID
 * @param {string} did - The DID string
 * @returns {string} Public key in hex
 */
export function getPublicKeyFromDID(did) {
  // Remove the did:key:z prefix
  const keyPart = did.replace('did:key:z', '');
  
  // Decode from base58
  const decoded = base58.decode(keyPart);
  
  // Remove multicodec prefix (first 2 bytes)
  const publicKey = decoded.slice(2);
  
  return Buffer.from(publicKey).toString('hex');
}

/**
 * Validate DID format
 * @param {string} did
 * @returns {boolean}
 */
export function isValidDID(did) {
  return /^did:key:z[1-9A-HJ-NP-Za-km-z]+$/.test(did);
}

// ========== CREDENTIAL FUNCTIONS ==========

/**
 * Create a new credential
 * @param {string} issuerDID - Who issues it
 * @param {string} recipientDID - Who receives it
 * @param {string} type - Type of credential
 * @param {Object} data - Credential data
 * @returns {Object} The credential
 */
export function createCredential(issuerDID, recipientDID, type, data) {
  return {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    id: `urn:uuid:${uuidv4()}`,
    type: ['VerifiableCredential', type],
    issuer: issuerDID,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: recipientDID,
      ...data
    }
  };
}

// ========== SIGNATURE FUNCTIONS ==========

/**
 * Sign a credential
 * @param {Object} credential - The credential to sign
 * @param {string} privateKeyHex - Private key in hex
 * @returns {string} Signature in hex
 */
export async function signCredential(credential, privateKeyHex) {
  const privateKey = Buffer.from(privateKeyHex, 'hex');
  
  // Convert credential to string
  const message = JSON.stringify(credential);
  
  // Hash it
  const messageHash = sha256(Buffer.from(message));
  
  // Sign the hash
  const signature = await ed.sign(messageHash, privateKey);
  
  return Buffer.from(signature).toString('hex');
}

/**
 * Verify a credential signature
 * @param {Object} credential - The credential
 * @param {string} signatureHex - Signature in hex
 * @param {string} publicKeyHex - Public key in hex
 * @returns {boolean} True if valid
 */
export async function verifyCredential(credential, signatureHex, publicKeyHex) {
  const signature = Buffer.from(signatureHex, 'hex');
  const publicKey = Buffer.from(publicKeyHex, 'hex');
  
  // Convert credential to string
  const message = JSON.stringify(credential);
  
  // Hash it
  const messageHash = sha256(Buffer.from(message));
  
  // Verify signature
  return await ed.verify(signature, messageHash, publicKey);
}

// ========== TRUST SCORE ==========

const CREDENTIAL_WEIGHTS = {
  'CommunityVouch': 2,
  'RefugeeRegistration': 3,
  'SchoolEnrollment': 5,
  'HealthRecord': 5,
  'VaccinationRecord': 5,
  'BirthCertificate': 10,
  'NationalID': 25,
  'Passport': 30,
  'DriverLicense': 20
};

/**
 * Calculate trust score from credentials
 * @param {Array} credentials - Array of credentials
 * @returns {number} Trust score
 */
export function calculateTrustScore(credentials) {
  let score = 0;
  
  // Add base score for each credential
  credentials.forEach(cred => {
    const credType = Array.isArray(cred.type) ? cred.type[1] : cred.type;
    score += CREDENTIAL_WEIGHTS[credType] || 0;
    
    // Time bonus (credentials get more valuable over time)
    if (cred.issuanceDate) {
      const monthsOld = (Date.now() - new Date(cred.issuanceDate)) / (1000 * 60 * 60 * 24 * 30);
      score += Math.min(monthsOld * 0.5, 10);
    }
  });
  
  // Diversity bonus (multiple different issuers)
  const uniqueIssuers = new Set(credentials.map(c => c.issuer)).size;
  score += uniqueIssuers * 2;
  
  return Math.round(score);
}

// ========== HASH FUNCTION (for blockchain) ==========

/**
 * Create hash of credential (for blockchain anchoring)
 * @param {Object} credential - The credential
 * @returns {string} Hash in hex
 */
export function hashCredential(credential) {
  const credentialString = JSON.stringify(credential);
  const hash = sha256(Buffer.from(credentialString));
  return Buffer.from(hash).toString('hex');
}