import { TodoList, Task, TASK_STATUS } from "../Models"
import User from "../Models/User"

export default class API {
  //#region Mock Storage
  private static users: {[index: string]: User} = {
    '0': {
      username: 'JohnDoe1337',
      id: '0',
      getLists: async () => API.lists['0'] ?? []
    },
  }

  private static user_passwords: {[index: string]: string} = {
    '0': 'password123',
  }

  private static lists: { [index: string]: TodoList[] } = {
    '0': [{
        title: 'Household Tasks',
        description: 'Everything we need to do around the house!',
        id: '0',
        member_ids: ['0', '1'],
        owner_id: '0',
        tasks: [
          new Task({title: 'Wash Dishes', creator_id: 'Laura', id: '0', position: 0}),
          new Task({title: 'Buy Tofu', creator_id: 'Josh', id: '1', position: 1, description: `The normal kind, not the flavoured kind, it's more expensive!`}),
          new Task({title: 'Fill Hole in the Wall', creator_id: 'Laura', id: '2', position: 2}),
          new Task({title: 'Take Dog for a Walk', creator_id: 'Laura', id: '3', position: 3}),
          new Task({title: 'Develop App', creator_id: 'Josh', id: '4', position: 4, description: `Yes, this one.`}),
          new Task({title: 'I Ran out of Ideas', creator_id: 'Laura', id: '5', position: 5}),
        ]
      },{
        title: 'Project Car',
        description: 'An absolute money it',
        id: '1',
        member_ids: ['0', '2'],
        owner_id: '0',
        tasks: [
          new Task({title: 'Buy new jack', creator_id: 'Laura', id: '6', position: 0}),
          new Task({title: 'Fabricate brake adaptor plate', creator_id: 'Josh', id: '7', position: 1}),
          new Task({title: 'Buy disc brakes', creator_id: 'Laura', id: '8', position: 2}),
          new Task({title: 'Buy fuel tank', creator_id: 'Laura', id: '9', position: 3}),
          new Task({title: 'Build control box', creator_id: 'Josh', id: '10', position: 4}),
          new Task({title: 'Replace alternator', creator_id: 'Laura', id: '11', position: 5}),
        ]
      }
    ]
  }
  //#endregion

  private static _user?: User
  static get user() { return API._user! }

  static logged_out = false

  static continuePreviousSession = async () => {
    if (!API.logged_out)
      API._user = API.users['0']
    else throw 'No user session found'
  }

  static signIn = async (username: string, password: string) => {
    try {
      let found_user = false
      Object.values(API.users).forEach(user => {
        if (user.username === username) {
          found_user = true
          if (API.user_passwords[user.id] !== password)
            throw `Incorrect password`
          else API._user = user
        }
      })

      if (!found_user)
        throw `Username doesn't exist`

      API.logged_out = false
    }
    catch (error) {
      console.log('Error while signing in: ', error)
      throw error.message ?? 'Unknown error'
    }
  }

  static signOut = async () => {
    try {
      API._user = undefined
      API.logged_out = true
    }
    catch (error) {
      console.log('Error while signing out: ', error)
      throw error.message ?? 'Unknown error'
    }
  }

  private static pending_registration_user?: User & { confirmation_code: string, password: string }
  static registerUser = async (username: string, password: string, email: string) => {
    try {
      const confirmation_code = `${~~(Math.random() * 1000000)}`
      console.log('Confirmation code: ', confirmation_code)

      const users = Object.keys(API.users)
      const id = users[users.length - 1] + 1

      API.pending_registration_user = {
        username,
        id,
        getLists: async () => API.lists[id],
        confirmation_code,
        password,
      }
    }
    catch (error) {
      console.error('Error while registering user: ', error)
      throw {message: error.message ?? 'Unknown error'}
    }
  }

  static confirmUser = async (username: string, confirmation_code: string) => {
    try {
      if (!API.pending_registration_user)
        throw 'No user pending registration in API'
      if (API.pending_registration_user.username !== username)
        throw 'User pending registration differs from requested user'
      if (API.pending_registration_user.confirmation_code !== confirmation_code)
        throw 'Incorrect confirmation code'

      API.users[API.pending_registration_user.id] = API.pending_registration_user
      API.user_passwords[API.pending_registration_user.id] = API.pending_registration_user.password
      API.lists[API.pending_registration_user.id] = [{
        title: 'Placeholder List',
        description: 'placeholder',
        id: `${Math.random()*10}`,
        member_ids: [API.pending_registration_user.id],
        owner_id: API.pending_registration_user.id,
        tasks: []
      }]
    }
    catch (error) {
      console.error('Error while confirming new user: ', error)
      throw error.message ?? 'Unknown error'
    }
  }

  static resendConfirmationCode = async (username: string) => {
    try {
      if (!API.pending_registration_user)
        throw 'No user is pending confirmation'

      const confirmation_code = `${~~(Math.random() * 1000000)}`
      console.log('Confirmation code: ', confirmation_code)
      API.pending_registration_user.confirmation_code = confirmation_code
    }
    catch (error) {
      console.error('Error while resending confirmation code: ', error)
      throw error.message ?? 'Unknown error'
    }
  }

  //#region Storage
  static getListsFrom = async (user: User) => {
    return API.lists[user.id]
  }

  static createTodoList = async (properties: {
    title: string,
    description: string,
    owner_id: string,
  }) => {
    const list: TodoList = {
      title: properties.title,
      description: properties.description,
      owner_id: properties.owner_id,
      id: `${API.lists[properties.owner_id].length}`,
      tasks: [],
      member_ids: [properties.owner_id],
    }
    API.lists[properties.owner_id].push(list)
    return list
  }

  static createTask = async (list: TodoList, properties: {
    title: string,
    description?: string,
  }) => {
    const task: Task = {
      title: properties.title,
      description: properties.description ?? '',
      status: TASK_STATUS.PENDING,
      id: `${list.tasks.length}`,
      creator_id: API.user.id,
      creation_date: Date.now(),
      position: list.tasks.length,
    }
    API.lists[list.owner_id].find(x => x.id === list.id)?.tasks.push(task)
    return task
  }
  //#endregion
}