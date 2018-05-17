
const test = require('tape')
const MewEngine = require('../scripts/provider/mewEngine')
const PassthroughProvider = require('./fixtures/passthrough')
const FixtureProvider = require('./fixtures/fixtureProvider')
// const TestBlockProvider = require('./util/block.js')
const createPayload = require('../scripts/common/index').createPayload
const injectMetrics = require('./fixtures/injectSubproviderMetrics')

test('fallthrough test', function (t) {
  t.plan(6)

  // handle nothing
  var providerA = injectMetrics(new PassthroughProvider())
  // handle "test_rpc"
  var providerB = injectMetrics(new FixtureProvider({
    test_rpc: true
  }))
  // handle block requests
  // var providerC = injectMetrics(new TestBlockProvider())

  var engine = new MewEngine()
  engine.addProvider(providerA)
  engine.addProvider(providerB)
  // engine.addProvider(providerC)

  // engine.start()
  engine.sendAsync(createPayload({ method: 'test_rpc' }), function (err, response) {
    t.ifError(err, 'did not error')
    t.ok(response, 'has response')

    t.equal(providerA.getWitnessed('test_rpc').length, 1, 'providerA did see "test_rpc"')
    t.equal(providerA.getHandled('test_rpc').length, 0, 'providerA did NOT handle "test_rpc"')

    t.equal(providerB.getWitnessed('test_rpc').length, 1, 'providerB did see "test_rpc"')
    t.equal(providerB.getHandled('test_rpc').length, 1, 'providerB did handle "test_rpc"')

    // t.equal(providerC.getWitnessed('test_rpc').length, 0, 'providerC did NOT see "test_rpc"')
    // t.equal(providerC.getHandled('test_rpc').length, 0, 'providerC did NOT handle "test_rpc"')

    // engine.stop()
    t.end()
  })
})
