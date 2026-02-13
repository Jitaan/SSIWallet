import { createDID, createCredential, signCredential } from 'ssi-shared';
import fs from 'fs';
import path from 'path';

/**
 * Issuer Service
 * Manages the issuer's identity and credential issuance
 */
class IssuerService {

    identity = null;
    identityFile = path.join(process.cwd(), '.issuer-identity.json');

    constructor() {
        this.identity = null;
        this.identityFile = path.join(process.cwd(), '.issuer-identity.json');
    }

    /**
     * Initialize issuer identity
     */
    async initialize() {
        console.log('🔑 Initializing issuer identity...');

        // Try to load existing identity
        if (fs.existsSync(this.identityFile)) {
            console.log('📂 Loading existing identity...');
            const data = fs.readFileSync(this.identityFile, 'utf8');
            this.identity = JSON.parse(data);
            console.log('✅ Loaded identity:', this.identity.did);
        } else {
            console.log('🆕 Creating new identity...');
            this.identity = await createDID();

            // Save it
            fs.writeFileSync(
                this.identityFile,
                JSON.stringify(this.identity, null, 2)
            );

            console.log('✅ Created identity:', this.identity.did);
            console.log('💾 Saved to:', this.identityFile);
        }

        return this.identity;
    }

    /**
     * Issue a new credential
     */
    async issueCredential(recipientDID, credentialType, credentialData) {
        if (!this.identity) {
            throw new Error('Issuer not initialized');
        }

        console.log('📝 Issuing credential...');
        console.log('   Type:', credentialType);
        console.log('   Recipient:', recipientDID.substring(0, 20) + '...');

        // Validate recipient DID
        if (!recipientDID.startsWith('did:key:z')) {
            throw new Error('Invalid recipient DID format');
        }

        // Create credential
        const credential = createCredential(
            this.identity.did,
            recipientDID,
            credentialType,
            credentialData
        );

        // Add issuer name
        credential.issuerName = process.env.ISSUER_NAME || 'SSI Issuer';

        // Sign it
        const signature = await signCredential(
            credential,
            this.identity.privateKey
        );

        console.log('✅ Credential issued:', credential.id);

        return { credential, signature };
    }

    /**
     * Get issuer's DID
     */
    getIssuerDID() {
        return this.identity?.did;
    }

    /**
     * Get issuer info
     */
    getInfo() {
        return {
            did: this.identity?.did,
            name: process.env.ISSUER_NAME || 'SSI Issuer',
            publicKey: this.identity?.publicKey
        };
    }
}

export default new IssuerService();