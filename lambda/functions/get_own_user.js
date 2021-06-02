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

  if (user.contact_ids === undefined)
    user.contact_ids = []

  console.log(`Found user:`, user)

  return {
    statusCode: 200,
    body: user,
  }
}