const test = require('tape')
const MewEngine = require('../provider/mewEngine')
const common = require('../../scripts/common')

function singleRpcTest ({ testLabel, payload, expectedResult, provider }) {
  test(testLabel, function (t) {
    t.plan(3)

    const engine = new MewEngine();
    engine.addProvider(provider)
    // engine.start()
    engine.sendAsync(common.createPayload(payload), function (err, response) {
      if (err) {
        console.log('bad payload:', payload)
        console.error(err)
      }
      t.ifError(err)
      t.ok(response, 'has response')

      t.equal(response.result, expectedResult, 'rpc result is as expected')

      // engine.stop()
      t.end()
    })
  })
}


async function runTests(TestArray){
  for(let i=0; i<TestArray.length; i++){
    await singleRpcTest(TestArray[i])
  }
}



module.exports = runTests