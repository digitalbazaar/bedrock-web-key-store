/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
const brPassport = require('bedrock-passport');
const helpers = require('./helpers');

const accounts = {};
let actors;

bedrock.events.on('bedrock-mongodb.ready', async () => {
  await helpers.prepareDatabase({accounts});
  actors = await helpers.getActors({accounts});
});

// regular permissions
const email = 'alpha@example.com';
accounts[email] = {};
accounts[email].account = helpers.createAccount(email);
accounts[email].account.id = 'urn:uuid:e534fa02-b136-4ff1-943d-4f88458f6324';
accounts[email].meta = {};
accounts[email].meta.sysResourceRole = [{
  sysRole: 'bedrock-account.regular',
  generateResource: 'id'
}];

// auto-pass authentication checks

brPassport.authenticateAll = (/*{req}*/) => {
  // const email = req.get('x-test-account');
  const email = 'alpha@example.com';
  return {
    user: {
      actor: actors[email],
      account: accounts[email].account
    }
  };
};
