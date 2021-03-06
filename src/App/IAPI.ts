import { User, Task, TodoList } from "../Models";
import { Dictionary } from "../Utils";

interface IAPI {
  //#region Auth
  user: User
  access_token: string
  continuePreviousSession: () => Promise<void>
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  registerUser: (username: string, password: string, email: string) => Promise<void>
  confirmUser: (username: string, confirmation_code: string) => Promise<void>
  resendConfirmationCode: (username: string) => Promise<void>
  //#endregion

  //#region Storage
  getCachedUser: (id: string) => Promise<User>
  getUsers: (ids: string[]) => Promise<User[]>
  editUser: (id: string, user: Partial<User>) => Promise<void>
  getContacts: () => Promise<User[]>
  getMembersFromList: (list_id: string) => Promise<User[]>
  getCachedListsFrom: (user: User) => Promise<Dictionary<TodoList>>
  getLists: () => Promise<Dictionary<TodoList>>
  createTodoList: (properties: {
    title: string,
    description: string,
    id: string,
  }) => Promise<TodoList>
  editTodoList: (id: string, changes: Partial<TodoList>) => Promise<void>
  deleteTodoList: (id: string) => Promise<void>
  createTask: (list: TodoList, properties: {
    title: string,
    description?: string,
    id: string,
  }) => Promise<Task>

  addUserToList: (user_id: string, list: TodoList) => Promise<void>
  addContact: (contact_id: string, user_id: string) => Promise<void>
  removeContact: (contact_id: string) => Promise<void>

  updateTaskStatus: (task: Task, status: 'Claimed'|'Done') => Promise<Task>

  uploadProfilePicture: (uri: string) => Promise<void>
  //#endregion
}

export default IAPI