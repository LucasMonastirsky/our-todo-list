const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')
const verify_parameters = require('./verify_parameters')
const withLogBuffer = require('./log_buffer')

exports.handler = withLogBuffer(async (buffer, event) => {
  buffer.log(`Verifying parameters...`)

  const { missing_keys, unwanted_keys} = verify_parameters(event, ['list_id', 'changes'])

  if (missing_keys) return {
    statusCode: 400,
    error: `Missing parameters: ${missing_keys}`
  }

  if (unwanted_keys) return {
    statusCode: 400,
    error: `Invalid parameters: ${unwanted_keys}`
  }

  if (event.changes.title?.length > 64) return {
    statusCode: 400,
    error: `Title is too long`
  }

  buffer.log(`Verifying JWT...`)

  const { user_id, error } = jwt_verifier.verify(event.jwt)
  if (error) return {
    statusCode: 401,
    error: error.message
  }

  buffer.log(`Verifying ownership...`)

  const db = new AWS.DynamoDB.DocumentClient()
  const { Item: original_list } = await db.get({
    TableName: 'Lists',
    Key: { id: event.list_id }
  }).promise()

  if (original_list.owner_id !== user_id) {
    buffer.error(`User does not own list`)
    return {
      statusCode: 403,
      error: `User does not own list`
    }
  }

  buffer.log(`Updating list...`)

  const update_query = buildUpdateQuery(event.changes)
  const { Attributes: list } = await db.update({
    TableName: 'Lists',
    Key: { id: event.list_id },
    UpdateExpression: update_query.expression,
    ExpressionAttributeValues: update_query.values,
    ReturnValues: 'ALL_NEW',
  }).promise()

  buffer.log(`Formatting list...`)

  list.member_ids = list.member_ids ? [...JSON.parse(JSON.stringify(list.member_ids))] : []
  delete list.topic_arn

  buffer.log(`Done!`)
  
  return {
    statusCode: 200,
    body: list,
  }
})

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