export default class Dictionary<T> {
  constructor(initial_values?: { [id: string]: T }) {
    this.map = initial_values ?? {}
  }

  map: { [id: string]: T }

  get (id: string): T {
    return this.map[id]
  }

  set (id: string, value: T): void {
    this.map[id] = value
  }

  delete (id: string): void {
    delete this.map[id]
  }

  get values(): T[] {
    return Object.values(this.map)
  }
  
  get keys(): string[] {
    return Object.keys(this.map)
  }

  clone (): Dictionary<T> {
    return new Dictionary<T>(this.map)
  }
}
