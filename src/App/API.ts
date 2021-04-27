import Auth from "@aws-amplify/auth"
import Amplify from 'aws-amplify'
import { Task, TASK_STATUS, TodoList  } from "../Models"
import User from "../Models/User"
import AWS from 'aws-sdk'
import { amplify_config, aws_sdk_config } from '../Secrets'
import {default as react_native_uuid } from 'react-native-uuid'
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

      await API.dynamo_client.put({
        TableName: 'Users',
        Item: {
          username: API.pending_registration_user.username,
          id: API.pending_registration_user.id,
          list_ids: [],
        }
      }, (err, data) => DEBUG.log(err || `Done: ${data}`))

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

    const user = (await (API.dynamo_client.get({
      TableName: 'Users',
      Key: { id },
    }).promise())).Item as User
    if (user === undefined)
      throw `Could not find user with id ${id}`

    API.cache.users[user.id] = user

    DEBUG.log(`Found user data: ${user}`)
    return user
  }

  static getListsFrom = async (user: User) => {
    DEBUG.log(`Getting lists from user ${user.username}`)

    if (user.list_ids.length < 1) {
      DEBUG.log('User has no lists')
      return []
    }

    const query = await (API.dynamo_client.batchGet({
      RequestItems: {
        Lists: {
          Keys: user.list_ids.map(id => ({ id }))
        }
      }
    }).promise())

    if (!query.Responses){
      DEBUG.error('No responses...')
      throw 'getListsFrom: no responses'
    }

    const result = query.Responses.Lists
    DEBUG.log(`Got ${result.length} lists from ${user.username}`)

    return result.map(item => ( // convert task map to list
      { ...item, tasks: Object.values(item.tasks)}
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
      Item: {...list, tasks: {}},
    }, err => {
      if (err) throw err
    })

    await API.dynamo_client.update({
      TableName: 'Users',
      Key: { id: API.user.id },
      UpdateExpression: 'SET #list_ids = list_append(#list_ids, :new_list_id)',
      ExpressionAttributeNames: { '#list_ids': 'list_ids' },
      ExpressionAttributeValues: { ':new_list_id': [list.id] }
    }, (err) => { throw err })

    return list
  }

  static editTodoList = async (old_list: TodoList, new_list: TodoList) => {
    DEBUG.log(`Editting list '${new_list.title}'`)
    await (API.dynamo_client.update({
      TableName: 'Lists',
      Key: { id: new_list.id }
    }))
  }

  static deleteTodoList = async (id: string) => {
    DEBUG.log(`Deleting list ${id}`)
    await (API.dynamo_client.delete({
      TableName: 'Lists',
      Key: { id }
    }).promise())
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
      status: TASK_STATUS.PENDING,
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
    }, (error, data) => error && DEBUG.error(error))
    return task
  }

  static editTask = async (task: Task) => {
    DEBUG.log(`Editting task '${task.title}'...`)
    await API.dynamo_client.update({
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
    }, (error, data) => {
      if (error)
        DEBUG.error(`Error while editting task '${task.title}': ${error}`)
      else if (DEBUG.enabled) {
        const old_task = data.Attributes!.tasks[task.id]
        const updated_values: { [key: string]: any } = {}
        Object.keys(task).forEach(key => {
          if (task[key as keyof Task] !== old_task[key as keyof Task])
            updated_values[key] = task[key as keyof Task]
        })
        DEBUG.log(`Updated task '${task.title}', with values:`, updated_values)
      }
    })
  }
  //#endregion
}

const mapUser = (cognito_user: CognitoUserObject): User => {
  return {
    username: cognito_user.username,
    id: cognito_user.attributes.sub,
    list_ids: [],
  }
}

type CognitoUserObject = {
  username: string,
  attributes: {
    sub: string,
  }
}

export default API
