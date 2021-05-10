const AWS = require('aws-sdk')

exports.handler = async (event) => {
  ['username', 'user_id', 'notification_token'].forEach(key => {
    if (!event[key])
      throw new Error(`${key} parameter is missing`)
  })

  const user = {
    nickname: event.username,
    username: event.username,
    id: event.user_id,
    image: `https://i.stack.imgur.com/l60Hf.png`,
    list_ids: [],
  }

  console.log(`Creating Platform Application Endpoint...`)
  const sns = new AWS.SNS()
  const sns_result = await sns.createPlatformEndpoint({
    PlatformApplicationArn: process.env.PLATFORM_APPLICATION_ARN,
    Token: event.notification_token,
  }).promise()

  console.log(`Adding user to database...`)
  const db = new AWS.DynamoDB.DocumentClient()
  await db.put({
    TableName: 'Users',
    Item: { ...user, notification_arn: sns_result.EndpointArn }
  }).promise()

  return {
    statusCode: 200,
    body: user,
  }
}