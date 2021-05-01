export default function (arr: {id: string}[], id: string) {
  let index = -1
  arr.some((x, i) => {
    if (x.id === id) {
      index = i
      return true
    }
  })
  return index
}