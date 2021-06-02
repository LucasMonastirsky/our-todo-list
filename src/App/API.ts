import Auth from "@aws-amplify/auth"
import Amplify from 'aws-amplify'
import { Task, TodoList } from "../Models"
import User from "../Models/User"
import AWS from 'aws-sdk'
import { amplify_config, aws_sdk_config, secrets } from '../Secrets'
import { IAPI, Navigation } from '.'
import DEBUG from "../Utils/DEBUG"
import { RNS3 } from 'react-native-aws3'
import Notifications from "./Notifications"
import { Dictionary } from "../Utils"
import { AuthenticationLayout } from "../Layouts"

AWS.config.update(aws_sdk_config)
Amplify.configure(amplify_config)

const dynamo_client =  new AWS.DynamoDB.DocumentClient()
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

    DEBUG.log(`Updating notification token...`)
    await invokeLambda('update_user_notification_token', {
      notification_token: Notifications.token,
    }).catch(e => DEBUG.warn(`Error while updating notification:`, e.message))

    DEBUG.log(`Continuing session from user ${API.user.username}`)
  }

  static signIn = async (username: string, password: string) => {
    DEBUG.log(`Authenticating user ${username}...`)
    await Auth.signIn(username, password).catch(e => { DEBUG.error(e); throw e })

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

    users.forEach(user => API.cache.users[user.id] = user)

    DEBUG.log(`Found ${users.length} users`)
    
    return users
  }

  static editUser = async (id: string, user: Partial<User>) => {
    DEBUG.log(`Updating user ${id}...`)
    const update_query = buildUpdateQuery(user)

    const response = await (dynamo_client.update({
      TableName: 'Users',
      Key: { id },
      UpdateExpression: update_query.expression,
      ExpressionAttributeValues: update_query.values,
      ReturnValues: 'ALL_NEW'
    }).promise())

    DEBUG.log(`Updating user in cache...`)
    API.cache.users[id] = response.Attributes as User

    if (user.image) // hack to force react-native to fetch the new image
      API.cache.users[id].image += `?date=${Date.now()}` // this won't work with other users...

    DEBUG.log(`Updated user ${id}`)
  }

  static getContacts = async () => {
    DEBUG.log(`Fetching contacts...`)
    const contacts = await invokeLambda('get_contacts')

    DEBUG.log(`Found ${contacts.length} contacts`)
    return contacts
  }

  static getMembersFromList = async (list_id: string) => {
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

  static getListsFrom = async (user: User) => {
    DEBUG.log(`Getting lists from user ${user.username}...`)

    if (user.list_ids.length < 1) {
      DEBUG.log('User has no lists')
      return new Dictionary<TodoList>({})
    }

    const query = await dynamo_client.batchGet({
      RequestItems: {
        Lists: {
          Keys: user.list_ids.map(id => ({ id }))
        }
      }
    }).promise()

    if (!query.Responses)
      throw new Error(`Error while getting lists from user ${user.username}: no responses`)

    const list_map: Dictionary<TodoList> = new Dictionary<TodoList>({})
    query.Responses.Lists.forEach(list => {
      list.member_ids = arrayFromSet(list.member_ids)
      list_map.set(list.id, list as TodoList)
      API.cache.lists[list.id] = list as TodoList
    })
    DEBUG.log(`Got ${list_map.values.length} lists from user ${user.username}`)

    return list_map
  }

  static createTodoList = async (properties: {
    title: string,
    description: string,
    id: string,
  }) => {
    DEBUG.log(`Creating list ${properties.title}...`)
    const list = await invokeLambda('create_todo_list', {
      ...properties,
      user_id: API.user.id,
    }) as TodoList

    DEBUG.log(`Updating cache...`)
    API.cache.users[API.user.id].list_ids.push(list.id)
    API.cache.lists[list.id] = list

    DEBUG.log(`Successfully created list ${list.title}`)
    return list
  }

  static editTodoList = async (id: string, new_list: Partial<TodoList>) => {
    DEBUG.log(`Editting list ${id}...`)
    const update_query = buildUpdateQuery(new_list)

    const response = await dynamo_client.update({
      TableName: 'Lists',
      Key: { id },
      UpdateExpression: update_query.expression,
      ExpressionAttributeValues: update_query.values,
      ReturnValues: 'UPDATED_NEW',
    }).promise()

    API.cache.lists[id] = {...API.cache.lists[id], ...response.Attributes}

    DEBUG.log(`Updated list ${id} with values`, response.Attributes )
  }

  static deleteTodoList = async (id: string) => {
    DEBUG.log(`Deleting list ${id}...`)
    
    await invokeLambda('delete_todo_list', {
      list_id: id,
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
      user_id: API.user.id,
    })

    DEBUG.log(`Created task ${properties.title}, storing in cache...`)

    API.cache.lists[list.id].tasks[task.id] = task

    return task
  }

  static editTask = async (task: Task) => {
    DEBUG.log(`Editting task '${task.title}'...`)
    const response = await dynamo_client.update({
      TableName: 'Lists',
      Key: { id: task.list_id },
      UpdateExpression: 'SET #tasks.#id = :updated_task',
      ExpressionAttributeNames: {
        '#tasks': 'tasks',
        '#id': task.id,
      },
      ExpressionAttributeValues: {
        ':updated_task': task,
      },
      ReturnValues: DEBUG.enabled ? 'UPDATED_OLD' : 'NONE'
    }).promise()

    API.cache.lists[task.list_id].tasks[task.id] = task

    if (DEBUG.enabled && response) {
      const old_task = response.Attributes!.tasks[task.id]
      const updated_values: { [key: string]: any } = {}
      Object.keys(task).forEach(key => {
        if (task[key as keyof Task] !== old_task[key as keyof Task])
          updated_values[key] = task[key as keyof Task]
      })
      DEBUG.log(`Updated task ${task.title} with values`, updated_values)
    }
    else DEBUG.log(`Updated task ${task.title}`)
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

    DEBUG.log(`Updated user ${user_id}`)
  }

  static removeUserFromList = async (user_id: string, list: TodoList) => {
    DEBUG.log(`Removing user ${user_id} from list ${list.title}...`)

    if (!list.member_ids.includes(user_id))
      throw new Error(`User ${user_id} is not a member of list ${list.title}`)

    const result = await dynamo_client.update({
      TableName: 'Lists',
      Key: { id: list.id },
      UpdateExpression: 'DELETE member_ids :user_id',
      ExpressionAttributeValues: { ':user_id': arrayToSet([user_id]) },
      ReturnValues: DEBUG.enabled ? 'UPDATED_NEW' : 'NONE',
    }).promise()

    DEBUG.log(`Updating cache...`)
    const index = API.cache.lists[list.id].member_ids.indexOf(user_id)
    API.cache.lists[list.id].member_ids.splice(index, 1)

    DEBUG.log(`Removed user ${user_id} from list ${list.title}`)
  }

  static addContact = async (contact_id: string, user_id: string) => {
    DEBUG.log(`Adding user ${contact_id} to contacts of ${user_id}`)

    if (contact_id === user_id)
      throw new Error(`Users can't add themselves (user id: ${user_id})`)
    if ((await API.getCachedUser(user_id)).contact_ids.includes(contact_id))
      throw new Error(`User ${user_id} has already added user ${contact_id}`)
    if (!(await API.getCachedUser(contact_id)))
      throw new Error(`User ${contact_id} doesn't exist`)

    const result = await dynamo_client.update({
      TableName: 'Users',
      Key: { id: user_id } ,
      UpdateExpression: 'ADD contact_ids :contact_id',
      ExpressionAttributeValues: { ':contact_id': arrayToSet([contact_id]) },
      ReturnValues: DEBUG.enabled ? 'UPDATED_NEW' : 'NONE',
    }).promise()

    API.cache.users[user_id].contact_ids.push(contact_id)

    DEBUG.log(`Added user ${contact_id} to contacts of ${user_id}`)
  }

  static removeContact = async (contact_id: string, user_id: string) => {
    DEBUG.log(`Removing user ${contact_id} from contacts of ${user_id}`)
    const result = await dynamo_client.update({
      TableName: 'Users',
      Key: { id: user_id },
      UpdateExpression: 'DELETE contact_ids :contact_id',
      ExpressionAttributeValues: { ':contact_id': arrayToSet([contact_id]) },
      ReturnValues: DEBUG.enabled ? 'UPDATED_NEW' : 'NONE',
    }).promise()

    DEBUG.log(`Updating cache...`)
    const index = API.cache.users[user_id].contact_ids.indexOf(contact_id)
    API.cache.users[user_id].contact_ids.splice(index, 1)

    DEBUG.log(`Removed user ${contact_id} from contacts of ${user_id}`)
  }

  static uploadProfilePicture = async (uri: string) => {
    DEBUG.log(`Uploading new image...`)
    const response = await RNS3.put({
      name: API.user.id,
      uri,
      type: 'image/jpeg',
    }, {
      bucket: 'our-todo-profile-pictures',
      region: secrets.region,
      accessKey: secrets.access_key,
      secretKey: secrets.secret_key,
      successActionStatus: 201,
    })
    if (response.status !== 201) {
      throw new Error(`S3 upload returned error: ${response.text}`)
    }
    DEBUG.log(`Uploaded new profile picture for user ${API.user.username} with uri: ${response.headers.Location}`)
    return response.headers.Location
  }

  static updateTaskStatus = async (task: Task, status: 'Claimed'|'Done') => {
    DEBUG.log(`Updating status of task '${task.title}'`)
    
    const updated_task = await invokeLambda('update_task_status', {
      user_id: API.user.id,
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

function buildUpdateQuery (changes: any) {
  let expression = 'SET '
  let values: { [key: string]: any } = {}
  Object.keys(changes).forEach((key, index) => {
    if (index > 0)
      expression += ', '
    expression += `${key} = :${index}`
    values[`:${index}`] = changes[key as keyof User]
  })
  return { expression, values }
}

function arrayToSet<Type> (arr: Type[]) { // @ts-ignore
  return dynamo_client.createSet(arr)
}

function arrayFromSet (set: any) {
  return set ? [...JSON.parse(JSON.stringify(set))].filter(x => x !== '') : []
}
//#endregion

export default API
