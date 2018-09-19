/*!
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import forge from 'node-forge';
import {KEY_DOC_TYPE} from './constants.js';

const {util: {binary: {base58}}} = forge;

const DEFAULT_KEY_TIMEOUT = 60000;

export class SignatureKeyPairCache {
  constructor({id, remoteStorage}) {
    this.id = id;
    this.keyDoc = null;
    this.privateStorage = null;
    this.privateKey = null;
    this.publicKey = null;
    this.expiration = {
      expires: null,
      timeout: 0,
      timerId: null
    };
    this.remoteStorage = remoteStorage;
  }

  clear() {
    if(this.privateKey) {
      this.privateKey.fill(0);
    }
    this.keyDoc = this.privateKey = this.publicKey = null;
  }

  resetTimeout({timeout}) {
    if(timeout === undefined) {
      timeout = this.expiration.timeout;
    }
    clearTimeout(this.timerId);
    this.timerId = setTimeout(this.clear.bind(this), timeout);
  }

  async get({includePrivateKey = false, timeout = DEFAULT_KEY_TIMEOUT} = {}) {
    if(this.keyDoc) {
      // key in cache, load it
      const {id, owner, algorithm, publicKeyBase58} = this.keyDoc;
      const publicKey = base58.decode(publicKeyBase58);
      /* ed25519 not available in WebCrypto API yet
      const publicKey = await crypto.subtle.importKey(
        'raw', publicKey, 'ed25519', false, ['verify']); */
      const result = {id, algorithm, owner, publicKey, publicKeyBase58};
      if(includePrivateKey) {
        result.privateKey = this.privateKey;
      }
      this.resetTimeout({timeout});
      return result;
    }

    // update cache with fresh key doc from remote storage
    const keyDoc = await this.remoteStorage.get({id: this.id});
    await this._update({keyDoc, timeout});

    // return cached value
    return this.get({includePrivateKey, timeout});
  }

  async _update({keyDoc, timeout = DEFAULT_KEY_TIMEOUT}) {
    // sanity check, generally should never happen
    if(keyDoc.type !== KEY_DOC_TYPE) {
      throw new Error('Invalid key.');
    }

    this.clear();
    this.keyDoc = keyDoc;
    this.privateStorage = keyDoc.privateStorage;

    // load private key if stored remotely
    if(keyDoc.privateStorage === 'remote') {
      const privateKey = base58.decode(keyDoc.privateKeyBase58);
      /* ed25519 not available in WebCrypto API yet
      this.privateKey = await crypto.subtle.importKey(
        'raw', privateKey, 'ed25519', false, ['sign']); */
      this.privateKey = privateKey;
    }

    // load public key
    const publicKey = base58.decode(keyDoc.publicKeyBase58);
    /* ed25519 not available in WebCrypto API yet
    this.publicKey = await crypto.subtle.importKey(
      'raw', publicKey, 'ed25519', false, ['verify']); */
    this.publicKey = publicKey;

    // set timeout for cache as specified
    this.expiration.timeout = timeout;
  }
}
