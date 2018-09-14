/*!
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
import {store, MemoryEngine} from 'bedrock-web-store';
import {getKeyStore} from 'bedrock-web-key-store';
import {mock} from './mock.js';

const password = 'password';

describe('getKeyStore', () => {
  before(() => {
    store.setEngine({engine: new MemoryEngine()});
    mock.init();
  });

  it('should get getKeyStore for accountId `test`', async () => {
    const keyStore = await getKeyStore({accountId: 'test'});
    keyStore.get.should.be.a('function');
  });
});
