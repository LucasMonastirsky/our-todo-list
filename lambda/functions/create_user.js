const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')
const verify_parameters = require('./verify_parameters')
const withLogBuffer = require('./log_buffer')

exports.handler = withLogBuffer(async (buffer, event) => {
  buffer.log(`Verifying parameters...`)

  const { missing_keys, unwanted_keys} = verify_parameters(event, ['username', 'notification_token'])

  if (missing_keys) return {
    statusCode: 400,
    error: `Missing parameters: ${missing_keys}`
  }

  if (unwanted_keys) return {
    statusCode: 400,
    error: `Invalid parameters: ${unwanted_keys}`
  }

  buffer.log(`Verifying JWT...`)

  const { user_id, error } = jwt_verifier.verify(event.jwt)
  if (error) return {
    statusCode: 401,
    error: error.message,
  }

  // TODO: validate user_id against Cognito user pool

  const user = {
    nickname: event.username,
    username: event.username,
    id: user_id,
    image: `https://i.stack.imgur.com/l60Hf.png`,
    list_ids: [],
  }

  buffer.log(`Creating Platform Application Endpoint...`)
  const sns = new AWS.SNS()
  const sns_result = await sns.createPlatformEndpoint({
    PlatformApplicationArn: process.env.PLATFORM_APPLICATION_ARN,
    Token: event.notification_token,
  }).promise()

  buffer.log(`Adding user to database...`)
  const db = new AWS.DynamoDB.DocumentClient()
  await db.put({
    TableName: 'Users',
    Item: { ...user, notification_arn: sns_result.EndpointArn }
  }).promise()

  return {
    statusCode: 200,
    body: user,
  }
})