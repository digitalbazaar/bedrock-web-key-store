/*!
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {MockStorage} from 'bedrock-web-mock-private-remote-storage';

export const mock = {};

mock.staticMasterKey = {
  unprotected: {
    alg: 'PBES2-HS512+A256KW',
    p2c: 4096,
    p2s: 'd7l6Ub5T0eZlpWjhSGI3Q19DtcogEkHg1hN8JzORj4U'
  },
  encrypted_key:
    'HrLOox-iCFlwCsQIWAWJ7UCuzjt2jdzOv92rEFNYymNX0XiIE_k8U-' +
    'z_Y3kCc_xqQ_wob904Q3XJxwzsO6xla7plr54MVh0N'
};

// decrypted ID is `testKey`
mock.staticTestKey = {
  id: 'WR4aQN9YI7ae8_24FHQ3Z18PSyMF9_rESO9CBN-w4vk',
  attributes: [{
    name: 'lkY_rWFARvnptYVj5tKRXc8eaWgSe2qOMhvNKsh6nCw',
    value: '7rY4OHFQgCmF3rJmUQjcKBYPmEaY0dZlFBt2Zg8G-uY'
  }, {
    name: '6q43TFKGWGt_7niws_MNRh-2_nH7RkSQ9ORRy7bL9ZQ',
    value: 'h5JZiNGV-hYSKARyP0mjMFWzTmsYNaIPrqQ6cioLrUM'
  }, {
    name: 'JEQJdd0JICLtzqapAwH_lQVUeBW7m2tw98e-BdgHDtg',
    value: 'Eaeib6AZ99lfERzaZV0AX6Ca7lk4Q9HtZaUFbiZiGB4'
  }],
  jwe: {
    unprotected: {
      alg: 'A256KW',
      enc: 'A256GCM'
    },
    encrypted_key: 'O8HsSPnig_K1e5N62s0C3u-P8CUMZH7y2G_hoQei9lc8pjmbHkM8MQ',
    iv: '8btZL1HzHFRTeaEX',
    ciphertext: 'aRBxJ8XROQCJQJ4xK5KWuewrVwwjdtsPUrHzoWSW-jJJdijE3MKCFtwL_' +
      'lfb08cpR-m12lBSIW3p3u7Lbp8bp1Pa7Ao9p2gTbseUZyoGlj1gzUzgIUztJl1gtrx0' +
      'Qol272AycPSOCwBp-d9biZeNhOXz1KnbscovYopZWeoWWfuNlArEdkSv_PST5Z1joKR' +
      'dkKa39FBBFsV9nd8fzX02kGWapCdLYCJ-c2jAYIzmXhBL3Y8dL_stsF-NVgxjgiuwA-' +
      '04L3XQSUd9HrDv8DA3o6TZDAsJKI5--dKmv4C81B4h84f5Vr9rL6NVpoCeOcvX28lf3' +
      'MwY51zMmYm0cnoQ31blkeSSuj7wDFwi3OdI',
    tag: 'J1bgpxNGMZalWujqd6NUGA'
  }
};
// mock staticTestKey public key value
mock.staticTestKeyPublicKeyBase58 =
  'HGXQrv47yZvr11kgmNBiBuGLoLTYEPwuApE66A8AcUJj';

mock.init = () => {
  const mockAdapter = new MockAdapter(axios);

  const storage = {};

  storage.test = new MockStorage({accountId: 'test', mockAdapter});
  storage.test.masterKey = mock.staticMasterKey;

  return storage;
};
