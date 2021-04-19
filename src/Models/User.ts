import { TodoList } from "."

type User = {
  name: string,
  id: string,

  getLists: () => Promise<TodoList[]>,
}

export default User