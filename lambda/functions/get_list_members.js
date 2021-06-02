const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')
const verify_parameters = require('./verify_parameters')

exports.handler = async (event) => {
  console.log(`Verifying parameters...`)

  const { missing_keys, unwanted_keys} = verify_parameters(event, ['list_id'])

  if (missing_keys) return {
    statusCode: 400,
    error: `Missing parameters: ${missing_keys}`
  }

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

  console.log(`Fetching list...`)

  const db = new AWS.DynamoDB.DocumentClient()
  const { Item: list } = await db.get({
    TableName: 'Lists',
    Key: { id: event.list_id }
  }).promise()

  if (list === undefined) return {
    statusCode: 404,
    error: `List does not exist`,
  }

  list.member_ids = list.member_ids ? [...JSON.parse(JSON.stringify(list.member_ids))] : []

  console.log(`Verifying access...`)

  if (!list.member_ids.includes(user_id)) return {
    statusCode: 403,
    error: `User is not a member of this list`
  }

  console.log(`Fetching members...`)

  const { Responses: { Users: members } } = await db.batchGet({
    RequestItems: {
      'Users': {
        ConsistentRead: true,
        Keys: list.member_ids.map(id => ({id}))
      }
    }
  }).promise()

  console.log(`Found ${members.length} contacts, removing notification_arn...`)

  members.forEach(member => delete member.notification_arn)

  console.log(`Done!`)
  
  return {
    statusCode: 200,
    body: members,
  }
}