import Auth from "@aws-amplify/auth"
import Amplify from 'aws-amplify'
import { TodoList  } from "../Models"
import User from "../Models/User"
import AWS from 'aws-sdk'
import { amplify_config, aws_sdk_config } from '../Secrets'
import {default as react_native_uuid } from 'react-native-uuid'

AWS.config.update(aws_sdk_config)
Amplify.configure(amplify_config)

const uuid = () => `${react_native_uuid.v4()}`

export default class API {
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
  static createTodoList = async (properties: {
    title: string,
    description: string,
    owner_id: string,
  }) => {
    const list: TodoList = {
      ...properties,
      member_ids: [properties.owner_id],
      task_ids: [],
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
  //#endregion
}

const mapUser = (cognito_user: CognitoUserObject): User => {
  return {
    username: cognito_user.username,
    id: cognito_user.attributes.sub,
    getLists: async () => [{
      title: 'undefined',
      id: '0',
      description: '',
      member_ids: ['0'],
      task_ids: [],
      owner_id: '0'
    }]
  }
}

type CognitoUserObject = {
  username: string,
  attributes: {
    sub: string,
  }
}
