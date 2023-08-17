const axios = require('axios');

const getUserInfo = async (access_token, region) => {
    console.log('Getting user info...');
    console.log('Access token:', access_token);
    console.log('Region:', region);

    const response = await axios.get(`https://${region}.battle.net/oauth/userinfo`, {
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    });

    console.log('User info:', response.data);

    return response.data;
};

module.exports = getUserInfo;