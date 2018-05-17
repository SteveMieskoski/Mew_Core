const test = require('tape')
const MewEngine = require('../../scripts/provider/mewEngine')
const FixtureProvider = require('../fixtures/fixtureProvider')
const common = require('../../scripts/common/index')
const createPayload = common.createPayload
const ethUtil = common.ethUtil
const injectMetrics = require('../fixtures/injectSubproviderMetrics')
const Transaction = common.tx

// const NonceTracker = require('../subproviders/nonce-tracker.js')
const HookedWalletProvider = require('../../scripts/wallets/scraps/hookedWalletDropIn')
const HookedWalletTxProvider = require('../../scripts/wallets/scraps/hookedWalletTxDropIn')


test.skip('generate transaction', function (t) {

})