/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {config} = require('bedrock');
const path = require('path');
const {permissions, roles} = config.permission;

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

// do not require an authenticated session for KMS operations
config['kms-http'].requireAuthentication = false;

// MongoDB
config.mongodb.name = 'bedrock_web_key_store_test';
config.mongodb.dropCollections = {};
config.mongodb.dropCollections.onInit = true;
config.mongodb.dropCollections.collections = [];

roles['bedrock-account.regular'] = {
  id: 'bedrock-account.regular',
  label: 'Account Test Role',
  comment: 'Role for Test User',
  sysPermission: [
    permissions.ACCOUNT_ACCESS.id,
    permissions.ACCOUNT_UPDATE.id,
    permissions.ACCOUNT_INSERT.id,
    permissions.DATA_HUB_CONFIG_ACCESS.id,
    permissions.DATA_HUB_CONFIG_UPDATE.id,
    permissions.DATA_HUB_CONFIG_REMOVE.id,
    permissions.DATA_HUB_STORAGE_ACCESS.id,
    permissions.DATA_HUB_DOCUMENT_ACCESS.id,
    permissions.DATA_HUB_DOCUMENT_UPDATE.id,
    permissions.DATA_HUB_DOCUMENT_REMOVE.id
  ]
};
