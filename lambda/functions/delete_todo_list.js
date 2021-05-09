const AWS = require('aws-sdk')

exports.handler = async (event) => {
  if (!event.id)
    throw new Error(`id parameter is missing`)

  let db = new AWS.DynamoDB.DocumentClient()
  await db.delete({
    TableName: 'Lists',
    Key: { id: event.id }
  }).promise()

  return {
    statusCode: 200,
    body: {},
  };
};
