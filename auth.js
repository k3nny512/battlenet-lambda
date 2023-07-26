const axios = require('axios');
const querystring = require('querystring');

const client_id =  process.env.client_ID;
const client_secret = process.env.client_secret;
const redirect_uri = process.env.redirect_uri;

async function getAccessToken(code) {
    const response = await axios.post('https://eu.battle.net/oauth/token', querystring.stringify({
        grant_type: 'authorization_code',
        client_id: client_id,
        client_secret: client_secret,
        code: code,
        redirect_uri: redirect_uri
    }));
    return response.data.access_token;
}

function getAuthUrl(state) {
    const authParams = querystring.stringify({
        client_id: client_id,
        redirect_uri: redirect_uri,
        response_type: 'code',
        scope: 'openid',
        state: state
    });
    return 'https://eu.battle.net/oauth/authorize?' + authParams;
}

module.exports = { getAccessToken, getAuthUrl };