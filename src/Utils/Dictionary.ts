export default class Dictionary<T> {
  constructor(initial_values: { [id: string]: T }) {
    this.map = initial_values
  }

  map: { [id: string]: T }

  get (id: string): T {
    return this.map[id]
  }

  set (id: string, value: T): void {
    this.map[id] = value
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

// export const createDict = (obj: )