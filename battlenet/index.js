const uuid = require('uuid');
const { getAccessToken, getAuthUrl } = require('./auth');
const { getSession, putSession } = require('./session');
const getUserInfo = require('./getUserInfo');

exports.handler = async (event) => {
    try {
        console.log("Event:", event);
        if (event.queryStringParameters && event.queryStringParameters.code) {
            const code = event.queryStringParameters.code;
            const state = event.queryStringParameters.state;
            console.log("Code:", code);
            console.log("State:", state);

            // Retrieve the session from DynamoDB
            const session = await getSession(state);
            console.log("Session:", session);

            if (!session.Item || session.Item.SessionId !== state) {
                throw new Error('State does not match');
            }

            const access_token = await getAccessToken(code);
            console.log("Access token:", access_token);

            // Get user info
            const userInfo = await getUserInfo(access_token, 'eu'); // replace 'eu' with the appropriate region
            console.log("User info:", userInfo);

            const session_id = uuid.v4();
            console.log("Session ID:", session_id);

            await putSession(session_id, { access_token, userInfo });

            const url = `https://www.boe.zip/?session_id=${session_id}`;
            console.log("Redirecting to:", url);
            return {
                statusCode: 302,
                headers: {
                    Location: url,
                    'Set-Cookie': `session_id=${session_id}; Secure; SameSite=None; UserInfo=${JSON.stringify(userInfo)}`
                }
            };
        } else {
            const state = uuid.v4();
            console.log("State:", state);

            await putSession(state, state);

            const url = getAuthUrl(state);
            console.log("Redirecting to:", url);
            return {
                statusCode: 302,
                headers: {
                    Location: url
                }
            };
        }
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: 'An error occurred: ' + error.toString()
        };
    }
};