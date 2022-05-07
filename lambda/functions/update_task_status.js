const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')
const verify_parameters = require('./verify_parameters')
const withLogBuffer = require('./log_buffer')

exports.handler = withLogBuffer(async (buffer, event) => {
  buffer.log(`Verifying parameters...`)

  const { missing_keys, unwanted_keys} = verify_parameters(event, ['task_id', 'list_id'])

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

  if (event.status !== 'Claimed' || event.status !== 'Done')

  buffer.log(`Updating list...`)

  const db = new AWS.DynamoDB.DocumentClient()

  const { Attributes: list } = await db.update({
    TableName: 'Lists',
    Key: { id: event.list_id },
    UpdateExpression: `SET tasks.#id.#status = :0, tasks.#id.#0 = :1`
      + (event.status === 'Done' ? ', tasks.#id.completion_date = :2' : ''),
    ExpressionAttributeNames: {
      '#id': event.task_id,
      '#status': 'status',
      '#0': event.status === 'Done' ? 'completer_id' : 'claimed_by_id'
    },
    ExpressionAttributeValues: {
      ':0': event.status,
      ':1': user_id,
      ':2': (event.status === 'Done' ? Date.now() : undefined)
    },
    ReturnValues: 'ALL_NEW'
  }).promise()
  const task = list.tasks[event.task_id]

  buffer.log(`Updated task ${task.title}`)
  buffer.log(`Getting user data...`)

  const { Item: user } = await db.get({
    TableName: 'Users',
    Key: { id: user_id },
    AttributesToGet: [ 'id', 'nickname' ]
  }).promise()

  buffer.log(`Got user data:`, user)
  buffer.log(`Publishing message to topic...`)

  const sns = new AWS.SNS()
  await sns.publish({
    TopicArn: list.topic_arn,
    Message: JSON.stringify({
      type: event.status === 'Claimed' ? 'task_claimed' : 'task_completed',
      task,
      user_id: user.id,
      user_nickname: user.nickname,
    })
  }).promise()
  
  buffer.log(`Published message to topic`)

  return {
    statusCode: 200,
    body: task
  }
})