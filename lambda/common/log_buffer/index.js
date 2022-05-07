const withLogBuffer = (f) => async (...args) => {
  const history = []
  const logger = {
    log: (...args) => history.push({ type: 'LOG', content: args }),
    warn: (...args) => history.push({ type: 'WARN', content: args }),
    error: (...args) => history.push({ type: 'ERROR', content: args }),
  }

  try { return f(logger, ...args) }
  catch (e) { history.push({ type: 'error', content: e }) }
  finally { console.log(history.map(msg => msg.type + ': ' + msg.content)) }
}

module.exports = withLogBuffer