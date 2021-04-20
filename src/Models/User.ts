import { TodoList } from "."

type User = {
  username: string,
  id: string,

  getLists: () => Promise<TodoList[]>,
}

export default User