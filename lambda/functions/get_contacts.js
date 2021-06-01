const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')

exports.handler = async (event) => {
  console.log(`Verifying JWT...`)

  const { user_id, error } = jwt_verifier.verify(event.jwt)
  if (error) return {
    statusCode: 401,
    error: error.message
  }

  console.log(`Fetching user...`)

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

  console.log(`Fetching contacts...`)

  const { Responses: { Users: contacts } } = await db.batchGet({
    RequestItems: {
      'Users': {
        ConsistentRead: true,
        Keys: user.contact_ids.map(id => ({id}))
      }
    }
  }).promise()

  console.log(`Found ${contacts.length} contacts`)

  return {
    statusCode: 200,
    body: contacts,
  }
}