/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import {KeyStore} from 'bedrock-web-key-store';

import {AccountMasterKey, KmsService} from 'bedrock-web-kms';
import {DataHub, DataHubService} from 'bedrock-web-data-hub';

let keyStore;

describe('describe', () => {
  before(async () => {
    const kmsPlugin = 'ssm-v1';
    const kmsService = new KmsService();
    const accountId = 'urn:foo';
    const kmsApi = await AccountMasterKey.fromSecret({
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

  it('does something', async () => {
    keyStore.insert({id: 'https://example.com/foo'});
  });
});
