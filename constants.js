/*!
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

export const KEY_DOC_TYPE = 'KeyPair;'

export const SECURITY_CONTEXT = 'https://w3id.org/security/v2';

export const SUPPORTED_KEY_ALGORITHMS = {
  ed25519: {
    // TODO: support `jwk`
    supportedFormats: ['Ed25519VerificationKey2018', 'raw']
  }
};
