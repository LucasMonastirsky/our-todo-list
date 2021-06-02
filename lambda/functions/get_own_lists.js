const AWS = require('aws-sdk')
const jwt_verifier = require('./jwt_verifier')

exports.handler = async (event) => {
  console.log(`Verifying JWT...`)

  const { user_id, error } = jwt_verifier.verify(event.jwt)
  if (error) return {
    statusCode: 401,
    error: error.message
  }

  console.log(`Fetching user...`)

  const db = new AWS.DynamoDB.DocumentClient()
  const { Item: user } = await db.get({
    TableName: 'Users',
    Key: { id: user_id },
  }).promise()

  console.log(`Fetching lists...`)

  const { Responses: { Lists: lists } } = await db.batchGet({
    RequestItems: {
      'Lists': {
        ConsistentRead: true,
        Keys: user.list_ids.map(id => ({id}))
      }  
    }
  }).promise()

  if (lists.length !== user.list_ids.length) {
    console.warn(`Number of found lists does not match number of list ids in user data; missing ids:`)
    console.warn(lists.filter(list => !user.list_ids.includes(list.id)).map(list => list.id))
  }

  console.log(`Formatting lists...`)

  lists.forEach(list => {
    list.member_ids = list.member_ids ? [...JSON.parse(JSON.stringify(list.member_ids))] : []
    delete list.topic_arn
  })

  console.log(`Done!`)
  
  return {
    statusCode: 200,
    body: lists,
  }
}