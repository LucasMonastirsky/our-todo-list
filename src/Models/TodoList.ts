import { Task } from "."

class TodoList {
  title: string
  description: string
  id: string
  tasks: Task[]
  member_ids: string[]

  constructor(properties: {
    title?: string,
    description?: string,
    id: string,
    tasks?: Task[]
    member_ids: string[],
  }){
    this.title = properties.title ?? 'Untitled List'
    this.description = properties.description ?? ''
    this.id = properties.id
    this.tasks = properties.tasks ?? []
    this.member_ids = properties.member_ids
  }
}

export default TodoList