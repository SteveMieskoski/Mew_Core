const test = require('tape')
const MewEngine = require('../scripts/provider/mewEngine')
const fixtures = require('./fixtures')
const common = require('../scripts/common/index')
const createPayload = common.createPayload
const Web3 = require('web3')

test('allow uncaught and permitted method to fall through', function (t) {
  t.plan(2)

  var privateKey = new Buffer('cccd8f4d88de61f92f3747e4a9604a0395e6ad5138add4bec4a2ddf231ee24f9', 'hex')
  var address = new Buffer('1234362ef32bcd26d3dd18ca749378213625ba0b', 'hex')
  var addressHex = '0x' + address.toString('hex')


  var engine = new MewEngine()
  let HttpProvider = new fixtures.HttpProvider()
  engine.addTransport(HttpProvider)
  let web3 = new Web3(engine)

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
