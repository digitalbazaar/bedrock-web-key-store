/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
require('bedrock-data-hub-storage');
require('bedrock-kms-http');
require('bedrock-ssm-mongodb');
require('bedrock-karma');

require('./setup-accounts');

require('bedrock-test');
bedrock.start();
