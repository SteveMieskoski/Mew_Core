const test = require('tape')
const MewEngine = require('../../scripts/provider/mewEngine')
const MewRelay = require('../scripts/provider/engine/mewRelay')
const fixtures = require('../fixtures/index')
const common = require('../../scripts/common/index')
const createPayload = common.createPayload
const Web3 = require('web3')

test('try to implement a relay', function (t) {
  t.plan(2)

  var engine = new MewEngine()

  let HttpProvider = new fixtures.HttpProvider()
  engine.addTransport(HttpProvider)
  var relay = new MewRelay(engine)
  let web3 = new Web3(relay)

  web3.eth.getCoinbase()
  var txPayload = {
    method: 'eth_coinbase',
    params: []
  }

  // engine.start()
  engine.sendAsync(createPayload(txPayload), function (err, response) {
    t.ifError(err, 'did not error')
    t.ok(response, 'has response')
    t.end()
  })
})
