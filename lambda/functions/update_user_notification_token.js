const AWS = require('aws-sdk')

exports.handler = async (event) => {
  ['user_id', 'notification_token'].forEach(key => {
    if (!event[key])
      throw new Error(`${key} parameter is missing`)
  })

  console.log(`Getting user's ARN from DynamoDB...`)

  const db = new AWS.DynamoDB.DocumentClient()
  const user_result = await db.get({
    TableName: 'Users',
    Key: { id: event.user_id },
    AttributesToGet: ['notification_arn']
  }).promise()

  console.log(`Updating token...`)
  const sns = new AWS.SNS()
  await sns.setEndpointAttributes({
    EndpointArn: user_result.Item.notification_arn,
    Attributes: {
      Token: event.notification_token,
    }
  }).promise()

  return {
    statusCode: 200,
  }
}