const IGNORE_OUTSIDE_LOGS = true

const log = console.log
if (IGNORE_OUTSIDE_LOGS) console.log = () => {}

const warn = console.warn
if (IGNORE_OUTSIDE_LOGS) console.warn = () => {}

const error = console.error
if (IGNORE_OUTSIDE_LOGS) console.error = () => {}

export default class DEBUG {
  static log = log
  static warn = warn
  static error = error
}