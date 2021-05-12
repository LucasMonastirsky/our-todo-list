const AWS = require('aws-sdk')

exports.handler = async (event) => {
  ['user_id', 'invited_user_id', 'list_id'].forEach(key => {
    if (!event[key])
      throw new Error(`${key} parameter is missing`)
  })

  // TODO: updates should be batched together and cancelled if an error is thrown in either one

  console.log(`Updating list...`)

  const db = new AWS.DynamoDB.DocumentClient()
  const { Attributes: list } = await db.update({
    TableName: 'Lists',
    Key: { id: event.list_id },
    UpdateExpression: 'ADD member_ids :user_id',
    ExpressionAttributeValues: { ':user_id': db.createSet([event.invited_user_id]) },
    ReturnValues: 'ALL_NEW',
  }).promise()

  console.log(`Updating user...`)

  const { Attributes: invited_user } = await db.update({
    TableName: 'Users',
    Key: { id: event.invited_user_id },
    UpdateExpression: 'SET list_ids = list_append(list_ids, :value)',
    ExpressionAttributeValues: { ':value': [event.list_id] },
    ReturnValues: 'ALL_NEW',
  }).promise()

  console.log(`Getting sender user...`)

  const { Item: sender_user } = await db.get({
    TableName: 'Users',
    Key: { id: event.user_id },
    AttributesToGet: [ 'nickname' ]
  }).promise()

  console.log(`Subscribing user to topic...`)

  const sns = new AWS.SNS()
  await sns.subscribe({
    Protocol: 'application',
    TopicArn: list.topic_arn,
    Endpoint: invited_user.notification_arn,
  }).promise()

  console.log(`Sending notification to user...`)

  await sns.publish({
    TargetArn: invited_user.notification_arn,
    Message: JSON.stringify({
      type: 'added_to_list',
      user_id: event.user_id,
      sender_nickname: sender_user.nickname,
      list,
    })
  })

  console.log(`Done`)

  return { statusCode: 200 }
}