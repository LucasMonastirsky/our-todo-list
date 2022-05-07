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

  if (user.contact_ids === undefined)
    user.contact_ids = []

  buffer.log(`Found user:`, user)

  return {
    statusCode: 200,
    body: user,
  }
})