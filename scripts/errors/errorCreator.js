


function createError(location, message){
  throw `${location} Error: ${message}`
}

module.exports = createError;