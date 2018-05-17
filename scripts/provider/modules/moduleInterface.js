
const common = require('../../common/index')

class ModuleInterface {
  setEngine (engine) {
    this.engine = engine
  }

  handleRequest (payload, next, end) {
    throw new Error('Subproviders should override `handleRequest`.')
  }

  emitPayload (payload, cb) {
    this.engine.sendAsync(common.createPayload(payload), cb)
  }

  emitIntermediate(payload, cb){
    if(Array.isArray(payload)){
      this.emitPayload(payload, cb)
    } else if(payload.type === "batch") {
      delete payload.type
      let allRequests = []
      let resultReturn = {}
      let resultTracker = new Map()
      let keys = Object.keys(payload)
      for(let i=0; i< keys.length; i++){
        allRequests.push(this.collectAndReturnIntermediate(payload[keys[i]]));
        resultTracker.set(keys[i], i)
      }
      Promise.all(allRequests)
        .then(_allResults => {
        for(let entry of resultTracker){
          resultReturn[entry[0]] = _allResults[entry[1]]
        }
          cb(null, resultReturn)
        })
        .catch(error => console.error(error))
    } else {
      this.emitPayload(payload, cb)
    }
  }


  collectAndReturnIntermediate(payload){
    return new Promise((resolve, reject) => {
      this.emitPayload(payload, function(error, _result) {
        if(error){
          reject(error)
        }
        else {
          // console.log("---collectAndReturnIntermediate", _result); // todo remove dev item
          resolve(_result.result)
        }
      })
    })
  }

}

module.exports = ModuleInterface
