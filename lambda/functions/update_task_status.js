const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')

exports.handler = async (event) => {
  ['task_id', 'list_id'].forEach(key => {
    if (!event[key]) return {
      statusCode: 400,
      error: `${key} parameter is missing`
    }
  })

  const { user_id, error } = jwt_verifier.verify(event.jwt)
  if (error) return {
    statusCode: 401,
    error: error.message
  }

  if (event.status !== 'Claimed' || event.status !== 'Done')

  console.log(`Updating list...`)

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

  console.log(`Updated task ${task.title}`)
  console.log(`Getting user data...`)

  const { Item: user } = await db.get({
    TableName: 'Users',
    Key: { id: user_id },
    AttributesToGet: [ 'id', 'nickname' ]
  }).promise()

  console.log(`Got user data:`, user)
  console.log(`Publishing message to topic...`)

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
  
  console.log(`Published message to topic`)

  return {
    statusCode: 200,
    body: task
  }
}