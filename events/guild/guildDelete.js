const { EmbedBuilder, WebhookClient, time } = require("discord.js");
const { serversLogsURL } = require("../../config");

const serverLog = new WebhookClient({ url: serversLogsURL });

module.exports.run = async(client, guild) => {

        if(!guild.available) return;

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle(`${guild.name} - ${guild.id}`)
            .setThumbnail(guild.iconURL())
            .setDescription(`・**Owner :** <@${guild.ownerId}> (${guild.ownerId})
・Created on ${time(new Date(guild.createdTimestamp), "d")}
・**${guild.memberCount}** members
・Shard **n°${guild.shard.id}/${client.cluster.count - 1}**
・Removal of **SkyRoleplay** on the server.

\`\`\`SkyRoleplay is now on ${await client.functions.other.total(client, "guilds")} servers !\`\`\``)
            .setFooter({ text: `© SkyRoleplay`, iconURL: client.user.displayAvatarURL() })
            .setTimestamp()
        
        serverLog.send({ embeds: [embed] });

}

