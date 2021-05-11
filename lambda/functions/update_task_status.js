const AWS = require('aws-sdk')

exports.handler = async (event) => {
  ['task_id', 'user_id', 'list_id'].forEach(key => {
    if (!event[key])
      throw new Error(`${key} parameter is missing`)
  })

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
      '#0': event.status === 'Claimed' ? 'completer_id' : 'claimed_by_id'
    },
    ExpressionAttributeValues: {
      ':0': event.status,
      ':1': event.user_id,
      ':2': (event.status === 'Done' ? Date.now() : undefined)
    },
    ReturnValues: 'ALL_NEW'
  }).promise()
  const task = list.tasks[event.task_id]

  console.log(`Updated task ${task.title}`)
  console.log(`Publishing message to topic...`)

  const sns = new AWS.SNS()
  await sns.publish({
    TopicArn: list.topic_arn,
    Message: JSON.stringify({
      type: event.status === 'Claimed' ? 'task_claimed' : 'task_completed',
      task,
    })
  }).promise()
  
  console.log(`Published message to topic`)

  return {
    statusCode: 200,
    body: task
  }
}