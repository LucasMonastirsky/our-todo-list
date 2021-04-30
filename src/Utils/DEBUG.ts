const IGNORE_OUTSIDE_LOGS = false

const log = console.log
if (IGNORE_OUTSIDE_LOGS) console.log = () => {}
else console.log = (...args: any[]) => {
  if (ignored_messages.some(msg => `${args[0]}`.startsWith(msg)))
    return
  else log(...args)
}

const warn = console.warn
if (IGNORE_OUTSIDE_LOGS) console.warn = () => {}
else console.warn = (...args: any[]) => {
  if (ignored_messages.some(msg => `${args[0]}`.startsWith(msg)))
    return
  else warn(...args)
}

const error = console.error
if (IGNORE_OUTSIDE_LOGS) console.error = () => {}
else console.error = (...args: any[]) => {
  if (ignored_messages.some(msg => `${args[0]}`.startsWith(msg)))
    return
  else error(...args)
}

export default class DEBUG {
  static log = log
  static warn = warn
  static error = error

  static enabled: boolean = true
}

const ignored_messages = [
  'Warning: componentWillReceiveProps has been renamed, and is not recommended for use.',
  'Warning: componentWillMount has been renamed, and is not recommended for use.',
  'AsyncStorage has been extracted from react-native core and will be removed in a future release.'
]