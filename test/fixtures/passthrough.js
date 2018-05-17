const FixtureProvider = require('./fixtureProvider')
//
// handles no methods, skips all requests
// mostly useless
//

class PassthroughProvider extends FixtureProvider {
  constructor () {
    super({})// .call(this, {})
    // super
  }
}

module.exports = PassthroughProvider
