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

  public get values(): T[] {
    return Object.values(this.map)
  }
  
  public get keys(): string[] {
    return Object.keys(this.map)
  }
}

// export const createDict = (obj: )