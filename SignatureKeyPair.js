/*!
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import forge from 'node-forge';
import {SignatureKeyPairCache} from './SignatureKeyPairCache.js';
import {SECURITY_CONTEXT, SUPPORTED_KEY_ALGORITHMS} from './constants.js';

const {pki: {ed25519}} = forge;

export class SignatureKeyPair {
  /**
   * Only to be called from `KeyStore` and must be followed by a call
   * to `_init`.
   */
  constructor({id, remoteStorage}) {
    this.id = id;
    this.cache = new SignatureKeyPairCache({id, remoteStorage});
  }

  /**
   * Exports the public key.
   *
   * @param format the format for the public key
   *          (e.g. "Ed25519VerificationKey2018", "raw").
   *
   * @return a Promise that resolves to the public key according to the given
   *         format.
   */
  async exportPublicKey({format = 'Ed25519VerificationKey2018'}) {
    const kp = await this.cache.get();

    // sanity check, generally should never happen
    if(!kp.algorithm in SUPPORTED_KEY_ALGORITHMS) {
      throw new Error('Invalid key.');
    }

    const {supportedFormats} = SUPPORTED_KEY_ALGORITHMS[kp.algorithm];
    if(!supportedFormats.includes(format)) {
      throw new Error(
        `"format" must be one of: ${supportedFormats.join(', ')}`);
    }

    // TODO: support `jwk`

    if(format === 'raw') {
      return kp.publicKey.slice();
    }
    if(format === 'Ed25519VerificationKey2018') {
      const {owner, publicKeyBase58} = kp;
      return {
        '@context': SECURITY_CONTEXT,
        type: format,
        owner,
        publicKeyBase58
      };
    }
  }

  /**
   * Signs the given data according to this key's material and algorithm.
   *
   * @param data the data, as a Uint8Array or a string, to sign.
   * @param encoding if `data` is a string, the encoding (i.e. 'utf8') to use.
   * @param hash the hash algorithm to use (default: 'SHA-256').
   *
   * @return a Promise that resolves to a Uint8Array with the signature.
   */
  async sign({data, encoding, hash = 'SHA-256'}) {
    if(typeof data === 'string') {
      if(encoding !== 'utf8') {
        throw new Error('Only "utf8" encoding is supported');
      }
      data = _strToUint8Array(data);
    }

    const digest = await crypto.subtle.digest(hash, data);

    if(this.cache.privateStorage === 'webauthn') {
      // TODO: implement webauthn
      throw new Error('Not implemented');
    }

    // private storage is remote, so use private key from cache
    const {privateKey} = await this.cache.get({privateKey: true});
    return ed25519.sign({
      message: data,
      privateKey
    });
  }

  /**
   * Verifies a signature according to this key's material and algorithm.
   *
   * @param data the data, as a Uint8Array or a string, to sign.
   * @param encoding if `data` is a string, the encoding (i.e. 'utf-8') to use.
   * @param hash the hash algorithm to use (default: 'SHA-256').
   * @param signature the signature, as a Uint8Array, to verify.
   *
   * @return a Promise that resolves to `true` if verified and `false` if not.
   */
  async verify({data, encoding, hash = 'SHA-256', signature}) {
    if(typeof data === 'string') {
      if(encoding !== 'utf8') {
        throw new Error('Only "utf8" encoding is supported');
      }
      data = _strToUint8Array(data);
    }

    const digest = await crypto.subtle.digest(hash, data);

    if(this.cache.privateStorage === 'webauthn') {
      // TODO: implement webauthn
      throw new Error('Not implemented');
    }

    // storage type is remote, so use local cache to get key and verify
    const {publicKey} = await this.cache.get();
    return ed25519.verify({
      message: data,
      signature,
      publicKey
    });
  }

  // helper to initialize cache w/o additional remote hit
  async _init({keyDoc}) {
    return this.cache._update({keyDoc});
  }
}

function _strToUint8Array(data) {
  if(typeof data === 'string') {
    // convert data to Uint8Array
    return new TextEncoder().encode(data);
  }
  if(!(data instanceof Uint8Array8)) {
    throw new TypeError('"data" be a string or Uint8Array.');
  }
  return data;
}
