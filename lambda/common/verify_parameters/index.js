function verify_parameters (event, required_parameters) {
  let missing_keys = []
  let unwanted_keys = []

  required_parameters.push('jwt')
  required_parameters.forEach(key => {
    if (event[key] === undefined) missing_keys.push(key)
    if (!required_parameters.includes(key)) unwanted_keys.push(key)
  })

  return {
    missing_keys: missing_keys.length > 0 ? missing_keys : undefined,
    unwanted_keys: unwanted_keys.length > 0 ? unwanted_keys : undefined
  }
}

module.exports = verify_parameters