const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')

exports.handler = async (event) => {
  ['title', 'list_id'].forEach(key => {
    if (!event[key]) return {
      statusCode: 400,
      body: { error: `${key} parameter is missing` }
    }
  })
  
  const { user_id, error } = jwt_verifier.verify(event.jwt)
  if (error) return {
    statusCode: 401,
    body: { error }
  }

  const task = {
    title: event.title,
    description: event.description ?? '',
    id: event.id,
    list_id: event.list_id,
    creator_id: user_id,
    creation_date: Date.now(),
    status: 'Pending',
    position: 0,
  }

  console.log(`Updating list '${event.list_id}' with task:`, task)

  const db = new AWS.DynamoDB.DocumentClient()
  const { Attributes: list } = await db.update({
    TableName: 'Lists',
    Key: { id: event.list_id, },
    UpdateExpression: 'SET #tasks.#id = :new_task',
    ExpressionAttributeNames: {
      '#tasks': 'tasks',
      '#id': task.id,
    },
    ExpressionAttributeValues: {
      ':new_task': task,
    },
    ReturnValues: 'ALL_NEW'
  }).promise()
  
  console.log(`Got list '${list.title}':`, list)
  console.log(`Getting user data...`)

  const { Item: user } = await db.get({
    TableName: 'Users',
    Key: { id: user_id },
    AttributesToGet: [ 'id', 'nickname' ]
  }).promise()

  console.log(`Publishing message to topic...`)

  const sns = new AWS.SNS()
  await sns.publish({
    TopicArn: list.topic_arn,
    Message: JSON.stringify({
      type: 'task_created',
      user_id: user.id,
      user_nickname: user.nickname,
      task,
      list_title: list.title,
      list_id: list.id,
    }),
  }).promise()

  console.log(`Published message to topic`)

  return {
    statusCode: 200,
    body: task,
  }
}