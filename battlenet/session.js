const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function getSession(state) {
    console.log('Getting session...');
    console.log('State:', state);

    const getSessionParams = {
        TableName: 'boe.zip-user-data',
        Key: {
            'SessionId': state
        }
    };
    const session = await dynamoDB.get(getSessionParams).promise();

    console.log('Session:', session);

    return session;
}

async function putSession(session_id, data) {
    console.log('Putting session...');
    console.log('Session ID:', session_id);
    console.log('Data:', data);

    const putParams = {
        TableName: 'boe.zip-user-data',
        Item: {
            'SessionId': session_id,
            'Data': data
        }
    };
    const result = await dynamoDB.put(putParams).promise();

    console.log('Put result:', result);

    return result;
}

module.exports = { getSession, putSession };
