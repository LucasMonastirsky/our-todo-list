const AWS = require('aws-sdk')

exports.handler = async (event) => {
  const task = {
    title: event.title,
    description: event.description ?? '',
    id: require('uuid').v4(),
    list_id: event.list_id,
    creator_id: event.user_id,
    creation_date: Date.now(),
    status: 'Pending',
    position: 0,
  }

  const db = new AWS.DynamoDB.DocumentClient()

  await db.update({
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
  }).promise()

  return {
    statusCode: 200,
    body: task,
  }
}