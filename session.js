const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function getSession(state) {
    const getSessionParams = {
        TableName: 'boe.zip-user-data',
        Key: {
            'SessionId': state
        }
    };
    return await dynamoDB.get(getSessionParams).promise();
}

async function putSession(session_id, access_token) {
    const putParams = {
        TableName: 'boe.zip-user-data',
        Item: {
            'SessionId': session_id,
            'AccessToken': access_token
        }
    };
    return await dynamoDB.put(putParams).promise();
}

module.exports = { getSession, putSession };