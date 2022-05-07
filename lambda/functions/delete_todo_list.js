const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')
const verify_parameters = require('./verify_parameters')
const withLogBuffer = require('./log_buffer')

exports.handler = withLogBuffer(async (buffer, event) => {
  buffer.log(`Verifying parameters...`)

  const { missing_keys, unwanted_keys} = verify_parameters(event, ['list_id'])

  if (missing_keys) return {
    statusCode: 400,
    error: `Missing parameters: ${missing_keys}`
  }

  if (unwanted_keys) return {
    statusCode: 400,
    error: `Invalid parameters: ${unwanted_keys}`
  }

  buffer.log(`Verifying JWT...`)

  const { user_id, error } = jwt_verifier.verify(event.jwt)
  if (error) return {
    statusCode: 401,
    error: error.message,
  }

  buffer.log(`Fetching list...`)

  const db = new AWS.DynamoDB.DocumentClient()
  const { Item: list } = await db.get({
    TableName: 'Lists',
    Key: { id: event.list_id },
  }).promise()

  buffer.log(`Verifying ownership...`)

  if (list.owner_id !== user_id) return {
    statusCode: 403,
    error: 'The user does not own this list'
  }

  buffer.log(`Getting members...`)

  const member_ids = [...JSON.parse(JSON.stringify(list.member_ids))].filter(x => x !== '')

  const { Responses: { Users: members } } = await db.batchGet({
    RequestItems: {
      'Users': {
        ConsistentRead: true,
        Keys: member_ids.map(id => ({id}))
      }
    }
  }).promise()

  buffer.log(`Starting batch delete...`)

  const mapUser = (user) => {
    const i = user.list_ids.indexOf(list.id)
    user.list_ids.splice(i, 1)
    return { PutRequest: { Item: user } }
  }

  await db.batchWrite({
    RequestItems: {
      'Lists': [{ DeleteRequest: { Key: { id: list.id } } }],
      'Users': members.map(mapUser),
    }
  }).promise()

  buffer.log(`Deleting SNS topic...`)

  const sns = new AWS.SNS()
  await sns.deleteTopic({TopicArn: list.topic_arn}).promise()

  buffer.log(`Done!`)

  return {
    statusCode: 200,
  }
})