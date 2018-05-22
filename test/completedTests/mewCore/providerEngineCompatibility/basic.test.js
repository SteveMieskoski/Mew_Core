const test = require('tape')
const MewCore = require('../../../../scripts/core/index')
const FakeHttpProvider = require('../../../fixtures/index').FakeHttpProvider;
const PassthroughProvider = require('web3-provider-engine/test/util/passthrough.js')
const FixtureProvider = require('web3-provider-engine/subproviders/fixture.js')
const TestBlockProvider = require('web3-provider-engine/test/util/block.js')
const createPayload = require('web3-provider-engine/util/create-payload.js')
const injectMetrics = require('web3-provider-engine/test/util/inject-metrics')


test('fallthrough test', function(t){
  t.plan(8)

  // handle nothing
  var providerA = injectMetrics(new PassthroughProvider())
  // handle "test_rpc"
  var providerB = injectMetrics(new FixtureProvider({
    test_rpc: true,
  }))
  // handle block requests
  var providerC = injectMetrics(new TestBlockProvider())

  const demoSignConfig = {
    transport: new FakeHttpProvider(), // new HttpTransport(),
    providers: [
      providerA,
      providerB,
      providerC,
    ],
  }

  const mewcore = MewCore.init(demoSignConfig)
  var engine = mewcore.mewEngine;

  engine.start()
  engine.sendAsync(createPayload({ method: 'test_rpc' }), function(err, response){
    t.ifError(err, 'did not error')
    t.ok(response, 'has response')

    t.equal(providerA.getWitnessed('test_rpc').length, 1, 'providerA did see "test_rpc"')
    t.equal(providerA.getHandled('test_rpc').length, 0, 'providerA did NOT handle "test_rpc"')

    t.equal(providerB.getWitnessed('test_rpc').length, 1, 'providerB did see "test_rpc"')
    t.equal(providerB.getHandled('test_rpc').length, 1, 'providerB did handle "test_rpc"')

    t.equal(providerC.getWitnessed('test_rpc').length, 0, 'providerC did NOT see "test_rpc"')
    t.equal(providerC.getHandled('test_rpc').length, 0, 'providerC did NOT handle "test_rpc"')

    engine.stop()
    t.end()
  })

})