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

            // Get user info
            const userInfo = await getUserInfo(access_token, 'eu'); // replace 'eu' with the appropriate region

            const session_id = uuid.v4();

            await putSession(session_id, { access_token, userInfo });

            const url = `https://www.boe.zip/?session_id=${session_id}`;
            return {
                statusCode: 302,
                headers: {
                    Location: url,
                    'Set-Cookie': `session_id=${session_id}; Secure; SameSite=None; UserInfo=${JSON.stringify(userInfo)}`
                }
            };
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
