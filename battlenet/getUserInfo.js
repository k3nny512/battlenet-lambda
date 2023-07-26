const getUserInfo = async (access_token, region) => {
    console.log('Getting user info...');

    const response = await axios.get(`https://${region}.battle.net/oauth/userinfo`, {
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    });

    console.log('User info:', response.data);

    return response.data;
};