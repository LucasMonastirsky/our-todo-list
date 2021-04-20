import Auth from "@aws-amplify/auth"
import Amplify from 'aws-amplify'
import { TodoList, Task } from "../Models"
import User from "../Models/User"
import AWS from 'aws-sdk'
import { amplify_config, aws_sdk_config } from '../Secrets'

AWS.config.update(aws_sdk_config)
Amplify.configure(amplify_config)

export default class API {
  private static dynamo_client =  new AWS.DynamoDB.DocumentClient()

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
}

const mapUser = (cognito_user: CognitoUserObject): User => {
  return {
    username: cognito_user.username,
    id: cognito_user.attributes.sub,
    getLists: async () => mock_lists
  }
}

type CognitoUserObject = {
  username: string,
  attributes: {
    sub: string,
  }
}

//#region Debug
const mock_lists: TodoList[] = [
  new TodoList({
    title: 'Household',
    description: 'Tasks for our home!',
    id: '0',
    member_ids: ['0', '1'],
    tasks: [
      new Task({title: 'Wash Dishes', creator_id: 'Laura', id: '0', position: 0}),
      new Task({title: 'Buy Tofu', creator_id: 'Josh', id: '1', position: 1, description: `The normal kind, not the flavoured kind, it's more expensive!`}),
      new Task({title: 'Fill Hole in the Wall', creator_id: 'Laura', id: '2', position: 2}),
      new Task({title: 'Take Dog for a Walk', creator_id: 'Laura', id: '3', position: 3}),
      new Task({title: 'Develop App', creator_id: 'Josh', id: '4', position: 4, description: `Yes, this one.`}),
      new Task({title: 'I Ran out of Ideas', creator_id: 'Laura', id: '5', position: 5}),
    ]
  }),
  new TodoList({
    title: 'Vacation Trip',
    description: 'Things to do before going on vacation',
    id: '1',
    member_ids: ['0', '1'],
    tasks: [
      new Task({title: 'Choose Destination', creator_id: 'Laura', id: '6', position: 0}),
      new Task({title: 'Book Tickets', creator_id: 'Josh', id: '7', position: 1}),
      new Task({title: 'Plan Activities', creator_id: 'Laura', id: '8', position: 2}),
      new Task({title: 'Find Someone to Take Care of the Dog', creator_id: 'Laura', id: '9', position: 3}),
      new Task({title: 'Ask for vacation at work', creator_id: 'Josh', id: '10', position: 4}),
      new Task({title: 'I Ran out of Ideas, yet again...', creator_id: 'Laura', id: '11', position: 5}),
    ]
  }),
  new TodoList({
    title: 'Project Car',
    description: 'An absolute money pit',
    id: '2',
    member_ids: ['0'],
    tasks: [
      new Task({title: 'Buy new jack', creator_id: 'Laura', id: '12', position: 0}),
      new Task({title: 'Fabricate brake adaptor plate', creator_id: 'Josh', id: '13', position: 1}),
      new Task({title: 'Buy disc brakes', creator_id: 'Laura', id: '14', position: 2}),
      new Task({title: 'Buy fuel tank', creator_id: 'Laura', id: '15', position: 3}),
      new Task({title: 'Build control box', creator_id: 'Josh', id: '16', position: 4}),
      new Task({title: 'Replace alternator', creator_id: 'Laura', id: '17', position: 5}),
    ]
  }),
  new TodoList({
    title: 'Cows Rule',
    description: 'Things to do before going on vacation',
    id: '3',
    member_ids: ['0', '3'],
    tasks: [
      new Task({title: 'They are so pretty', creator_id: 'Laura', id: '18', position: 0}),
      new Task({title: 'In any colour', creator_id: 'Josh', id: '19', position: 1}),
      new Task({title: 'I love them', creator_id: 'Laura', id: '20', position: 2}),
    ]
  }),
  new TodoList({
    title: 'Project Car',
    description: 'Things to do before going on vacation',
    id: '4',
    member_ids: ['0', '1', '2'],
    tasks: [
      new Task({title: 'Choose Destination', creator_id: 'Laura', id: '6', position: 0}),
      new Task({title: 'Book Tickets', creator_id: 'Josh', id: '7', position: 1}),
      new Task({title: 'Plan Activities', creator_id: 'Laura', id: '8', position: 2}),
      new Task({title: 'Find Someone to Take Care of the Dog', creator_id: 'Laura', id: '9', position: 3}),
      new Task({title: 'Ask for vacation at work', creator_id: 'Josh', id: '10', position: 4}),
      new Task({title: 'I Ran out of Ideas, yet again...', creator_id: 'Laura', id: '11', position: 5}),
    ]
  }),
]
//#endregion