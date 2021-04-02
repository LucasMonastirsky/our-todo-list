import { Task } from "."

class TodoList {
  title: string
  description: string
  id: string
  tasks: Task[]

  constructor(properties: {
    title?: string,
    description?: string,
    id: string,
    tasks?: Task[]
  }){
    this.title = properties.title ?? 'Untitled List'
    this.description = properties.description ?? ''
    this.id = properties.id
    this.tasks = properties.tasks ?? []
  }
}

export default TodoList