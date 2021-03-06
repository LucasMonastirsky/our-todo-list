import Auth from "@aws-amplify/auth"
import Amplify from 'aws-amplify'
import { Task, TodoList } from "../Models"
import User from "../Models/User"
import AWS from 'aws-sdk'
import { amplify_config, aws_sdk_config } from '../Secrets'
import { IAPI, Navigation } from '.'
import DEBUG from "../Utils/DEBUG"
import Notifications from "./Notifications"
import { Dictionary } from "../Utils"
import { AuthenticationLayout } from "../Layouts"
import FS from 'react-native-fs'

AWS.config.update(aws_sdk_config)
Amplify.configure(amplify_config)
Auth.configure({ authenticationFlowType: 'USER_PASSWORD_AUTH' })

const lambda_client = new AWS.Lambda()

let API: IAPI
API = class API {

  //#region Auth
  private static current_user_id?: string
  static get user() { return API.cache.users[API.current_user_id!] }
  private static _access_token?: string
  static get access_token() { return API._access_token! }

  static continuePreviousSession = async () => {
    DEBUG.log(`Continuing previous session...`)
    const cognito_user = await Auth.currentAuthenticatedUser()
    API._access_token = cognito_user.signInUserSession.accessToken.jwtToken
  
    DEBUG.log(`Getting user from storage...`)
    const user = await invokeLambda('get_own_user')
    API.current_user_id = user.id
    API.cache.users[user.id] = user
    API.cache.users[user.id].image += `?query=${Date.now()}` // this avoids RN's cache

    DEBUG.log(`Updating notification token...`)
    await invokeLambda('update_user_notification_token', {
      notification_token: Notifications.token,
    }).catch(e => DEBUG.warn(`Error while updating notification:`, e.message))

    DEBUG.log(`Continuing session from user ${API.user.username}`)
  }

  static signIn = async (username: string, password: string) => {
    DEBUG.log(`Authenticating user ${username}...`)
    await Auth.signIn(username, password)

    DEBUG.log(`Authenticated user ${username}, getting user data...`)
    const cognito_user = await Auth.currentAuthenticatedUser()
    API._access_token = cognito_user.signInUserSession.accessToken.jwtToken

    DEBUG.log(`Updating notification token...`)
    await invokeLambda('update_user_notification_token', {
      notification_token: Notifications.token,
    }).catch(e => DEBUG.warn(`Error while updating notification:`, e.message))

    DEBUG.log(`Getting user from storage...`)

    let user: User

    try {
      user = await invokeLambda('get_own_user')
      DEBUG.log(`user:`, user)
    } catch (e) {
      if (e.message === `User does not exist`) {
        DEBUG.log(`User not found in storage, creating user ${username}...`)

        user = await invokeLambda('create_user', {
          username,
          notification_token: Notifications.token,
        })

        DEBUG.log(`Created user ${user.username} with id ${user.id}`)
      }
      else throw e
    }

    API.current_user_id = user.id
    API.cache.users[user.id] = user
    API.cache.users[user.id].image += `?query=${Date.now()}`

    DEBUG.log(`Signed in user ${API.user.username}`)
  }

  static signOut = async () => {
    DEBUG.log(`Signing out user ${API.user.username}...`)
    await Auth.signOut()
    API.current_user_id = undefined
    API._access_token = undefined
    DEBUG.log(`Signed out successfully`)
    Navigation.goTo(AuthenticationLayout)
  }

  static registerUser = async (username: string, password: string, email: string) => {
    try {
      const result = await Auth.signUp({username, password, attributes: { email }})
    }
    catch (error) {
      DEBUG.error(`Error while registering user ${username}`)
      throw {message: error.message ?? 'Unknown error'}
    }
  }

  static confirmUser = async (username: string, confirmation_code: string) => {
    DEBUG.log(`Confirming user ${username}...`)
    await Auth.confirmSignUp(username, confirmation_code)
    DEBUG.log(`Confirmed user successfully`)
  }

  static resendConfirmationCode = async (username: string) => {
    DEBUG.log(`Resending confirmation code for user ${username}...`)
    await Auth.resendSignUp(username)
    DEBUG.log(`Confirmation code resent`)
  }
  //#endregion

  //#region Cache
  private static cache: {
    users: { [id: string]: User },
    lists: { [id: string]: TodoList },
  } = {
    users: {},
    lists: {},
  }
  //#endregion

  //#region Storage
  static getCachedUser = async (id: string) => {
    if (API.cache.users[id] === undefined) {
      DEBUG.log(`Didn't find user in cache, getting from storage...`)
      await API.getUsers([id])
    }

    return API.cache.users[id]

    /*
    If multiple calls are made for the same user that is not cached,
    then the user will be fetched from the DB multiple times.
    TODO: Implement fetch flags to wait for first fetch
    */
  }

  static getUsers = async (ids: string[]) => {
    DEBUG.log(`Getting user data from ids ${ids}...`)

    const users: User[] = await invokeLambda('get_users', { ids })

    if (users.length !== ids.length)
      DEBUG.warn(`Could not find users with ids`,
        users.filter(user => !ids.includes(user.id)).map(user => user.id))

    users.forEach(user => {
      if (user.contact_ids === undefined)
        user.contact_ids = []
      API.cache.users[user.id] = user
    })

    DEBUG.log(`Found ${users.length} users`)
    
    return users
  }

  static editUser = async (id: string, changes: Partial<User>) => {
    DEBUG.log(`Updating user ${id}...`)

    const response: User = await invokeLambda('edit_user', { changes })

    DEBUG.log(`Updating user in cache...`)
    API.cache.users[id] = response

    if (changes.image) // hack to force react-native to fetch the new image
      API.cache.users[id].image += `?query=${Date.now()}` // this won't work with other users...

    DEBUG.log(`Updated user ${id}`)
  }

  static getContacts = async () => {
    DEBUG.log(`Fetching contacts...`)
    const contacts: User[] = await invokeLambda('get_contacts')

    DEBUG.log(`Found ${contacts.length} contacts`)

    contacts.forEach(user => API.cache.users[user.id] = user)

    return contacts
  }

  static getMembersFromList = async (list_id: string) => {
    DEBUG.log(`Trying to get list members from cache...`)
    const users: User[] = []
    API.cache.lists[list_id].member_ids.some(id => {
      if (API.cache.users[id] !== undefined)
        users.push(API.cache.users[id])
      else return true
    })

    if (users.length === API.cache.lists[list_id].member_ids.length) {
      DEBUG.log(`Found all ${users.length} members in cache`)
      return users
    }

    DEBUG.log(`Fetching members from list ${list_id}...`)
    const members: User[] = await invokeLambda('get_list_members', { list_id })

    DEBUG.log(`Found ${members.length} members`)
    members.forEach(user => API.cache.users[user.id] = user)

    return members
  }

  static getCachedListsFrom = async (user: User) => {
    DEBUG.log(`Getting cached lists from user ${user.username}...`)

    const lists = new Dictionary<TodoList>()
    user.list_ids.forEach(id => {
      if (API.cache.lists[id])
        lists.set(id, API.cache.lists[id])
    })

    DEBUG.log(`Found ${lists.values.length}/${user.list_ids.length} lists in cache from user ${user.username}`)

    return lists
  }

  static getLists = async () => {
    DEBUG.log(`Getting lists...`)

    const response: { lists: TodoList[], users: User[] } = await invokeLambda('get_own_lists')

    const lists: Dictionary<TodoList> = new Dictionary<TodoList>()
    response.lists.forEach(list => {
      lists.set(list.id, list)
      API.cache.lists[list.id] = list
    })

    response.users.forEach(user => API.cache.users[user.id] = user)

    DEBUG.log(`Got ${lists.keys.length} lists from user ${API.user.username} and cached ${response.users.length} users`)

    return lists
  }

  static createTodoList = async (properties: {
    title: string,
    description: string,
    id: string,
  }) => {
    DEBUG.log(`Creating list ${properties.title}...`)
    const list: TodoList = await invokeLambda('create_todo_list', properties)

    DEBUG.log(`Updating cache...`)
    API.cache.users[API.user.id].list_ids.push(list.id)
    API.cache.lists[list.id] = list

    DEBUG.log(`Successfully created list ${list.title}`)
    return list
  }

  static editTodoList = async (list_id: string, changes: Partial<TodoList>) => {
    DEBUG.log(`Editting list ${list_id}...`)

    const list = await invokeLambda('edit_list', { list_id, changes })

    API.cache.lists[list_id] = list

    DEBUG.log(`Updated list ${list_id}` )
  }

  static deleteTodoList = async (id: string) => {
    DEBUG.log(`Deleting list ${id}...`)
    
    await invokeLambda('delete_todo_list', { list_id: id })

    API.cache.lists[id].member_ids.forEach(member_id => {
      const index = API.cache.users[member_id].list_ids.indexOf(id)
      API.cache.users[member_id].list_ids.splice(index, 1)
    })
    delete API.cache.lists[id]

    DEBUG.log(`Deleted list ${id}`)
  }

  static createTask = async (list: TodoList, properties: {
    title: string,
    description?: string,
    id: string,
  }) => {
    DEBUG.log(`Creating task ${properties.title}...`)

    const task = await invokeLambda('create_task', {
      ...properties,
      list_id: list.id,
    })

    DEBUG.log(`Created task ${properties.title}, storing in cache...`)

    API.cache.lists[list.id].tasks[task.id] = task

    return task
  }

  static addUserToList = async (user_id: string, list: TodoList) => {
    DEBUG.log(`Adding user ${user_id} to list ${list.title}...`)
    if (list.member_ids.includes(user_id)) {
      const message = `List ${list.title} already includes user ${user_id}`
      DEBUG.error(message)
      throw new Error(message)
    }

    await invokeLambda('add_user_to_list', {
      user_id: API.user.id,
      invited_user_id: user_id,
      list_id: list.id,
    })
 
    API.cache.lists[list.id].member_ids.push(user_id)
    API.cache.users[user_id]?.list_ids.push(list.id)

    DEBUG.log(`Updated user ${user_id}`)
  }

  static addContact = async (contact_id: string, user_id: string) => {
    DEBUG.log(`Adding user ${contact_id} to contacts of ${user_id}`)

    await invokeLambda('add_contact', { contact_id })

    API.cache.users[user_id].contact_ids.push(contact_id)

    DEBUG.log(`Added user ${contact_id} to contacts of ${user_id}`)
  }

  static removeContact = async (contact_id: string) => {
    DEBUG.log(`Removing user ${contact_id} from contacts`)
    
    await invokeLambda('remove_contact', { contact_id })

    DEBUG.log(`Updating cache...`)

    const index = API.cache.users[API.user.id].contact_ids.indexOf(contact_id)
    API.cache.users[API.user.id].contact_ids.splice(index, 1)

    DEBUG.log(`Removed user ${contact_id} from contacts`)
  }

  static uploadProfilePicture = async (uri: string) => {
    DEBUG.log(`Converting local image to blob...`)
    const blob = await FS.readFile(uri, 'base64')

    DEBUG.log(`Sending image to lambda...`)
    await invokeLambda('upload_profile_picture', { blob })

    API.cache.users[API.user.id].image += `?query=${Date.now()}` // this avoids RN's cache

    DEBUG.log(`Uploaded new profile picture for user ${API.user.username}`)
  }

  static updateTaskStatus = async (task: Task, status: 'Claimed'|'Done') => {
    DEBUG.log(`Updating status of task '${task.title}'`)
    
    const updated_task = await invokeLambda('update_task_status', {
      task_id: task.id,
      list_id: task.list_id,
      status,
    })

    DEBUG.log(`Updating cache...`)
    API.cache.lists[task.list_id].tasks[task.id] = updated_task

    DEBUG.log(`Updated status of task '${task.title}' to ${status}`)

    return updated_task
  }
  //#endregion
}

//#region Utils
async function invokeLambda(function_name: string, params?: any) {
  const response = await lambda_client.invoke({
    FunctionName: function_name,
    Payload: JSON.stringify({...(params??{}), jwt: API.access_token})
  }).promise()

  const payload = JSON.parse(response.Payload as string)

  if (payload.statusCode !== 200) {
    if (payload.error)
      throw new Error(payload.error)
    else throw new Error(`Unfamiliar error in lambda ${function_name}, payload: ${JSON.stringify(payload)}`)
  }

  return payload.body
}
//#endregion

export default API
