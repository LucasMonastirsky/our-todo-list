const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')
const verify_parameters = require('./verify_parameters')

exports.handler = async (event) => {
  console.log(`Verifying parameters...`)

  const { unwanted_keys } = verify_parameters(event, [])

  if (unwanted_keys) return {
    statusCode: 400,
    error: `Invalid parameters: ${unwanted_keys}`
  }

  console.log(`Verifying JWT...`)

  const { user_id, error } = jwt_verifier.verify(event.jwt)
  if (error) return {
    statusCode: 401,
    error: error.message,
  }

  console.log(`Fetching user...`)

  const db = new AWS.DynamoDB.DocumentClient()
  const { Item: user } = await db.get({
    TableName: 'Users',
    Key: { id: user_id },
  }).promise()

  console.log(`Fetching lists...`)

  const { Responses: { Lists: lists } } = await db.batchGet({
    RequestItems: {
      'Lists': {
        ConsistentRead: true,
        Keys: user.list_ids.map(id => ({id}))
      }  
    }
  }).promise()

  if (lists.length !== user.list_ids.length) {
    console.warn(`Number of found lists does not match number of list ids in user data; missing ids:`)
    console.warn(lists.filter(list => !user.list_ids.includes(list.id)).map(list => list.id))
  }

  console.log(`Formatting lists...`)

  const user_ids = {}
  lists.forEach(list => {
    list.member_ids = list.member_ids ? [...JSON.parse(JSON.stringify(list.member_ids))] : []
    delete list.topic_arn
    list.member_ids.forEach(id => user_ids[id] = true)
  })

  console.log(`Fetching users...`)

  const { Responses: { Users: users } } = await db.batchGet({
    RequestItems: { 'Users': { Keys: Object.keys(user_ids).map(id => ({id})) } }
  }).promise()

  console.log(`Formatting users...`)

  users.forEach(user => {
    user.contact_ids = user.contact_ids ?? []
    delete user.notification_arn
  })

  console.log(`Done!`)
  
  return {
    statusCode: 200,
    body: {
      lists,
      users
    },
  }
}