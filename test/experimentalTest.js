const test = require('tape')
const MewEngine = require('../scripts/provider/mewEngine')
const fixtures = require('./fixtures')
const common = require('../scripts/common/index')
const PassthroughProvider = require('./fixtures/passthrough')
const FixtureProvider = require('./fixtures/fixtureProvider')
const injectMetrics = require('./fixtures/injectSubproviderMetrics')

const createPayload = common.createPayload
const Web3 = require('web3')

test('allow uncaught and permitted method to fall through', function (t) {
  t.plan(3)

  var privateKey = new Buffer('cccd8f4d88de61f92f3747e4a9604a0395e6ad5138add4bec4a2ddf231ee24f9', 'hex')
  var address = new Buffer('1234362ef32bcd26d3dd18ca749378213625ba0b', 'hex')
  var addressHex = '0x' + address.toString('hex')


  let httpProvider = new fixtures.HttpProvider()
  // handle nothing
  var providerA = injectMetrics(new PassthroughProvider())
  // handle "test_rpc"
  var providerB = injectMetrics(new FixtureProvider({
    test_rpc: true
  }))
  var providerC = injectMetrics(new FixtureProvider({
    custom_method: true
  }))

  var engine = new MewEngine()
  engine.addTransport(httpProvider)
  engine.addProvider(providerA)
  engine.addProvider(providerB)
  engine.addProvider(providerC, "custom_method")
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
    t.equal(response.result, null, "result present")
    console.log(response); // todo remove dev item
    t.end()
  })
})


test('fallthrough test', function (t) {
  t.plan(8)

  let httpProvider = new fixtures.HttpProvider()
  // handle nothing
  var providerA = injectMetrics(new PassthroughProvider())
  // handle "test_rpc"
  var providerB = injectMetrics(new FixtureProvider({
    test_rpc: true
  }))
  var providerC = injectMetrics(new FixtureProvider({
    custom_method: true
  }))
  // handle block requests
  // var providerC = injectMetrics(new TestBlockProvider())

  var engine = new MewEngine()
  engine.addTransport(httpProvider)
  engine.addProvider(providerA)
  engine.addProvider(providerB)
  engine.addProvider(providerC, "custom_method")

  // engine.start()
  engine.sendAsync(createPayload({ method: 'custom_method' }), function (err, response) {
    t.ifError(err, 'did not error')
    t.ok(response, 'has response')

    t.equal(providerA.getWitnessed('test_rpc').length, 0, 'providerA did NOT see "test_rpc"')
    t.equal(providerA.getHandled('test_rpc').length, 0, 'providerA did NOT handle "test_rpc"')

    t.equal(providerB.getWitnessed('test_rpc').length, 0, 'providerB did NOT see "test_rpc"')
    t.equal(providerB.getHandled('test_rpc').length, 0, 'providerB did NOT handle "test_rpc"')

    t.equal(providerC.getWitnessed('custom_method').length, 1, 'providerC did see "custom_method"')
    t.equal(providerC.getHandled('custom_method').length, 1, 'providerC did handle "custom_method"')

    // engine.stop()
    t.end()
  })

/*  engine.sendAsync(createPayload({ method: 'test_rpc' }), function (err, response) {
    t.ifError(err, 'did not error')
    t.ok(response, 'has response')

    // t.equal(providerA.getWitnessed('test_rpc').length, 1, 'providerA did see "test_rpc"')
    // t.equal(providerA.getHandled('test_rpc').length, 0, 'providerA did NOT handle "test_rpc"')
    //
    // t.equal(providerB.getWitnessed('test_rpc').length, 1, 'providerB did see "test_rpc"')
    // t.equal(providerB.getHandled('test_rpc').length, 1, 'providerB did handle "test_rpc"')

    t.equal(providerC.getWitnessed('custom_method').length, 0, 'providerC did see "custom_method"')
    t.equal(providerC.getHandled('custom_method').length, 0, 'providerC did handle "custom_method"')

    // engine.stop()
    t.end()
  })*/

})


test('fallthrough test', function (t) {
  t.plan(8)

  let httpProvider = new fixtures.HttpProvider()
  // handle nothing
  var providerA = injectMetrics(new PassthroughProvider())
  // handle "test_rpc"
  var providerB = injectMetrics(new FixtureProvider({
    test_rpc: true
  }))
  var providerC = injectMetrics(new FixtureProvider({
    custom_method: true
  }))
  // handle block requests
  // var providerC = injectMetrics(new TestBlockProvider())

  var engine = new MewEngine()
  engine.addTransport(httpProvider)
  engine.addProvider(providerA)
  engine.addProvider(providerB)
  engine.addProvider(providerC, "custom_method")

  // engine.start()


    engine.sendAsync(createPayload({ method: 'test_rpc' }), function (err, response) {
      t.ifError(err, 'did not error')
      t.ok(response, 'has response')

      t.equal(providerA.getWitnessed('test_rpc').length, 1, 'providerA did see "test_rpc"')
      t.equal(providerA.getHandled('test_rpc').length, 0, 'providerA did NOT handle "test_rpc"')

      t.equal(providerB.getWitnessed('test_rpc').length, 1, 'providerB did see "test_rpc"')
      t.equal(providerB.getHandled('test_rpc').length, 1, 'providerB did handle "test_rpc"')

      t.equal(providerC.getWitnessed('custom_method').length, 0, 'providerC did NOT see "custom_method"')
      t.equal(providerC.getHandled('custom_method').length, 0, 'providerC did NOT handle "custom_method"')

      // engine.stop()
      t.end()
    })

})
