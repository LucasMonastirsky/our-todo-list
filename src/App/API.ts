import Auth from "@aws-amplify/auth"
import { TodoList, Task } from "../Models"
import User from "../Models/User"
import AWS from 'aws-sdk'
import { aws_sdk_config } from '../Secrets'

AWS.config.update(aws_sdk_config)

export default class API {
  static getCurrentUser = async () => {
    return mapUser(await Auth.currentAuthenticatedUser())
  }
}

const mapUser = (cognito_user: CognitoUserObject): User => {
  return {
    name: cognito_user.username,
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