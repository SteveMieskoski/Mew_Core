const u2f = require('./u2f-api')

const isNode = typeof window === 'undefined'

if (!isNode && window.u2f === undefined) {
  window.u2f = u2f
}

/**
 * Checks if the browser supports u2f.
 * Currently there is no good way to do feature-detection,
 * so we call getApiVersion and wait for 100ms
 */

function isSupported () {
  return new Promise(resolve => {
    if (isNode) {
      resolve(true)
    }
    if (window.u2f && !window.u2f.getApiVersion) {
      // u2f object is found (Firefox with extension)
      resolve(true)
    } else {
      // u2f object was not found. Using Google polyfill
      const intervalId = setTimeout(() => {
        resolve(false)
      }, 3000)
      u2f.getApiVersion(() => {
        clearTimeout(intervalId)
        resolve(true)
      })
    }
  })
}

module.exports = {
  isSupported,
  isNode
}
