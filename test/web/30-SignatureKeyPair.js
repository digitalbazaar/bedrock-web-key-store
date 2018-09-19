/*!
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import {store, MemoryEngine} from 'bedrock-web-store';
import {getKeyStore} from 'bedrock-web-key-store';
import {getRemoteStorage} from 'bedrock-web-private-remote-storage';
import {mock} from './mock.js';

const SECURITY_CONTEXT = 'https://w3id.org/security/v2';

let key;
const password = 'password';

describe('SignatureKeyPair', () => {
  before(async () => {
    store.setEngine({engine: new MemoryEngine()});
    const storage = mock.init();
    const remoteStorage = await getRemoteStorage({accountId: 'test'});
    remoteStorage.on('masterKeyRequest', event => {
      event.respondWith((async () => {
        const masterKey = await remoteStorage.getMasterKey({password});
        return {masterKey};
      })());
    });
    storage.test.store(mock.staticTestKey);
    const keyStore = await getKeyStore({accountId: 'test'});
    key = await keyStore.get({id: 'testKey'});
    should.exist(key.exportPublicKey);
    should.exist(key.sign);
    should.exist(key.verify);
    key.exportPublicKey.should.be.a('function');
    key.sign.should.be.a('function');
    key.verify.should.be.a('function');
  });

  it('should export an Ed25519VerificationKey2018 public key', async () => {
    const format = 'Ed25519VerificationKey2018';
    const publicKey = await key.exportPublicKey({format});
    should.exist(publicKey);
    const expected = {
      '@context': SECURITY_CONTEXT,
      type: format,
      // note: `test` should really be a URL... but lib doesn't care
      // so neither do we
      owner: 'test',
      publicKeyBase58: mock.staticTestKeyPublicKeyBase58
    };
    publicKey.should.deep.equal(expected);
  });

  it('should fail to export a key using an unknown format', async () => {
    let err;
    try {
      const format = 'unknown';
      await key.exportPublicKey({format});
    } catch(e) {
      err = e;
    }
    should.exist(err);
  });

  it('should sign data with a key', async () => {
    const data = new Uint8Array([0x00]);
    const signature = await key.sign({data, hash: 'SHA-256'});
    should.exist(signature);
  });

  it('should verify data with a key', async () => {
    const data = new Uint8Array([0x00]);
    const signature = await key.sign({data, hash: 'SHA-256'});
    should.exist(signature);
    const verified = await key.verify({data, hash: 'SHA-256', signature});
    should.exist(verified);
    verified.should.equal(true);
  });

  it('should fail to verify data with a key', async () => {
    let data = new Uint8Array([0x00]);
    const signature = await key.sign({data, hash: 'SHA-256'});
    should.exist(signature);
    data = new Uint8Array([0x01]);
    const verified = await key.verify({data, hash: 'SHA-256', signature});
    should.exist(verified);
    verified.should.equal(false);
  });
});
