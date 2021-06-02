const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')
const verify_parameters = require('./verify_parameters')

exports.handler = async (event) => {
  console.log(`Verifying parameters...`)

  const { missing_keys, unwanted_keys} = verify_parameters(event, ['notification_token'])

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
      Enabled: 'true',
    }
  }).promise()

  return {
    statusCode: 200,
  }
}