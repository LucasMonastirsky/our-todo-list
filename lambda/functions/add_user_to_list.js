const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')
const verify_parameters = require('./verify_parameters')

exports.handler = async (event) => {
  console.log(`Verifying parameters...`)

  const { missing_keys, unwanted_keys} = verify_parameters(event, ['invited_user_id', 'list_id'])

  if (missing_keys) return {
    statusCode: 400,
    error: `Missing parameters: ${missing_keys}`
  }

  if (unwanted_keys) return {
    statusCode: 400,
    error: `Invalid parameters: ${unwanted_keys}`
  }

  console.log(`Verifying JWT...`)

  const { user_id, error } = jwt_verifier.verify(event.jwt)
  if (error) return {
    statusCode: 401,
    error: error.message,
  }

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
    Key: { id: user_id },
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
      user_id: user_id,
      sender_nickname: sender_user.nickname,
      list,
    })
  }).promise()

  console.log(`Done`)

  return { statusCode: 200 }
}