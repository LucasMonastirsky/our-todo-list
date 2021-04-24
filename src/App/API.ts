import Auth from "@aws-amplify/auth"
import Amplify from 'aws-amplify'
import { Task, TASK_STATUS, TodoList  } from "../Models"
import User from "../Models/User"
import AWS from 'aws-sdk'
import { amplify_config, aws_sdk_config } from '../Secrets'
import {default as react_native_uuid } from 'react-native-uuid'
import { IAPI } from '.'

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
    API._user = mapUser(await Auth.currentAuthenticatedUser())
  }

  static signIn = async (username: string, password: string) => {
    try {
      await Auth.signIn(username, password)
      API._user = mapUser(await Auth.currentAuthenticatedUser())
    }
    catch (error) {
      console.log('Error while signing in: ', error)
      throw error.message ?? 'Unknown error'
    }
  }

  static signOut = async () => {
    try {
      await Auth.signOut()
    }
    catch (error) {
      console.log('Error while signing out: ', error)
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
      console.error('Error while registering user: ', error)
      throw {message: error.message ?? 'Unknown error'}
    }
  }

  static confirmUser = async (username: string, confirmation_code: string) => {
    try {
      console.log('signUp return: ', await Auth.confirmSignUp(username, confirmation_code))

      if (!API.pending_registration_user)
        throw 'No user pending registration in API'
      if (API.pending_registration_user.username !== username)
        throw 'User pending registration differs from requested user'

      await API.dynamo_client.put({
        TableName: 'Users',
        Item: {
          username: API.pending_registration_user.username,
          id: API.pending_registration_user.id,
        }
      })

      API.pending_registration_user = undefined
    }
    catch (error) {
      console.error('Error while confirming new user: ', error)
      throw error.message ?? 'Unknown error'
    }
  }

  static resendConfirmationCode = async (username: string) => {
    try {
      await Auth.resendSignUp(username)
    }
    catch (error) {
      console.error('Error while resending confirmation code: ', error)
      throw error.message ?? 'Unknown error'
    }
  }
  //#endregion

  //#region Storage
  static getListsFrom = async (user: User) => {
    const result = await (API.dynamo_client.query({
      TableName: 'Lists',
      KeyConditionExpression: 'owner_id = :owner_id',
      ExpressionAttributeValues: { ':owner_id': user.id }
    }).promise())
    return result.Items as TodoList[]
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
      Item: list,
    }, err => {
      if (err) throw err
    })

    return list
  }

  static createTask = async (list: TodoList, properties: {
    title: string,
    description?: string,
  }) => {
    const task: Task = {
      title: properties.title,
      description: properties.description ?? '',
      id: uuid(),
      creator_id: API.user.id,
      creation_date: Date.now(),
      status: TASK_STATUS.PENDING,
      position: 0,
    }
    await API.dynamo_client.update({
      TableName: 'Lists',
      Key: {
        owner_id: list.owner_id,
        id: list.id,
      },
      UpdateExpression: 'SET #tasks = list_append(#tasks, :new_task)',
      ExpressionAttributeNames: {
        '#tasks': 'tasks',
      },
      ExpressionAttributeValues: {
        ':new_task': [task],
      },
    }, (err, data) => console.log(err, '\n', data))
    return task
  }
  //#endregion
}

const mapUser = (cognito_user: CognitoUserObject): User => {
  const user = {
    username: cognito_user.username,
    id: cognito_user.attributes.sub,
    getLists: async () => ([])
  }
  return {
    ...user,
    getLists: async () => API.getListsFrom(user)
  }
}

type CognitoUserObject = {
  username: string,
  attributes: {
    sub: string,
  }
}

export default API
