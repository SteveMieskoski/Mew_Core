
function createRandomId () {
  // 13 time digits
  var datePart = new Date().getTime() * Math.pow(10, 3)
  // 3 random digits
  var extraPart = Math.floor(Math.random() * Math.pow(10, 3))
  // 16 digits
  return datePart + extraPart
}

class Subprovider {
  setEngine (engine) {
    this.engine = engine
    engine.on('block', function (block) {
      this.currentBlock = block
    })
  }

  handleRequest (payload, next, end) {
    throw new Error('Subproviders should override `handleRequest`.')
  }

  emitPayload (payload, cb) {
    this.engine.sendAsync(this.createPayload(payload), cb)
  }

  createPayload (data) {
    return Object.assign({
      // defaults
      id: createRandomId(),
      jsonrpc: '2.0',
      params: []
      // user-specified
    }, data)
  }
}

module.exports = Subprovider
