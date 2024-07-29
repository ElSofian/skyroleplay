const { EmbedBuilder, WebhookClient, time } = require("discord.js");
const { serversLogsURL } = require("../../config");

module.exports.run = async(client, guild) => {

        if (!guild.available) return;
        if (["727930269998383226"].includes(guild.id)) return guild.leave(); // Blacklisted server

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle(`${guild.name} - ${guild.id}`)
            .setThumbnail(guild.iconURL())
            .setDescription(`・**Owner :** <@${guild.ownerId}> (${guild.ownerId})
・Created on ${time(new Date(guild.createdTimestamp), "d")}
・**${guild.memberCount}** members
・Shard **n°${guild.shard.id}/${client.cluster.count - 1}**
・Addition of **SkyRoleplay** on the server.

\`\`\`SkyRoleplay is now on ${await client.functions.other.total(client, "guilds")} servers !\`\`\``)
            .setFooter({ text: `© SkyRoleplay`, iconURL: client.user.displayAvatarURL() })
            .setTimestamp()
            
        // serverLog.send({ embeds: [embed] });

}
