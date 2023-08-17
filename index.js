const uuid = require('uuid');
const { getAccessToken, getAuthUrl } = require('./auth');
const { getSession, putSession } = require('./session');
const getUserInfo = require('./getUserInfo');

exports.handler = async (event) => {
    try {
        if (event.queryStringParameters && event.queryStringParameters.code) {
            const code = event.queryStringParameters.code;
            const state = event.queryStringParameters.state;

            // Retrieve the session from DynamoDB
            const session = await getSession(state);

            if (!session.Item || session.Item.SessionId !== state) {
                throw new Error('State does not match');
            }

            const access_token = await getAccessToken(code);

            const session_id = uuid.v4();

            await putSession(session_id, access_token);

            const url = `https://www.boe.zip/?session_id=${session_id}`;
            return {
                statusCode: 302,
                headers: {
                    Location: url,
                    'Set-Cookie': `session_id=${session_id}; Secure; SameSite=None`
                }
            };
        }else if (event.queryStringParameters && event.queryStringParameters.session_id) {
            const sessionId = event.queryStringParameters.session_id;
            // Now you can work with the sessionId
            // For example, retrieve data associated with this session ID from your database




            // Get user info
            const userInfo = await getUserInfo(sessionId, 'eu'); // replace 'eu' with the appropriate region
            console.log("User info:", userInfo);

            return userInfo;

        } else {
            const state = uuid.v4();

            await putSession(state, state);

            const url = getAuthUrl(state);
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