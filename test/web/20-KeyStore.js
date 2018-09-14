/*!
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
import {store, MemoryEngine} from 'bedrock-web-store';
import {getKeyStore} from 'bedrock-web-key-store';
import {getRemoteStorage} from 'bedrock-web-private-remote-storage';
import {mock} from './mock.js';

const password = 'password';

describe('KeyStore', () => {
  before(async () => {
    store.setEngine({engine: new MemoryEngine()});
    mock.init();
    const remoteStorage = await getRemoteStorage({accountId: 'test'});
    remoteStorage.on('masterKeyRequest', event => {
      event.respondWith((async () => {
        const masterKey = await remoteStorage.getMasterKey({password});
        return {masterKey};
      })());
    });
  });

  it('should create a key', async () => {
    const keyStore = await getKeyStore({accountId: 'test'});
    const key = await keyStore.create({id: 'key1'});
    should.exist(key.exportPublicKey);
    should.exist(key.sign);
    should.exist(key.verify);
    key.exportPublicKey.should.be.a('function');
    key.sign.should.be.a('function');
    key.verify.should.be.a('function');
  });

  it('should fail to create a key with the same ID', async () => {
    const keyStore = await getKeyStore({accountId: 'test'});
    let err;
    try {
      await keyStore.create({id: 'key1'});
    } catch(e) {
      err = e;
    }
    should.exist(err);
    err.name.should.equal('DuplicateError');
  });
});
