const AWS = require('aws-sdk')

exports.handler = async (event) => {
  ['title', 'user_id', 'list_id'].forEach(key => {
    if (!event[key])
      throw new Error(`${key} parameter is missing`)
  })

  const task = {
    title: event.title,
    description: event.description ?? '',
    id: event.id,
    list_id: event.list_id,
    creator_id: event.user_id,
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
    Key: { id: event.user_id },
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