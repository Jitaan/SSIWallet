// TEMPORARY MOCK — replace with real ssi-shared when available

export async function createDID() {
  // Generate a realistic did:key format
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomId = 'z6Mk';
  for (let i = 0; i < 32; i++) {
    randomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return {
    did: `did:key:${randomId}`,
    privateKey: 'mock-private-key-' + randomId,
    publicKey: 'mock-public-key-' + randomId,
  };
}

export function calculateTrustScore(credentials) {
  return credentials.length * 10;
}

export async function verifyCredential(credential, signature, publicKey) {
  return true;
}

export function getPublicKeyFromDID(did) {
  return 'mock-public-key-for-' + did;
}