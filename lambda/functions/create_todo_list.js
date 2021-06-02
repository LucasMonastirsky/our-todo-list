const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')
const verify_parameters = require('./verify_parameters')

exports.handler = async (event) => {
  console.log(`Verifying parameters...`)

  const { missing_keys, unwanted_keys} = verify_parameters(event, ['title', 'id'])

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

  const list = {
    ...event,
    description: event.description ?? '',
    tasks: {},
    member_ids: [user_id],
    owner_id: user_id,
  }

  console.log(`Formatted list: `, list)
  console.log(`Creating topic...`)

  const sns = new AWS.SNS()
  const topic = await sns.createTopic({Name: list.id}).promise()
  list.topic_arn = topic.TopicArn

  console.log(`Created topic with ARN ${topic.TopicArn}`)
  console.log(`Putting list into DynamoDB...`)

  let db = new AWS.DynamoDB.DocumentClient()
  await db.put({
    TableName: 'Lists',
    Item: {...list, member_ids: db.createSet(list.member_ids)},
  }).promise()

  console.log(`Updating user with new list id...`)

  const { Attributes: user } = await db.update({
    TableName: 'Users',
    Key: { id: user_id },
    UpdateExpression: 'SET #list_ids = list_append(#list_ids, :new_list_id)',
    ExpressionAttributeNames: { '#list_ids': 'list_ids' },
    ExpressionAttributeValues: { ':new_list_id': [list.id] },
    ReturnValues: 'ALL_NEW',
  }).promise()

  console.log(`Updated user:`, user)
  console.log(`Creating subscription...`)

  const subscription = await sns.subscribe({
    Protocol: 'application',
    TopicArn: topic.TopicArn,
    Endpoint: user.notification_arn,
  }).promise()

  console.log(`Created subscription`)

  return {
    statusCode: 200,
    body: list,
  };
};
