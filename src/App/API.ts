import Auth from "@aws-amplify/auth"
import Amplify from 'aws-amplify'
import { Task, TodoList } from "../Models"
import User from "../Models/User"
import AWS from 'aws-sdk'
import { amplify_config, aws_sdk_config, secrets } from '../Secrets'
import { IAPI } from '.'
import DEBUG from "../Utils/DEBUG"
import { RNS3 } from 'react-native-aws3'
import Notifications from "./Notifications"
import { Dictionary } from "../Utils"

AWS.config.update(aws_sdk_config)
Amplify.configure(amplify_config)

const dynamo_client =  new AWS.DynamoDB.DocumentClient()
const lambda_client = new AWS.Lambda()

let API: IAPI
API = class API {

  //#region Auth
  private static _user?: User
  static get user() { return API._user! }

  static continuePreviousSession = async () => {
    DEBUG.log(`Continuing previous session...`)
    const cognito_user = await Auth.currentAuthenticatedUser()
  
    DEBUG.log(`Getting user from storage...`)
    API._user = await API.getUser(cognito_user.attributes.sub)

    DEBUG.log(`Updating notification token...`)
    await invokeLambda('update_user_notification_token', {
      user_id: API.user.id,
      notification_token: Notifications.token,
    })

    DEBUG.log(`Continuing session from user ${API._user.username}`)
  }

  static signIn = async (username: string, password: string) => {
    DEBUG.log(`Authenticating user ${username}...`)
    await Auth.signIn(username, password).catch(e => { DEBUG.error(e); throw e })

    DEBUG.log(`Authenticated user ${username}, getting user data...`)
    const cognito_user = await Auth.currentAuthenticatedUser()

    DEBUG.log(`Updating notification token...`)
    await invokeLambda('update_user_notification_token', {
      user_id: cognito_user.attributes.sub,
      notification_token: Notifications.token,
    })

    DEBUG.log(`Getting user from storage...`)
    const user = await API.getUser(cognito_user.attributes.sub)
    API._user = user

    DEBUG.log(`Signed in user ${user.username}`)
  }

  static signOut = async () => {
    DEBUG.log(`Signing out user ${API.user.username}...`)
    await Auth.signOut()
    API._user = undefined
    DEBUG.log(`Signed out successfully`)
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
      DEBUG.error(`Error while registering user ${username}`)
      throw {message: error.message ?? 'Unknown error'}
    }
  }

  static confirmUser = async (username: string, confirmation_code: string) => {
    DEBUG.log(`Confirming user ${username}...`)
    await Auth.confirmSignUp(username, confirmation_code)
    DEBUG.log(`Confirmation returned successfully`)

    if (!API.pending_registration_user)
      throw new Error('No user pending registration in API')
    if (API.pending_registration_user.username !== username)
      throw new Error('User pending registration differs from requested user')

    DEBUG.log(`Creating user ${username} in storage...`)

    const user = await invokeLambda('create_user', {
      username,
      user_id: API.pending_registration_user.id,
      notification_token: Notifications.token,
    })

    API.pending_registration_user = undefined

    DEBUG.log(`Created user ${user.username} with id ${user.id}`)
  }

  static resendConfirmationCode = async (username: string) => {
    DEBUG.log(`Resending confirmation code for user ${username}...`)
    await Auth.resendSignUp(username)
    DEBUG.log(`Confirmation code resent`)
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
    else DEBUG.log(`Found cached user ${API.cache.users[id].username} with image ${API.cache.users[id].image}`)

    return API.cache.users[id]
  }

  static getUser = async (id: string) => {
    DEBUG.log(`Getting user data from id ${id}...`)

    const result = await dynamo_client.get({
      TableName: 'Users',
      Key: { id },
    }).promise()

    if (result.Item === undefined)
      throw `Could not find user with id ${id}`
    else DEBUG.log(`Found data for user ${result.Item.username}`)

    const user = {
      ...result.Item,
      contact_ids: arrayFromSet(result.Item.contact_ids!)
    } as User

    API.cache.users[user.id] = user

    DEBUG.log(`Formatted user data successfully`,)
    return user
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
    })
    DEBUG.log(`Got ${Object.keys(list_map).length} lists from user ${user.username}`)

    return list_map
  }

  static createTodoList = async (properties: {
    title: string,
    description: string,
    owner_id: string,
  }) => {
    DEBUG.log(`Creating list ${properties.title}...`)
    const list = await invokeLambda('create_todo_list', {
      ...properties,
      user_id: API.user.id,
    })
    DEBUG.log(`Created list successfully`)
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
      ReturnValues: DEBUG.enabled ? 'UPDATED_NEW' : 'NONE'
    }).promise()

    DEBUG.log(`Updated list ${id} with values`, response.Attributes )
  }

  static deleteTodoList = async (id: string) => {
    DEBUG.log(`Deleting list ${id}...`)
    
    await invokeLambda('delete_todo_list', {
      id,
      user_id: API.user.id,
    })

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

    DEBUG.log(`Created task ${properties.title}`)

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

    DEBUG.log(`Removed user ${user_id} from list ${list.title}`)
  }

  static addContact = async (contact_id: string, user_id: string) => {
    DEBUG.log(`Adding user ${contact_id} to contacts of ${user_id}`)

    if (contact_id === user_id)
      throw new Error(`Users can't add themselves (user id: ${user_id})`)
    if ((await API.getCachedUser(user_id)).contact_ids.includes(contact_id))
      throw new Error(`User ${user_id} has already added user ${contact_id}`)

    const result = await dynamo_client.update({
      TableName: 'Users',
      Key: { id: user_id } ,
      UpdateExpression: 'ADD contact_ids :contact_id',
      ExpressionAttributeValues: { ':contact_id': arrayToSet([contact_id]) },
      ReturnValues: DEBUG.enabled ? 'UPDATED_NEW' : 'NONE',
    }).promise()

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

    DEBUG.log(`Updated status of task '${task.title}' to ${status}`)

    return updated_task
  }
  //#endregion
}

//#region Utils
async function invokeLambda(function_name: string, params: any) {
  const response = await lambda_client.invoke({
    FunctionName: function_name,
    Payload: JSON.stringify(params)
  }).promise()

  if (response.StatusCode !== 200)
    throw new Error(`Lambda returned status code ${response.StatusCode}`)

  return JSON.parse(response.Payload as string).body
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
