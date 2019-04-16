/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import {KeyStore} from 'bedrock-web-key-store';

import {AccountMasterKey, KmsService} from 'bedrock-web-kms';
import {DataHub, DataHubService} from 'bedrock-web-data-hub';

let keyStore;
let kmsApi;

describe('describe', () => {
  before(async () => {
    const kmsPlugin = 'ssm-v1';
    const kmsService = new KmsService();

    // this corresponds to the account setup in setup-accounts.js
    const accountId = 'urn:uuid:e534fa02-b136-4ff1-943d-4f88458f6324';

    kmsApi = await AccountMasterKey.fromSecret({
      accountId,
      kmsPlugin,
      kmsService,
      secret: 'woohoo',
    });

    // Use the Master Key to create KEK and HMAC keys
    const kek = await kmsApi.generateKey({type: 'kek'});
    const hmac = await kmsApi.generateKey({type: 'hmac'});

    const config = {
      sequence: 0,
      controller: accountId,
      primary: true,
      kek: {id: kek.id, algorithm: kek.algorithm},
      hmac: {id: hmac.id, algorithm: hmac.algorithm}
    };

    const dhs = new DataHubService();
    const remoteConfig = await dhs.create({config});
    const hub = new DataHub({config: remoteConfig, kek, hmac});

    keyStore = new KeyStore({hub});
  });

  it('stores and retrieves a key', async () => {
    const ed25519Key = await kmsApi.generateKey(
      {type: 'Ed25519VerificationKey2018'});

    // set the public key ID
    ed25519Key.id = 'urn:uuid:c47f1b83-be7d-44b5-b5e1-901c5ec2caa9';

    const keyData = ed25519Key.export();

    await keyStore.insert({key: {
      // id is the public ID
      id: ed25519Key.id,
      content: keyData
    }});
    const {content: keyFromStorage} = await keyStore.get({id: ed25519Key.id});

    keyFromStorage.should.eql(keyData);

    const keyInstanceFromStorage = await kmsApi.keyFromStorage(keyFromStorage);

    keyInstanceFromStorage.export().should.eql(keyData);
  });
});
