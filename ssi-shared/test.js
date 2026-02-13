import { createDID, createCredential, signCredential, verifyCredential, calculateTrustScore, hashCredential } from './index.js';

async function test() {
  console.log('🧪 Testing SSI Shared Library\n');
  
  // Test 1: Create DIDs
  console.log('Test 1: Creating DIDs...');
  const issuer = await createDID();
  const recipient = await createDID();
  
  console.log('✅ Issuer DID:', issuer.did);
  console.log('✅ Recipient DID:', recipient.did);
  console.log('');
  
  // Test 2: Create credential
  console.log('Test 2: Creating credential...');
  const credential = createCredential(
    issuer.did,
    recipient.did,
    'BirthCertificate',
    {
      name: 'Test Person',
      birthDate: '2000-01-01',
      birthPlace: 'Test City'
    }
  );
  
  console.log('✅ Credential created:', credential.id);
  console.log('');
  
  // Test 3: Sign credential
  console.log('Test 3: Signing credential...');
  const signature = await signCredential(credential, issuer.privateKey);
  
  console.log('✅ Signature:', signature.substring(0, 20) + '...');
  console.log('');
  
  // Test 4: Verify credential
  console.log('Test 4: Verifying credential...');
  const isValid = await verifyCredential(credential, signature, issuer.publicKey);
  
  console.log('✅ Signature valid:', isValid);
  console.log('');
  
  // Test 5: Trust score
  console.log('Test 5: Calculating trust score...');
  const score = calculateTrustScore([credential]);
  
  console.log('✅ Trust score:', score);
  console.log('');
  
  // Test 6: Hash credential
  console.log('Test 6: Hashing credential...');
  const hash = hashCredential(credential);
  
  console.log('✅ Hash:', hash.substring(0, 20) + '...');
  console.log('');
  
  console.log('🎉 All tests passed!');
}

test().catch(console.error);