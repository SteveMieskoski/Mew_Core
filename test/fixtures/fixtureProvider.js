const Subprovider = require('../../scripts/provider/modules/moduleInterface')

class FixtureProvider extends Subprovider {
  constructor (staticResponses) {
    super()
    staticResponses = staticResponses || {}
    this.staticResponses = staticResponses
  }

  handleRequest (payload, next, end) {
    var staticResponse = this.staticResponses[payload.method]
    // async function
    if (typeof staticResponse === 'function') {
      staticResponse(payload, next, end)
      // static response - null is valid response
    } else if (staticResponse !== undefined) {
      // return result asynchronously
      setTimeout(() => end(null, staticResponse))
      // no prepared response - skip
    } else {
      next()
    }
  }
}

module.exports = FixtureProvider
