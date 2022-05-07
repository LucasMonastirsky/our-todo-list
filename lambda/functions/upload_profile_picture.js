const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')
const verify_parameters = require('./verify_parameters')
const sizeOf = require('image-size')
const withLogBuffer = require('./log_buffer')

exports.handler = withLogBuffer(async (buffer, event) => {
  buffer.log(`Verifying parameters...`)

  const { missing_keys, unwanted_keys} = verify_parameters(event, ['blob'])

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

  buffer.log(`Verifying image...`)

  const image = Buffer.from(event.blob, 'base64')
  const dimensions = sizeOf(image)

  const max_size = 128
  if (dimensions.width > max_size || dimensions.height > max_size) {
    buffer.error(`Image is too large (${dimensions.width}x${dimensions.height})`)
  }

  buffer.log(`Uploading to S3...`)

  const s3 = new AWS.S3();
  await s3.putObject({
    Bucket: 'our-todo-profile-pictures',
    Key: user_id,
    Body: image,
    ACL: 'public-read',
    ContentType: "image/png",
    ContentEncoding: "base64"
  }).promise()

  buffer.log(`Done!`)

  return {
    statusCode: 200,
  }
})