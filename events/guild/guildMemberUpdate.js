const axios = require("axios");
const { PermissionsBitField } = require("discord.js");

/**
 * @param {any} client
 * @param {import("discord.js").GuildMember} oldMember
 * @param {import("discord.js").GuildMember} newMember
 * @returns {Promise<void>}
**/
module.exports.run = async(client, oldMember, newMember) => {

    // try {

    //     let wasAdmin = oldMember?.permissions?.has(PermissionsBitField.Flags.Administrator) || false;
    //     let isAdmin = newMember?.permissions?.has(PermissionsBitField.Flags.Administrator) || false;
        
    //     // if((wasAdmin && !isAdmin) || (!wasAdmin && isAdmin)) axios({
    //     //     method: 'delete',
    //     //     timeout: 5000,
    //     //     url: `${client.config.public_api.url}/users/${oldMember.id}/cache`,
    //     //     headers: { 'Authorization': `ApiKey ${client.config.public_api.key}` },
    //     // }).then(() => {}).catch(() => {})
    // } catch (e) {
    // }

}