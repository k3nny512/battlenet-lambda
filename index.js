const axios = require('axios');
const querystring = require('querystring');
const uuid = require('uuid');
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const client_id =  process.env.client_ID;
    const client_secret = process.env.client_secret;
    const redirect_uri = process.env.redirect_uri;

    try {
        if (event.queryStringParameters && event.queryStringParameters.code) {
            const code = event.queryStringParameters.code;
            const state = event.queryStringParameters.state;

            // Retrieve the session from DynamoDB
            const getSessionParams = {
                TableName: 'boe.zip-user-data',
                Key: {
                    'SessionId': state
                }
            };
            const session = await dynamoDB.get(getSessionParams).promise();

            if (!session.Item || session.Item.SessionId !== state) {
                throw new Error('State does not match');
            }

            const response = await axios.post('https://eu.battle.net/oauth/token', querystring.stringify({
                grant_type: 'authorization_code',
                client_id: client_id,
                client_secret: client_secret,
                code: code,
                redirect_uri: redirect_uri
            }));
            const access_token = response.data.access_token;

            const session_id = uuid.v4();

            const putParams = {
                TableName: 'boe.zip-user-data',
                Item: {
                    'SessionId': session_id,
                    'AccessToken': access_token
                }
            };

            dynamoDB.put(putParams, function(err, data) {
                if (err) {
                    console.error("Error storing item in DynamoDB", err);
                    return {
                        statusCode: 500,
                        body: 'An error occurred: ' + err.toString()
                    };
                }
            });

            const url = `https://www.boe.zip/?session_id=${session_id}`;
            return {
                statusCode: 302,
                headers: {
                    Location: url,
                    'Set-Cookie': `session_id=${session_id}; Secure; SameSite=None`
                }
            };
        } else {
            const state = uuid.v4();

            const putParams = {
                TableName: 'boe.zip-user-data',
                Item: {
                    'SessionId': state,
                    'State': state
                }
            };

            dynamoDB.put(putParams, function(err, data) {
                if (err) {
                    console.error("Error storing item in DynamoDB", err);
                    return {
                        statusCode: 500,
                        body: 'An error occurred: ' + err.toString()
                    };
                }
            });

            const authParams = querystring.stringify({
                client_id: client_id,
                redirect_uri: redirect_uri,
                response_type: 'code',
                scope: 'openid',
                state: state
            });
            const url = 'https://eu.battle.net/oauth/authorize?' + authParams;
            return {
                statusCode: 302,
                headers: {
                    Location: url
                }
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: 'An error occurred: ' + error.toString()
        };
    }
};
