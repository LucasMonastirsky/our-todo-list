const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')
const verify_parameters = require('./verify_parameters')
const withLogBuffer = require('./log_buffer')

exports.handler = withLogBuffer(async (buffer, event) => {
  buffer.log(`Verifying parameters...`)

  const { missing_keys, unwanted_keys} = verify_parameters(event, ['contact_id'])

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

  buffer.log(`Deleting contact...`)

  const db = new AWS.DynamoDB.DocumentClient()
  await db.update({
    TableName: 'Users',
    Key: { id: user_id },
    UpdateExpression: 'DELETE contact_ids :contact_id',
    ExpressionAttributeValues: { ':contact_id': db.createSet([event.contact_id]) },
  }).promise()

  buffer.log(`Done!`)

  return {
    statusCode: 200,
    body: {},
  }
})