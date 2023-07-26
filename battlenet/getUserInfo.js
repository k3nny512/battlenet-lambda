const axios = require('axios');

async function getUserInfo(accessToken, region) {
    const response = await axios.get(`https://${region}.api.battle.net/wow/user/characters`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    return response.data;
}

module.exports = getUserInfo;