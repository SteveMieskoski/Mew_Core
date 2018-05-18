const createError = require('./errorCreator')


// got lazy
function simpleError(location){
  if(location){
    throw `${location} Error`
  } else {
    throw "simple Error"
  }
}

module.exports = {
  createError,
  simpleError
}