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
                }
            };
        }else if (event.queryStringParameters && event.queryStringParameters.session_id) {
            const sessionId = event.queryStringParameters.session_id;
            console.log("session id:", sessionId);

            // Retrieve the session from DynamoDB
            const session = await getSession(sessionId);
            console.log("session:", session);

            const token = session.Item.AccessToken
            console.log("token id:", token);


            // Get user info
            const userInfo = await getUserInfo(token, 'eu'); // replace 'eu' with the appropriate region
            console.log("User info:", userInfo);

            
            const url = `https://www.boe.zip/?user_info=${userInfo}`;
            return {
                statusCode: 302,
                headers: {
                    Location: url,
                },
                body: userInfo  
                




                //####################################################################
                // todo: ab hier nochmal gucken, umbauen zu fetch und weg von den queryParams
                //##################################################################







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