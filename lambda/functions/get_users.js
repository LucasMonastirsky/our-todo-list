const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')

exports.handler = async (event) => {
  if (!Array.isArray(event.ids) || event.ids.length < 1) return {
    statusCode: 400,
    error: `No user ids were provided`
  }

  console.log(`Requested ids:`, event.ids)
  console.log(`Verifying JWT...`)

  const { user_id, error } = jwt_verifier.verify(event.jwt)
  if (error) return {
    statusCode: 401,
    error: error.message
  }

  console.log(`Fetching users...`)

  const db = new AWS.DynamoDB.DocumentClient()
  const { Responses: { Users: users } } = await db.batchGet({ RequestItems: {
    'Users': {
      Keys: event.ids.map(id => ({id}))
    }
  }
  }).promise()

  console.log(`Found ${users.length} users`)

  if (users.length !== event.ids.length) {
    const missing_ids = []
    users.forEach(user => {
      if (!event.ids.includes(user.id))
        missing_ids.push(user.id)
    })
    console.warn(`Could not find users with ids:`, missing_ids)
  }

  console.log(`Formatting users...`)

  users.forEach(user => {
    if (user.contact_ids === undefined)
      user.contact_ids = []
    
    delete user.notification_arn
  })

  console.log(`Done!`)

  return {
    statusCode: 200,
    body: users,
  }
}