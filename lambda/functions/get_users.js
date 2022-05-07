const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')
const withLogBuffer = require('./log_buffer')

exports.handler = withLogBuffer(async (buffer, event) => {
  if (!Array.isArray(event.ids) || event.ids.length < 1) return {
    statusCode: 400,
    error: `No user ids were provided`
  }

  buffer.log(`Requested ids:`, event.ids)
  buffer.log(`Verifying JWT...`)

  const { user_id, error } = jwt_verifier.verify(event.jwt)
  if (error) return {
    statusCode: 401,
    error: error.message
  }

  buffer.log(`Fetching users...`)

  const db = new AWS.DynamoDB.DocumentClient()
  const { Responses: { Users: users } } = await db.batchGet({ RequestItems: {
    'Users': {
      Keys: event.ids.map(id => ({id}))
    }
  }
  }).promise()

  buffer.log(`Found ${users.length} users`)

  if (users.length !== event.ids.length) {
    const missing_ids = []
    users.forEach(user => {
      if (!event.ids.includes(user.id))
        missing_ids.push(user.id)
    })
    buffer.warn(`Could not find users with ids:`, missing_ids)
  }

  buffer.log(`Formatting users...`)

  users.forEach(user => {
    if (user.contact_ids === undefined)
      user.contact_ids = []
    
    delete user.notification_arn
  })

  buffer.log(`Done!`)

  return {
    statusCode: 200,
    body: users,
  }
})