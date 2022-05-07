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

  buffer.log(`Additional checks...`)

  if (user_id === event.contact_id) {
    buffer.error(`user_id matches contact_id`)
    return {
      statusCode: 400,
      error: `User is trying to add themselves`,
    }
  }

  buffer.log(`Fetching both users...`)

  const db = new AWS.DynamoDB.DocumentClient()
  const { Responses: { Users: users } } = await db.batchGet({
    RequestItems: {
      'Users': {
        Keys: [{id: user_id}, {id: event.contact_id}]
      }
    }
  }).promise()

  if (users.length < 2) {
    const missing_ids = [user_id, event.contact_id].filter(id => !users.some(user => user.id === id))
    buffer.error(`Could not find users`, missing_ids)
    return {
      statusCode: 400,
      error: `One or more ids provided were invalid`
    }
  }

  let user, contact
  users.forEach(x => {
    if (x.id === user_id)
      user = x
    else contact = x
  })

  buffer.log(`Fetched user ${user.username} and contact ${contact.username}`)
  buffer.log(`Updating user...`)

  await db.update({
    TableName: 'Users',
    Key: { id: user_id },
    UpdateExpression: 'ADD contact_ids :contact_id',
    ExpressionAttributeValues: { ':contact_id': db.createSet([event.contact_id]) }
  }).promise()

  buffer.log(`Done!`)

  return {
    statusCode: 200,
    body: contact,
  }
})