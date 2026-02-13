import { createDID } from 'ssi-shared';

async function test() {
  const identity = await createDID();
  console.log('✅ Import works! DID:', identity.did);
}

test();
