import Auth from "@aws-amplify/auth"
import Amplify from 'aws-amplify'
import { Task, TodoList } from "../Models"
import User from "../Models/User"
import AWS from 'aws-sdk'
import { amplify_config, aws_sdk_config } from '../Secrets'
import { default as react_native_uuid } from 'react-native-uuid'
import { IAPI } from '.'
import DEBUG from "../Utils/DEBUG"

AWS.config.update(aws_sdk_config)
Amplify.configure(amplify_config)

const uuid = () => `${react_native_uuid.v4()}`

let API: IAPI
API = class API {
  private static dynamo_client =  new AWS.DynamoDB.DocumentClient()

  //#region Auth
  private static _user?: User
  static get user() { return API._user! }

  static continuePreviousSession = async () => {
    const cognito_user = await Auth.currentAuthenticatedUser()
    DEBUG.log(`Found session from user '${cognito_user.username}'`)
    API._user = await API.getUser(cognito_user.attributes.sub)
  }

  static signIn = async (username: string, password: string) => {
    try {
      await Auth.signIn(username, password)
      API._user = await API.getUser((await Auth.currentAuthenticatedUser()).attributes.sub)
    }
    catch (error) {
      DEBUG.log('Error while signing in: ', error)
      throw error.message ?? 'Unknown error'
    }
  }

  static signOut = async () => {
    try {
      await Auth.signOut()
    }
    catch (error) {
      DEBUG.log('Error while signing out: ', error)
      throw error.message ?? 'Unknown error'
    }
  }

  private static pending_registration_user?: { username: string, id: string }
  static registerUser = async (username: string, password: string, email: string) => {
    try {
      const result = await Auth.signUp({username, password, attributes: { email }})
      API.pending_registration_user = {
        username: result.user.getUsername(),
        id: result.userSub,
      }
    }
    catch (error) {
      DEBUG.error('Error while registering user: ', error)
      throw {message: error.message ?? 'Unknown error'}
    }
  }

  static confirmUser = async (username: string, confirmation_code: string) => {
    try {
      DEBUG.log('signUp return: ', await Auth.confirmSignUp(username, confirmation_code))

      if (!API.pending_registration_user)
        throw 'No user pending registration in API'
      if (API.pending_registration_user.username !== username)
        throw 'User pending registration differs from requested user'

      DEBUG.log(`Adding user '${username}' to storage`)

      const result = await API.dynamo_client.put({
        TableName: 'Users',
        Item: {
          nickname: API.pending_registration_user.username,
          username: API.pending_registration_user.username,
          id: API.pending_registration_user.id,
          list_ids: [],
        }
      }).promise()
      DEBUG.log(`Created user ${API.pending_registration_user.username} : ${result.Attributes!.id}`)

      API.pending_registration_user = undefined
    }
    catch (error) {
      DEBUG.error('Error while confirming new user: ', error)
      throw error.message ?? 'Unknown error'
    }
  }

  static resendConfirmationCode = async (username: string) => {
    try {
      await Auth.resendSignUp(username)
    }
    catch (error) {
      DEBUG.error('Error while resending confirmation code: ', error)
      throw error.message ?? 'Unknown error'
    }
  }
  //#endregion

  //#region Cache
  private static cache: {
    users: { [id: string]: User }
  } = {
    users: {}
  }
  //#endregion

  //#region Storage
  static getCachedUser = async (id: string) => {
    if (API.cache.users[id] === undefined) {
      DEBUG.log(`Didn't find user in cache, getting from storage...`)
      API.cache.users[id] = await API.getUser(id)
    }
    DEBUG.log(`Found cached user '${API.cache.users[id].username}'`)
    return API.cache.users[id]
  }

  static getUser = async (id: string) => {
    DEBUG.log(`Getting user data from id: ${id}`)

    const user = (await API.dynamo_client.get({
      TableName: 'Users',
      Key: { id },
    }).promise()).Item as User
    if (user === undefined)
      throw `Could not find user with id ${id}`

    API.cache.users[user.id] = user

    DEBUG.log(`Found user data: `, user)
    return user
  }

  static editUser = async (id: string, user: Partial<User>) => {
    DEBUG.log(`Updating user ${id}`)
    const update_query = buildUpdateQuery(user)

    const response = await (API.dynamo_client.update({
      TableName: 'Users',
      Key: { id },
      UpdateExpression: update_query.expression,
      ExpressionAttributeValues: update_query.values,
      ReturnValues: DEBUG.enabled ? 'UPDATED_NEW' : 'NONE'
    }).promise())

    DEBUG.log(`Updated user ${id} with values:`, response.Attributes)
  }

  static getListsFrom = async (user: User) => {
    DEBUG.log(`Getting lists from user ${user.username}`)

    if (user.list_ids.length < 1) {
      DEBUG.log('User has no lists')
      return []
    }

    const query = await API.dynamo_client.batchGet({
      RequestItems: {
        Lists: {
          Keys: user.list_ids.map(id => ({ id }))
        }
      }
    }).promise()

    if (!query.Responses){
      DEBUG.error('No responses...')
      throw 'getListsFrom: no responses'
    }

    const result = query.Responses.Lists
    DEBUG.log(`Got ${result.length} lists from ${user.username}`)

    return result.map(item => ( // convert task map to list
      { ...item, tasks: Object.values(item.tasks), member_ids: arrayFromSet(item.member_ids) }
    )) as TodoList[]
  }

  static createTodoList = async (properties: {
    title: string,
    description: string,
    owner_id: string,
  }) => {
    const list: TodoList = {
      ...properties,
      member_ids: [properties.owner_id],
      tasks: [],
      id: uuid()
    }

    await API.dynamo_client.put({
      TableName: 'Lists',
      Item: {...list, tasks: {}, member_ids: arrayToSet(list.member_ids)},
    }, err => {
      if (err) { DEBUG.error(err); throw err }
    })

    await API.dynamo_client.update({
      TableName: 'Users',
      Key: { id: API.user.id },
      UpdateExpression: 'SET #list_ids = list_append(#list_ids, :new_list_id)',
      ExpressionAttributeNames: { '#list_ids': 'list_ids' },
      ExpressionAttributeValues: { ':new_list_id': [list.id] }
    }).promise()

    return list
  }

  static editTodoList = async (id: string, new_list: Partial<TodoList>) => {
    DEBUG.log(`Editting list ${id}`)
    const update_query = buildUpdateQuery(new_list)

    const response = await API.dynamo_client.update({
      TableName: 'Lists',
      Key: { id },
      UpdateExpression: update_query.expression,
      ExpressionAttributeValues: update_query.values,
      ReturnValues: DEBUG.enabled ? 'UPDATED_NEW' : 'NONE'
    }).promise()

    DEBUG.log(`Updated list ${id} with values`, response.Attributes )
  }

  static deleteTodoList = async (id: string) => {
    DEBUG.log(`Deleting list ${id}...`)
    await API.dynamo_client.delete({
      TableName: 'Lists',
      Key: { id }
    }).promise()
    DEBUG.log(`Deleted list ${id}`)
  }

  static createTask = async (list: TodoList, properties: {
    title: string,
    description?: string,
  }) => {
    const task: Task = {
      title: properties.title,
      description: properties.description ?? '',
      id: uuid(),
      list_id: list.id,
      creator_id: API.user.id,
      creation_date: Date.now(),
      status: 'Pending',
      position: 0,
    }
    await API.dynamo_client.update({
      TableName: 'Lists',
      Key: { id: list.id, },
      UpdateExpression: 'SET #tasks.#id = :new_task',
      ExpressionAttributeNames: {
        '#tasks': 'tasks',
        '#id': task.id,
      },
      ExpressionAttributeValues: {
        ':new_task': task,
      },
    }).promise()

    return task
  }

  static editTask = async (task: Task) => {
    DEBUG.log(`Editting task '${task.title}'...`)
    const response = await API.dynamo_client.update({
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

    if (DEBUG.enabled && response) {
      const old_task = response.Attributes!.tasks[task.id]
      const updated_values: { [key: string]: any } = {}
      Object.keys(task).forEach(key => {
        if (task[key as keyof Task] !== old_task[key as keyof Task])
          updated_values[key] = task[key as keyof Task]
      })
      DEBUG.log(`Updated task '${task.title}', with values:`, updated_values)
    }
  }

  static addUserToList = async (user_id: string, list: TodoList) => {
    DEBUG.log(`Adding user ${user_id} to list ${list.title}`)
    if (list.member_ids.includes(user_id)) {
      const message = `List ${list.title} already includes user ${user_id}`
      DEBUG.error(message)
      throw new Error(message)
    }

    // TODO: updates should be batched together and cancelled if an error is thrown in either one

    const list_result = await API.dynamo_client.update({
      TableName: 'Lists',
      Key: { id: list.id },
      UpdateExpression: 'ADD member_ids :user_id',
      ExpressionAttributeValues: { ':user_id': arrayToSet([user_id]) },
      ReturnValues: DEBUG.enabled ? 'UPDATED_NEW' : 'NONE'
    }).promise()

    DEBUG.log(`Updated list ${list.id}: `, list_result.Attributes)

    const user_result = await API.dynamo_client.update({
      TableName: 'Users',
      Key: { id: user_id },
      UpdateExpression: 'SET list_ids = list_append(list_ids, :value)',
      ExpressionAttributeValues: { ':value': [list.id] },
      ReturnValues: DEBUG.enabled ? 'UPDATED_NEW' : 'NONE'
    }).promise()

    DEBUG.log(`Updated user ${user_id}: `, user_result.Attributes)
  }

  static removeUserFromList = async (user_id: string, list: TodoList) => {
    const result = await API.dynamo_client.update({
      TableName: 'Lists',
      Key: { id: list.id },
      UpdateExpression: 'DELETE member_ids :user_id',
      ExpressionAttributeValues: { ':user_id': arrayToSet([user_id]) },
      ReturnValues: 'UPDATED_NEW',
    }).promise()
    DEBUG.log(result)
  }
  //#endregion
}

//#region Utils
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
  return API.dynamo_client.createSet(arr) 
}

function arrayFromSet (set: any) {
  return JSON.parse(JSON.stringify(set))
}
//#endregion

export default API
