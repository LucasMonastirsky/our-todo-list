const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')

exports.handler = async (event) => {
  ['list_id', 'changes'].forEach(key => {
    if (!event[key]) return {
      statusCode: 400,
      error: `${key} parameter is missing`,
    }
  })

  console.log(`Parameters:`, event)
  console.log(`Verifying parameters...`)
  const allowed_keys = [
    'title'
  ]
  const unwanted_parameters = Object.keys(event.changes).filter(key => {
    if (!allowed_keys.includes(key))
      return true
    if (key === 'title' && event.changes[key].length > 64)
      return true
    return false
  })

  if (unwanted_parameters.length > 1) {
    console.error(`Invalid parameters: `,
      unwanted_parameters.map(key => ({key, value: event.changes[key]}))
    )

    return {
      statusCode: 400,
      error: `Invalid parameters`
    }
  }

  console.log(`Verifying JWT...`)

  const { user_id, error } = jwt_verifier.verify(event.jwt)
  if (error) return {
    statusCode: 401,
    error: error.message
  }

  console.log(`Verifying ownership...`)

  const db = new AWS.DynamoDB.DocumentClient()
  const { Item: original_list } = await db.get({
    TableName: 'Lists',
    Key: { id: event.list_id }
  }).promise()

  if (original_list.owner_id !== user_id) {
    console.error(`User does not own list`)
    return {
      statusCode: 403,
      error: `User does not own list`
    }
  }

  console.log(`Updating list...`)

  const update_query = buildUpdateQuery(event.changes)
  const { Attributes: list } = await db.update({
    TableName: 'Lists',
    Key: { id: event.list_id },
    UpdateExpression: update_query.expression,
    ExpressionAttributeValues: update_query.values,
    ReturnValues: 'ALL_NEW',
  }).promise()

  console.log(`Formatting list...`)

  list.member_ids = list.member_ids ? [...JSON.parse(JSON.stringify(list.member_ids))] : []
  delete list.topic_arn

  console.log(`Done!`)
  
  return {
    statusCode: 200,
    body: list,
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