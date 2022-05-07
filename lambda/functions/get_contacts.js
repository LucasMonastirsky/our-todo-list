const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')
const verify_parameters = require('./verify_parameters')
const withLogBuffer = require('./log_buffer')

exports.handler = withLogBuffer(async (buffer, event) => {
  buffer.log(`Verifying parameters...`)

  const { unwanted_keys} = verify_parameters(event, [])

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

  buffer.log(`Fetching user...`)

  const db = new AWS.DynamoDB.DocumentClient()
  const { Item: user } = await db.get({
    TableName: 'Users',
    Key: { id: user_id }
  }).promise()

  if (user === undefined) return {
    statusCode: 404,
    error: `User does not exist`,
  }

  user.contact_ids = user.contact_ids ? [...JSON.parse(JSON.stringify(user.contact_ids))] : []

  if (user.contact_ids === undefined || user.contact_ids.length < 1) return {
    statusCode: 200,
    body: [],
  }

  buffer.log(`Fetching contacts...`)

  const { Responses: { Users: contacts } } = await db.batchGet({
    RequestItems: {
      'Users': {
        ConsistentRead: true,
        Keys: user.contact_ids.map(id => ({id}))
      }
    }
  }).promise()

  buffer.log(`Found ${contacts.length} contacts`)

  return {
    statusCode: 200,
    body: contacts,
  }
})