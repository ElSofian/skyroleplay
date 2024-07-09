const { CommandInteraction, EmbedBuilder } = require("discord.js");

/**
 * Sends a server log
 * @param {CommandInteraction} interaction
 * @param {EmbedBuilder} embed
 * @param {"creation" | "deletion" | "edition" | "info"} mode
 * @param {EmbedBuilder[]} [otherEmbeds]
 */
module.exports = class Logs {
    
    constructor(client, options) {
        this.client = client;
        this.options = options;
    }

    
    send = async (interaction, embed, mode, ...otherEmbeds) => {
        
        const globalCityName = await this.client.db.getOption(interaction.guildId, "global.city_name");
        const channelLogs = await this.client.db.getOption(interaction.guildId, "channel.logs")
        const channel = interaction.guild.channels.cache.get(channelLogs);
        if(!channel) return;

        embed.setFooter({ text: globalCityName || interaction.guild.name, iconURL: interaction.guild.iconURL() }).setTimestamp();

        switch (mode) {
            case "creation":
                embed.setColor("Green").setTitle(`${this.client.constants.emojis.add} ${embed.data.title}`);
                break;
            case "deletion":
                embed.setColor("Red").setTitle(`${this.client.constants.emojis.remove} ${embed.data.title}`);
                break;
            case "edition":
                embed.setColor("Gold").setTitle(`${this.client.constants.emojis.edit} ${embed.data.title}`);
                break;
            case "info":
            default:
                embed.setColor("Grey").setTitle(`${this.client.constants.emojis.link} ${embed.data.title}`);
                break;
        }

        channel.send({ embeds: [embed, ...otherEmbeds] }).catch(() => { });

    };

}
