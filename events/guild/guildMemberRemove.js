const axios = require('axios');

module.exports.run = async(client, member) => {
    await client.db.resetMember(member.guild.id, member.id).catch(() => {});
    // axios({
    //     method: 'delete',
    //     timeout: 5000,
    //     url: `${client.config.public_api.url}/users/${member.id}/cache`,
    //     headers: { 'Authorization': `ApiKey ${client.config.public_api.key}` },
    // }).then(() => {}).catch(() => {})
}
