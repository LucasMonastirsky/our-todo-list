const AWS = require('aws-sdk')

exports.handler = async (event) => {
  ['notification_arn', 'notification_token'].forEach(key => {
    if (!event[key])
      throw new Error(`${key} parameter is missing`)
  })

  console.log(`Updating token...`)
  const sns = new AWS.SNS()
  await sns.setEndpointAttributes({
    EndpointArn: event.notification_arn,
    Attributes: {
      Token: event.notification_token,
    }
  }).promise()

  return {
    statusCode: 200,
  }
}