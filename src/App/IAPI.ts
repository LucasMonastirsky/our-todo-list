import { User, Task, TodoList } from "../Models";

interface IAPI {
  //#region Auth
  user: User
  continuePreviousSession: () => Promise<void>
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  registerUser: (username: string, password: string, email: string) => Promise<void>
  confirmUser: (username: string, confirmation_code: string) => Promise<void>
  resendConfirmationCode: (username: string) => Promise<void>
  //#endregion

  //#region Storage
  getCachedUser: (id: string) => Promise<User>
  getUser: (id: string) => Promise<User>
  editUser: (id: string, user: Partial<User>) => Promise<void>
  getListsFrom: (user: User) => Promise<TodoList[]>
  createTodoList: (properties: {
    title: string,
    description: string,
    owner_id: string,
  }) => Promise<TodoList>
  editTodoList: (id: string, changes: Partial<TodoList>) => Promise<void>
  deleteTodoList: (id: string) => Promise<void>
  createTask: (list: TodoList, properties: {
    title: string,
    description?: string,
  }) => Promise<Task>
  editTask: (task: Task) => Promise<void>
  //#endregion
}

export default IAPI