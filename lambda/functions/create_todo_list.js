const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  ['title', 'owner_id', 'notification_token'].forEach(key => {
    if (!event[key])
      throw new Error(`${key} parameter is missing`)
  })

  const list = {
    ...event,
    description: event.description ?? '',
    id: `${uuidv4()}`,
    tasks: {},
    member_ids: [event.owner_id],
  }

  console.log(`Formatted list: `, list)
  console.log(`Putting list into DynamoDB...`)

  let db = new AWS.DynamoDB.DocumentClient()
  await db.put({
    TableName: 'Lists',
    Item: list,
  }).promise()

  console.log(`Updating user with new list id...`)

  await db.update({
    TableName: 'Users',
    Key: { id: event.owner_id },
    UpdateExpression: 'SET #list_ids = list_append(#list_ids, :new_list_id)',
    ExpressionAttributeNames: { '#list_ids': 'list_ids' },
    ExpressionAttributeValues: { ':new_list_id': [list.id] }
  }).promise()

  console.log(`Creating topic...`)
  const topic = await new AWS.SNS().createTopic({Name: list.id}).promise()
  console.log(`Created topic with ARN ${topic.TopicArn}`)

  return {
    statusCode: 200,
    body: list,
  };
};
