const { getInfo } = require("discord-hybrid-sharding");
const { EmbedBuilder, Status } = require("discord.js");

module.exports = {
    name: "shards-info",
    category: { "en": "admindev", "fr": "admindev" },
    description: "Liste les shards du bot.",
    staff_level: 2,
    run: async(client, interaction) => {

        console.log(getInfo())

        let promises = await Promise.all([
            client.cluster.fetchClientValues("guilds.cache.size"),
            client.cluster.fetchClientValues("ws.ping"),
            client.cluster.fetchClientValues("ws.status"),
        ])

        let embed = new EmbedBuilder()
            .setTitle("Informations des shards")
            .setColor("Green")
            .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.member.displayAvatarURL() });

        for(let i = 0; i < client.cluster.count; i++) {
            let guilds = promises[0][i].toLocaleString();
            let ping = promises[1][i].toLocaleString();
            let status = promises[2][i];
            embed.addFields([{ name: `Shard ${i}`, value: `${guilds} serveurs\nPing: ${ping}ms\nStatus: ${Status[status]}`, inline: true }]);
        }

        interaction.reply({ embeds: [embed] });

    }

}