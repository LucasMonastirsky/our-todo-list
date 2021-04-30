export default function (date: number) {
  const now = Date.now()
  const delta = now - date

  if (delta < minute)
    return `just now`
  if (delta < hour)
    return `${~~(delta / minute)} minutes ago`
  if (delta < day)
    return `${~~(delta / hour)} hours ago`
  return `${~~(delta / day)} days ago`
}

const minute = 60000
const hour = minute * 60
const day = hour * 24