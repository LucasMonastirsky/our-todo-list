const AWS = require('aws-sdk')

exports.handler = async (event) => {
  if (!event.id)
    throw new Error(`id parameter is missing`)

  console.log(`List ID: ${event.id}`)
  console.log(`Deleting list in DB...`)

  const db = new AWS.DynamoDB.DocumentClient()
  const { Attributes: list } = await db.delete({
    TableName: 'Lists',
    Key: { id: event.id },
    ReturnValues: 'ALL_OLD',
  }).promise()

  const member_ids = [...JSON.parse(JSON.stringify(list.member_ids))].filter(x => x !== '')

  console.log(`Getting members...`)

  const { Responses } = await db.batchGet({
    RequestItems: {
      'Users': {
        ConsistentRead: true,
        Keys: member_ids.map(id => ({id}))
      }
    }
  }).promise()
  const members = Responses.Users

  console.log(`Updating members...`)

  const mapUser = (user) => {
    const i = user.list_ids.indexOf(list.id)
    user.list_ids.splice(i, 1)
    return { PutRequest: { Item: user } }
  }

  await db.batchWrite({
    RequestItems: {
      'Users': members.map(mapUser)
    }
  }).promise()

  console.log(`Deleting SNS topic...`)

  const sns = new AWS.SNS()
  await sns.deleteTopic({TopicArn: list.topic_arn}).promise()

  console.log(`Done!`)

  return {
    statusCode: 200,
    body: {},
  };
};
