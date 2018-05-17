const test = require('tape')
const MewEngine = require('../../scripts/provider/mewEngine')
const HttpProvider = require('../../scripts/provider/modules/httpTransport.js')
const common = require('../../scripts/common/index')
const createPayload = common.createPayload
const Web3 = require('web3')

test('allow uncaught and permitted method to fall through', function (t) {
  t.plan(2)

  var engine = new MewEngine()
  let httpProvider = new HttpProvider()
  engine.addTransport(httpProvider)

  var txPayload = {
    method: 'eth_coinbase',
    params: []
  }

  // engine.start()
  engine.sendAsync(createPayload(txPayload), function (err, response) {
    t.ifError(err, 'did not error')
    t.ok(response, 'has response')
    console.log(response); // todo remove dev item
    t.end()
  })
})


test('allow uncaught and permitted web3 method call to fall through', function (t) {
  t.plan(1)

  var engine = new MewEngine()
  let httpProvider = new HttpProvider()
  engine.addTransport(httpProvider)
  let web3 = new Web3(engine)

  let response = web3.eth.getCoinbase()
  response.then(_result => {
      t.ok(_result, 'has response')
    console.log(_result); // todo remove dev item
    t.end()
  })
    .catch(error => {
      t.ifError(error, 'did not error')
      t.end()
    })
})


