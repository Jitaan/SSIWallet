// Replace this with the actual backend server IP
const BASE_URL = 'http://10.0.2.2:3000';

class APIService {

  // Check if backend is running
  async healthCheck() {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Cannot reach backend server');
    }
  }

  // Verify a credential against the blockchain
  async verifyCredential(credential, signature) {
    try {
      const response = await fetch(`${BASE_URL}/api/verify/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credential, signature })
      });

      const data = await response.json();
      return data;
      // Returns:
      // {
      //   valid: true/false,
      //   checks: {
      //     signatureValid: true/false,
      //     anchored: true/false,
      //     revoked: true/false,
      //     expired: true/false
      //   }
      // }

    } catch (error) {
      throw new Error('Verification failed: ' + error.message);
    }
  }

  // Get issuer info
  async getIssuerInfo() {
    try {
      const response = await fetch(`${BASE_URL}/api/issuer/info`);
      return await response.json();
    } catch (error) {
      throw new Error('Cannot get issuer info');
    }
  }
}

export default new APIService();