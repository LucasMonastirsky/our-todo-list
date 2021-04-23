import { Task } from '.'

type TodoList = {
  title: string
  description: string
  id: string
  tasks: Task[]
  member_ids: string[]
  owner_id: string,
}

export default TodoList