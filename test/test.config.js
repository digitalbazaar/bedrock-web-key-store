/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {config} = require('bedrock');
const path = require('path');

config.karma.suites['bedrock-web-key-store'] = path.join('web', '**', '*.js');

// it is advised to change urlRoot when / is being proxied
config.karma.config.urlRoot = '/karma';
config.karma.config.proxyValidateSSL = false;
const {proxies} = config.karma.config;
// bedrock-server is using a self-signed certificate
proxies['/'] = {
  target: config.server.baseUri,
  changeOrigin: true,
};
// if changeOrigin is not useful, then simpler syntax is available
//proxies['/'] = config.server.baseUri;

// MongoDB
config.mongodb.name = 'bedrock_web_key_store_test';
config.mongodb.dropCollections = {};
config.mongodb.dropCollections.onInit = true;
config.mongodb.dropCollections.collections = [];
