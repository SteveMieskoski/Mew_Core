const uts46 = require('./commonRequires').uts46

module.exports = {
  normalise
}

function normalise(name) {
  try {
    return uts46.toUnicode(name, {
      useStd3ASCII: true,
      transitional: false
    });
  } catch (e) {
    throw e;
  }
};