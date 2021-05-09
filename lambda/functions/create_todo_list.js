const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  ['title', 'owner_id'].forEach(key => {
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

  let db = new AWS.DynamoDB.DocumentClient()
  await db.put({
    TableName: 'Lists',
    Item: list,
  }).promise()

  await db.update({
    TableName: 'Users',
    Key: { id: event.owner_id },
    UpdateExpression: 'SET #list_ids = list_append(#list_ids, :new_list_id)',
    ExpressionAttributeNames: { '#list_ids': 'list_ids' },
    ExpressionAttributeValues: { ':new_list_id': [list.id] }
  }).promise()

  return {
    statusCode: 200,
    body: list,
  };
};
