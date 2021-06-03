const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')
const verify_parameters = require('./verify_parameters')

exports.handler = async (event) => {
  console.log(`Verifying parameters...`)

  const { missing_keys, unwanted_keys} = verify_parameters(event, ['changes'])

  if (missing_keys) return {
    statusCode: 400,
    error: `Missing parameters: ${missing_keys}`
  }

  if (unwanted_keys) return {
    statusCode: 400,
    error: `Invalid parameters: ${unwanted_keys}`
  }

  const allowed_keys = ['nickname']
  for (const key in event.changes) {
    if (!allowed_keys.includes(key)) {
      console.error(`Unwanted change: ${key}`)
      return {
        statusCode: 400,
        error: `Invalid parameter: changes.${key}`
      }
    }
  }

  if ((typeof event.changes.nickname !== 'string') || event.changes.nickname?.length > 64) return {
    statusCode: 400,
    error: `Nickname is too long`
  }

  console.log(`Verifying JWT...`)

  const { user_id, error } = jwt_verifier.verify(event.jwt)
  if (error) return {
    statusCode: 401,
    error: error.message
  }

  console.log(`Updating user...`)
  const db = new AWS.DynamoDB.DocumentClient()

  const update_query = buildUpdateQuery(event.changes)
  const { Attributes: user } = await db.update({
    TableName: 'Users',
    Key: { id: user_id },
    UpdateExpression: update_query.expression,
    ExpressionAttributeValues: update_query.values,
    ReturnValues: 'ALL_NEW',
  }).promise()

  console.log(`Formatting user...`)

  user.contact_ids = user.contact_ids ? [...JSON.parse(JSON.stringify(user.contact_ids))] : []
  delete user.notification_arn

  console.log(`Done!`)
  
  return {
    statusCode: 200,
    body: user,
  }
}

function buildUpdateQuery (changes) {
  let expression = 'SET '
  let values = {}
  Object.keys(changes).forEach((key, index) => {
    if (index > 0)
      expression += ', '
    expression += `${key} = :${index}`
    values[`:${index}`] = changes[key]
  })
  return { expression, values }
}