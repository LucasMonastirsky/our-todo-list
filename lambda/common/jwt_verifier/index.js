const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem')

const keys = require('./jwk.json').keys.map(x => jwkToPem(x))

function verify (token) {
  let error

  for (const key of keys) {
    try {
      return { user_id: jwt.verify(token, key).sub }
    }
    catch (e) {
      error = e
    }
  }

  return { error }
}

module.exports = { verify }