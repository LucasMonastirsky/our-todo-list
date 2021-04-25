import { User, Task, TodoList } from "../Models";

interface IAPI {
  user: User
  continuePreviousSession: () => Promise<void>
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  registerUser: (username: string, password: string, email: string) => Promise<void>
  confirmUser: (username: string, confirmation_code: string) => Promise<void>
  resendConfirmationCode: (username: string) => Promise<void>
  getListsFrom: (user: User) => Promise<TodoList[]>
  createTodoList: (properties: {
    title: string,
    description: string,
    owner_id: string,
  }) => Promise<TodoList>
  createTask: (list: TodoList, properties: {
    title: string,
    description?: string,
  }) => Promise<Task>
  editTask: (task: Task) => Promise<void>
}

export default IAPI