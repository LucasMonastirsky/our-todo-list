export default function (date: number) {
  const now = Date.now()
  const delta = now - date

  let result = { interval: 0, name: '' }

  if (delta < minute)
    return `just now`
  else if (delta < hour)
    result = { interval: minute, name: 'minute' }
  else if (delta < day)
    result = { interval: hour, name: 'hour' }
  else result = { interval: day, name: 'day' }

  const time = ~~(delta / result.interval)
  return `${time} ${result.name}${time > 1 ? 's' : ''} ago`
}

const minute = 60000
const hour = minute * 60
const day = hour * 24