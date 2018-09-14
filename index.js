/*!
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import {KeyStore} from './KeyStore.js';
import {getRemoteStorage} from 'bedrock-web-private-remote-storage';
import {store} from 'bedrock-web-store';

/**
 * Gets an API to access the remote key store for an account.
 *
 * @param accountId the ID of the account.
 *
 * @return a Promise that resolves to a `KeyStore` instance.
 */
export const getKeyStore = async ({accountId}) => {
  if(!(accountId && typeof accountId === 'string')) {
    throw new TypeError('"accountId" must be a non-empty string.');
  }
  const id = `keyStore.${accountId}`;

  // try to return existing key storage
  let keyStore = await store.get({id});
  if(keyStore) {
    return keyStore;
  }

  // try to create key storage
  try {
    const remoteStorage = await getRemoteStorage({accountId});
    await remoteStorage.ensureIndex({attribute: ['algorithm', 'owner']});
    keyStore = new KeyStore({remoteStorage});
    await store.create({id, object: keyStore});
    return keyStore;
  } catch(e) {
    if(e.name === 'DuplicateError') {
      return store.get({id});
    }
    throw e;
  }
};
