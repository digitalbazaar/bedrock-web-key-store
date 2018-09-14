/*!
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import forge from 'node-forge';
import {SignatureKeyPair} from './SignatureKeyPair.js';
import {KEY_DOC_TYPE, SUPPORTED_KEY_ALGORITHMS} from './constants.js';

const {pki: {ed25519}, util: {binary: {base58}}} = forge;

export class KeyStore {
  constructor({remoteStorage}) {
    this.remoteStorage = remoteStorage;
  }

  /**
   * Creates and securely stores a new key pair.
   *
   * @param id an identifier for the key.
   * @param [owner] the ID of an owner for the key such as an account or an
   *          identity (defaults to the account ID for this key store).
   * @param algorithm the algorithm for the key pair to generate
   *          (e.g. 'ed25519').
   * @param privateStorage where to store the private key: 'remote' or
   *          'webauthn'.
   *
   * @return a Promise that resolves to a `SignatureKeyPair` instance.
   */
  async create({id, owner, algorithm = 'ed25519', privateStorage = 'remote'}) {
    const {supportedFormats} = SUPPORTED_KEY_ALGORITHMS[algorithm];
    if(!supportedFormats) {
      const algorithms = SUPPORTED_KEY_ALGORITHMS.keys();
      throw new Error(
        `"algorithm" must be one of: ${algorithms.join(', ')}`);
    }

    if(!['remote', 'webauthn'].includes(privateStorage)) {
      throw new Error('"privateStorage" must be "remote" or "webauthn".');
    }
    if(privateStorage === 'webauthn') {
      throw new Error('"webauthn" storage is not implemented yet.');
    }

    // default `owner` to account ID
    const {remoteStorage} = this;
    if(!owner) {
      owner = remoteStorage.accountId;
    }

    // only `ed25519` is presently supported
    const kp = ed25519.generateKeyPair();

    // create keypair document to store remotely
    const doc = {
      id,
      type: KEY_DOC_TYPE,
      privateStorage,
      owner,
      algorithm,
      publicKeyBase58: base58.encode(kp.publicKey)
    };

    // only if `privateStorage` is remote, include private key
    if(privateStorage === 'remote') {
      doc.privateKeyBase58 = base58.encode(kp.privateKey);
    }

    // store key doc remotely
    await remoteStorage.insert({doc});

    const result = new SignatureKeyPair({id, remoteStorage});
    result._init({keyDoc: doc});
    return result;
  }

  /**
   * Deletes a key from remote storage.
   *
   * @param id the ID of the key to delete.
   *
   * @return a Promise that resolves to `true` if the key was deleted
   *         and `false` if it did not exist.
   */
  async delete({id}) {
    return this.remoteStorage.delete({id});
  }

  /**
   * Gets a key from remote storage by its ID.
   *
   * @param id the ID of the key to get.
   *
   * @return a Promise that resolves to a `SignatureKeyPair` instance.
   */
  async get({id}) {
    const {remoteStorage} = this;
    const keyDoc = await remoteStorage.get({id});
    const result = new SignatureKeyPair({id, remoteStorage});
    result._init({keyDoc});
    return result;
  }

  /**
   * Finds keys based on their attributes. The available attributes are
   * `owner`.
   *
   * See: bedrock-web-private-remote-storage for further documentation.
   *
   * @param owner a string or array of strings representing IDs for owners.
   *
   * @return a Promise that resolves to the matching SignatureKeyPair
   *         instances.
   */
  async find({owner}) {
    if(!Array.isArray(owner)) {
      owner = [owner];
    }
    if(!owner.every(x => typeof x === 'string')) {
      throw new TypeError('"owner" must be a string or an array of strings.');
    }

    const equals = owner.map(owner => {owner});
    const keyDocs = this.remoteStorage({equals});
    return keyDocs.map(keyDoc => {
      const result = new SignatureKeyPair({id, remoteStorage});
      result._init({keyDoc});
      return result;
    });
  }
}
