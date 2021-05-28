const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')

exports.handler = async (event) => {
  ['notification_token'].forEach(key => {
    if (!event[key]) return {
      statusCode: 400,
      body: { error: `${key} parameter is missing` }
    }
  })

  const { user_id, error } = jwt_verifier.verify(event.jwt)
  if (error) return {
    statusCode: 401,
    body: { error }
  }

  console.log(`Getting user's ARN from DynamoDB...`)

  const db = new AWS.DynamoDB.DocumentClient()
  const user_result = await db.get({
    TableName: 'Users',
    Key: { id: user_id },
    AttributesToGet: ['notification_arn']
  }).promise()

  console.log(`Updating token...`)
  const sns = new AWS.SNS()
  await sns.setEndpointAttributes({
    EndpointArn: user_result.Item.notification_arn,
    Attributes: {
      Token: event.notification_token,
      Enabled: true,
    }
  }).promise()

  return {
    statusCode: 200,
  }
}