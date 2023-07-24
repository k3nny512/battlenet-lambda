const axios = require('axios');
const querystring = require('querystring');
const uuid = require('uuid');

// A simple in-memory session store
const sessions = {};

exports.handler = async (event) => {
    // Your client ID, secret, and redirect URI
    const client_id = 'dd7c83308992421c84c3d38f2547aa56';
    const client_secret = 'iSA6h96WVw4UWWSyObbJ0nhfdI7ch3Vc';
    const redirect_uri = 'https://i8q13x3b0b.execute-api.eu-central-1.amazonaws.com/default/battlenet';

    try {
        // Check if we've been redirected back from Battle.net
        if (event.queryStringParameters && event.queryStringParameters.code) {
            // We have an authorization code, exchange it for an access token
            const code = event.queryStringParameters.code;
            const response = await axios.post('https://eu.battle.net/oauth/token', querystring.stringify({
                grant_type: 'authorization_code',
                client_id: client_id,
                client_secret: client_secret,
                code: code,
                redirect_uri: redirect_uri
            }));
            const access_token = response.data.access_token;

            // Create a new session
            const session_id = uuid.v4();
            sessions[session_id] = {
                access_token: access_token
            };

            // Redirect back to your website with the session ID in a secure HTTP-only cookie
            const url = 'http://127.0.0.1:5500/index.html';
            return {
                statusCode: 302,
                headers: {
                    Location: url,
                    'Set-Cookie': `session_id=${session_id}; Secure; HttpOnly`
                }
            };
        } else {
            // Redirect the user to the Battle.net login page
            const params = querystring.stringify({
                client_id: client_id,
                redirect_uri: redirect_uri,
                response_type: 'code',
                scope: 'openid'
            });
            const url = 'https://eu.battle.net/oauth/authorize?' + params;
            return {
                statusCode: 302,
                headers: {
                    Location: url
                }
            };
        }
    } catch (error) {
        // An error occurred, return a 500 Internal Server Error response
        return {
            statusCode: 500,
            body: 'An error occurred: ' + error.toString()
        };
    }
};