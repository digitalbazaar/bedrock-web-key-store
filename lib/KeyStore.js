/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

/**
 * Each instance of this API is associated with a single data hub
 */
export class KeyStore {
  constructor({hub}) {
    this.hub = hub;
  }

  /**
   * Performs initialization (ensures required indexes are created).
   */
  init() {
    // FIXME: enable
    // this.hub.ensureIndex({attribute: []});
  }

  /**
   * Gets a key by its ID.
   *
   * @param {string} id - The key ID.
   */
  async get({id}) {
    const keyInfo = await this.hub.get({id});
    // TODO: use keyInfo to determine some provider/plugin to use to
    // instantiate some key class that at minimum provides a `signer` factory
    // that can be used with jsonld-signatures.  keyInfo currently looks like
    // this
    /*
    {
      "id": "did:v1:nym:z6MkmYGdjrYK3RAhGs34uuX4vzy1GSdhZLX9J2sEPAowi3aG#z6MkuYYy6Qi42vF5u1jucyGMCpMu7u8Zs4LwSjoZdR4PiASB",
      "privateKey": "https://localhost:9876/kms/ssm-v1/6795858b-24db-4c17-b3cd-a8a8aba18ae1",
      "type": "Ed25519VerificationKey2018",
      "publicKeyBase58": "G6HvWATchNkcnWuCwQJWMiouJKriTB6akitdo96Nnweo"
    }
    */
    return keyInfo;
  }

  /**
   * Stores a key in remote private storage.
   *
   * @param {Object} key - The key to store.
   */
  async insert({key}) {
    return this.hub.insert({doc: key});
  }
}
