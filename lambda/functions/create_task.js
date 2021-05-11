const AWS = require('aws-sdk')
const { v4: uuid } = require('uuid')

exports.handler = async (event) => {
  ['title', 'user_id', 'list_id'].forEach(key => {
    if (!event[key])
      throw new Error(`${key} parameter is missing`)
  })

  const task = {
    title: event.title,
    description: event.description ?? '',
    id: uuid(),
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
  console.log(`Publishing message to topic...`)

  const notification_data = {
    type: 'task_created',
    task,
    list_title: list.title,
    list_id: list.id,
  }

  const sns = new AWS.SNS()
  await sns.publish({
    TopicArn: list.topic_arn,
    Message: JSON.stringify(notification_data),
  }).promise()

  console.log(`Published message to topic`)

  return {
    statusCode: 200,
    body: task,
  }
}